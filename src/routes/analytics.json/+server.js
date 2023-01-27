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
    aggregates: 'pageviews,visits,uniques',
    date_from: '2022-04-01',
    date_to: '2022-04-02',
    field_grouping: 'pathname',
    date_grouping: 'day',
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
