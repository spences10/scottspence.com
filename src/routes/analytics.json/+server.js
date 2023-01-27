import { FATHOM_API_KEY } from '$env/static/private'
import { PUBLIC_FATHOM_ID } from '$env/static/public'
import { objectToQueryParams } from '@lib/utils'
import { json } from '@sveltejs/kit'

/** @type {import('./$types').RequestHandler} */
export const GET = async ({ url }) => {
  const pathname = url.searchParams.get('pathname') ?? '/'

  const params = {
    entity: 'pageview',
    entity_id: PUBLIC_FATHOM_ID,
    aggregates: 'visits,uniques,pageviews,avg_duration,bounce_rate',
    date_grouping: 'day',
    date_from: '2023-01-27 00:00:00',
    date_to: '2023-01-27 23:59:59',
    field_grouping: 'pathname',
    filters: `[{"property": "pathname","operator": "is","value": "${pathname}"}]`,
  }

  try {
    const getHeaders = new Headers()
    getHeaders.append(`Authorization`, `Bearer ${FATHOM_API_KEY}`)
    const res = await fetch(
      `https://api.usefathom.com/v1/aggregations${objectToQueryParams(
        params
      )}`,
      {
        headers: getHeaders,
      }
    )

    return json({
      analytics: await res.json(),
    })
  } catch (error) {
    return json(
      {
        error: 'Big oof! Sorry' + error,
      },
      {
        status: 500,
      }
    )
  }
}
