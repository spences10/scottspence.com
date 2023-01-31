import { FATHOM_API_KEY } from '$env/static/private'
import { PUBLIC_FATHOM_ID } from '$env/static/public'
import { object_to_query_params } from '$lib/utils'
import { json } from '@sveltejs/kit'

/** @type {import('./$types').RequestHandler} */
export const GET = async ({ url }) => {
  const pathname = url.searchParams.get('pathname') ?? '/'
  const date_grouping = url.searchParams.get('date_grouping') ?? null // 'hour', 'day', 'month', 'year'
  const date_from = url.searchParams.get('date_from') ?? null
  const date_to = url.searchParams.get('date_to') ?? null
  // date_from = '2023-01-20 00:00:00'
  // date_to = '2023-01-27 23:59:59'
  const sort_by = url.searchParams.get('sort_by') ?? null // 'timestamp:desc'

  // https://stackoverflow.com/a/51200448
  const date_params = {
    ...(date_from && { date_from }),
    ...(date_to && { date_to }),
    ...(date_grouping && { date_grouping }),
    ...(sort_by && { sort_by }),
  }

  const default_params = {
    entity: 'pageview',
    entity_id: PUBLIC_FATHOM_ID,
    aggregates: 'visits,uniques,pageviews,avg_duration,bounce_rate',
    field_grouping: 'pathname',
    filters: `[{"property": "pathname","operator": "is","value": "${pathname}"}]`,
  }

  const params = { ...default_params, ...date_params }

  try {
    const headers_auth = new Headers()
    headers_auth.append(`Authorization`, `Bearer ${FATHOM_API_KEY}`)
    const res = await fetch(
      `https://api.usefathom.com/v1/aggregations${object_to_query_params(
        params
      )}`,
      {
        headers: headers_auth,
      }
    )

    return json({
      analytics: await res.json(),
    })
  } catch (error) {
    return json({
      error: 'Big oof! Sorry' + error,
      status: 500,
    })
  }
}
