import { FATHOM_API_KEY } from '$env/static/private'
import { PUBLIC_FATHOM_ID } from '$env/static/public'
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

  try {
    const headers_auth = new Headers()
    headers_auth.append('Authorization', `Bearer ${FATHOM_API_KEY}`)

    const analytics_data = await fetch_analytics_data(
      params,
      headers_auth
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
  headers: Headers
) => {
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

  return await res.json()
}
