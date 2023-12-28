import { turso_client } from '$lib/turso/client.js'
import { json } from '@sveltejs/kit'
import { differenceInHours, parseISO } from 'date-fns'

const analytics_cache = new Map<string, any>()

export const GET = async ({ url }) => {
  const slug = url.searchParams.get('slug')
  if (!slug) {
    return new Response('No slug provided', { status: 400 })
  }

  const visits = await fetch_visits(slug)

  return json({
    daily_visits: visits.daily,
    monthly_visits: visits.monthly,
    yearly_visits: visits.yearly,
  })
}

const fetch_visits = async (slug: string) => {
  const cache_key = `analytics-${slug}`
  const cached_data = analytics_cache.get(cache_key)

  if (
    cached_data &&
    differenceInHours(
      new Date(),
      parseISO(cached_data.last_fetched),
    ) < 24
  ) {
    return cached_data.data
  }

  const client = turso_client()
  let page_analytics: any = {
    daily: null,
    monthly: null,
    yearly: null,
  }

  // Construct and execute the UNION query
  const sql = `
    SELECT 'day' AS period, * FROM post_analytics WHERE date_grouping = 'day' AND slug = ?
    UNION
    SELECT 'month' AS period, * FROM post_analytics WHERE date_grouping = 'month' AND slug = ?
    UNION
    SELECT 'year' AS period, * FROM post_analytics WHERE date_grouping = 'year' AND slug = ?;
  `

  try {
    const result = await client.execute({
      sql,
      args: [slug, slug, slug],
    })

    // Process the results
    result.rows.forEach(row => {
      if (row.period === 'day') page_analytics.daily = row
      if (row.period === 'month') page_analytics.monthly = row
      if (row.period === 'year') page_analytics.yearly = row
    })
  } catch (error) {
    console.error('Error fetching from Turso DB:', error)
    return null
  }

  // After fetching new data, update the cache
  const new_data = {
    last_fetched: new Date().toISOString(),
    data: page_analytics,
  }
  analytics_cache.set(cache_key, new_data)

  // Return the data
  return page_analytics
}
