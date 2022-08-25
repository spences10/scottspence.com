import { json as json$1 } from '@sveltejs/kit'

// @migration task: Check imports
export const GET = async () => {
  const FATHOM_API_KEY = process.env['FATHOM_API_KEY']
  try {
    const getHeaders = new Headers()
    getHeaders.append(`Authorization`, `Bearer ${FATHOM_API_KEY}`)
    const encURI = encodeURI(
      `[{"property": "pathname","operator": "is","value": "/"}]`
    )
    const res = await fetch(
      `https://api.usefathom.com/v1/aggregations?entity=pageview&entity_id=${
        import.meta.env.VITE_FATHOM_ID
      }&aggregates=pageviews&field_grouping=pathname&filters=${encURI}`,
      {
        headers: getHeaders,
      }
    )

    return json$1({
      analytics: await res.json(),
    })
  } catch (error) {
    return json$1(
      {
        error: 'Big oof! Sorry',
      },
      {
        status: 500,
      }
    )
  }
}
