import { FATHOM_API_KEY } from '$env/static/private'
import { PUBLIC_FATHOM_ID } from '$env/static/public'
import { page_analytics_key } from '$lib/redis'
import {
  cache_response,
  fetch_fathom_data,
  get_data_from_cache,
} from '$lib/utils/fathom'
import type { ServerlessConfig } from '@sveltejs/adapter-vercel'
import { json } from '@sveltejs/kit'

export const config: ServerlessConfig = {
  runtime: 'nodejs18.x',
}

export const GET = async ({ url }) => {
  const pathname = url.searchParams.get('pathname') ?? '/'
  const date_grouping = url.searchParams.get('date_grouping')
  const date_from = url.searchParams.get('date_from')
  const date_to = url.searchParams.get('date_to')
  const sort_by = url.searchParams.get('sort_by')
  const cache_duration = parseInt(
    url.searchParams.get('cache_duration') ?? '1800',
    10
  )

  const date_params = build_date_params(
    date_from,
    date_to,
    date_grouping,
    sort_by
  )
  const default_params = build_default_params(pathname)
  const params = { ...default_params, ...date_params }

  const cache_key = page_analytics_key(`analytics.json${url.search}`)
  const cached = await get_analytics_from_cache(cache_key)

  if (cached) {
    return json({ analytics: cached })
  }

  try {
    const headers_auth = new Headers()
    headers_auth.append('Authorization', `Bearer ${FATHOM_API_KEY}`)

    const analytics_data = await fetch_fathom_data(
      'aggregations',
      params,
      headers_auth
    )

    if (
      analytics_data &&
      'status' in analytics_data &&
      analytics_data.status === 'OK'
    ) {
      await cache_response(cache_key, analytics_data, cache_duration)

      return json(
        {
          analytics: analytics_data,
        },
        {
          headers: {
            'X-Robots-Tag': 'noindex, nofollow',
          },
        }
      )
    } else {
      console.error('Analytics API returned a bad response')
      return json({ analytics: {} })
    }
  } catch (error) {
    if (error instanceof Error) {
      return json({
        error: 'An error occurred: ' + error.message,
        status: 500,
      })
    }
    return json({
      error: 'An unknown error occurred',
      status: 500,
    })
  }
}

const build_date_params = (
  date_from: string | null,
  date_to: string | null,
  date_grouping: string | null,
  sort_by: string | null
) => ({
  ...(date_from && { date_from }),
  ...(date_to && { date_to }),
  ...(date_grouping && { date_grouping }),
  ...(sort_by && { sort_by }),
})

const build_default_params = (pathname: string) => ({
  entity: 'pageview',
  entity_id: PUBLIC_FATHOM_ID,
  aggregates: 'visits,uniques,pageviews,avg_duration,bounce_rate',
  field_grouping: 'pathname',
  filters: `[{"property": "pathname","operator": "is","value": "${pathname}"}]`,
})

const get_analytics_from_cache = async (cache_key: string) => {
  return get_data_from_cache(cache_key)
}
