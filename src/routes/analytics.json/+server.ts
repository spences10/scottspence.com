import { FATHOM_API_KEY } from '$env/static/private'
import { PUBLIC_FATHOM_ID } from '$env/static/public'
import redis, { page_analytics_key } from '$lib/redis'
import { object_to_query_params } from '$lib/utils'
import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'

export const GET: RequestHandler = async ({ url }) => {
  const pathname = url.searchParams.get('pathname') ?? '/'
  const date_grouping = url.searchParams.get('date_grouping')
  const date_from = url.searchParams.get('date_from')
  const date_to = url.searchParams.get('date_to')
  const sort_by = url.searchParams.get('sort_by')

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

    const analytics_data = await fetch_analytics_data(
      params,
      headers_auth,
      `analytics.json${url.search}`
    )

    return json({
      analytics: analytics_data,
    })
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

const fetch_analytics_data = async (
  params: { [s: string]: unknown } | ArrayLike<unknown>,
  headers: Headers,
  search: string
) => {
  const cache_key = page_analytics_key(search)

  const res = await fetch(
    `https://api.usefathom.com/v1/aggregations${object_to_query_params(
      params
    )}`,
    {
      headers,
    }
  )

  if (!res.ok) {
    throw new Error(`HTTP error ${res.status}: ${res.statusText}`)
  }

  const analytics_data = await res.json()
  await cache_analytics_response(cache_key, analytics_data)

  return analytics_data
}

const get_analytics_from_cache = async (cache_key: string) => {
  try {
    const cached = await redis.get(cache_key)
    if (cached) {
      return JSON.parse(cached)
    }
  } catch (e) {
    console.error(`Error fetching analytics from cache: ${e}`)
  }
  return null
}

const cache_analytics_response = async (
  cache_key: string,
  analytics_data: any
) => {
  try {
    await redis.set(
      cache_key,
      JSON.stringify(analytics_data),
      'EX',
      15 * 60
    )
  } catch (e) {
    console.error(`Error caching analytics response: ${e}`)
  }
}
