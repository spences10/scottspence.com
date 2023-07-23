import { PUBLIC_FATHOM_ID } from '$env/static/public'
import { fetch_fathom_data } from '$lib/fathom'
import type { ServerlessConfig } from '@sveltejs/adapter-vercel'
import { json } from '@sveltejs/kit'

export const config: ServerlessConfig = {
  runtime: 'nodejs18.x',
}

export const GET = async ({ url, fetch }) => {
  const pathname = url.searchParams.get('pathname') ?? '/'
  const date_grouping = url.searchParams.get('date_grouping') ?? 'day'
  const date_from = url.searchParams.get('date_from')
  const date_to = url.searchParams.get('date_to')
  const sort_by = url.searchParams.get('sort_by')
  const cache_duration = parseInt(
    url.searchParams.get('cache_duration') ?? '1800',
    10,
  )

  const date_params = build_date_params(
    date_from,
    date_to,
    date_grouping,
    sort_by,
  )
  const default_params = build_default_params(pathname)
  const params = { ...default_params, ...date_params }

  const analytics_data = await fetch_fathom_data(
    fetch,
    `aggregations`,
    params,
    cache_duration,
    `page_views_${date_grouping ? date_grouping : 'day'}`,
  )

  if (Array.isArray(analytics_data) && analytics_data.length > 0) {
    return json(
      {
        analytics: analytics_data,
      },
      {
        headers: {
          'X-Robots-Tag': 'noindex, nofollow',
        },
      },
    )
  } else {
    console.error(
      `Analytics API returned data in unexpected format. ${JSON.stringify(
        params,
        null,
        2,
      )}`,
    )
    return json({
      analytics: [],
      message:
        'No analytics data available for the given parameters.',
    })
  }
}

const build_date_params = (
  date_from: string | null,
  date_to: string | null,
  date_grouping: string | null,
  sort_by: string | null,
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
