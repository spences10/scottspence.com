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

    return {
      status: 200,
      body: {
        analytics: await res.json(),
      },
    }
  } catch (error) {
    return {
      status: 500,
      body: {
        error: 'Big oof! Sorry',
      },
    }
  }
}
