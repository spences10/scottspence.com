import { turso_client } from '$lib/turso/client'
import { json } from '@sveltejs/kit'
import { differenceInHours, parseISO } from 'date-fns'

const popular_posts_cache = new Map<string, any>()

export const GET = async () => {
  const t0 = performance.now()

  const cache_key = 'popular-posts'
  const cached_data = popular_posts_cache.get(cache_key)

  if (
    cached_data &&
    differenceInHours(
      new Date(),
      parseISO(cached_data.last_fetched),
    ) < 24
  ) {
    const t1 = performance.now()
    console.log(`Call to popular posts took ${t1 - t0} milliseconds.`)
    return json(cached_data.data)
  }

  const client = turso_client()
  let popular_posts: any = {
    daily: null,
    monthly: null,
    yearly: null,
  }

  const common_fields = `
    pp.id,
    pp.pathname,
    p.title,
    pp.pageviews,
    pp.visits,
    pp.date_grouping,
    pp.last_updated
  `

  const common_from_join = `
    FROM 
      popular_posts pp
    JOIN
      posts p ON pp.pathname = '/posts/' || p.slug
  `

  const common_order_by_limit = `
    ORDER BY
      pp.pageviews DESC
    LIMIT 20
  `

  // Construct and execute the UNION query
  const sql = `
    WITH DayResults AS (
      SELECT 
        'day' AS period, 
        ${common_fields}
        ${common_from_join}
      WHERE 
        pp.date_grouping = 'day'
        ${common_order_by_limit}
    ),
    MonthResults AS (
      SELECT 
        'month' AS period, 
        ${common_fields}
        ${common_from_join}
      WHERE 
        pp.date_grouping = 'month'
        ${common_order_by_limit}
    ),
    YearResults AS (
      SELECT
        'year' AS period,
        ${common_fields}
        ${common_from_join}
      WHERE
        pp.date_grouping = 'year'
        ${common_order_by_limit}
    )

    SELECT * FROM DayResults
    UNION ALL
    SELECT * FROM MonthResults
    UNION ALL
    SELECT * FROM YearResults;
  `

  popular_posts = {
    daily: [],
    monthly: [],
    yearly: [],
  }

  try {
    const result = await client.execute(sql)

    // Process the results
    result.rows.forEach(row => {
      if (row.period === 'day') popular_posts.daily.push(row)
      if (row.period === 'month') popular_posts.monthly.push(row)
      if (row.period === 'year') popular_posts.yearly.push(row)
    })
  } catch (error) {
    console.error('Error fetching from Turso DB:', error)
    return null
  }

  // After fetching new data, update the cache
  const new_data = {
    last_fetched: new Date().toISOString(),
    data: popular_posts,
  }
  popular_posts_cache.set(cache_key, new_data)

  const t1 = performance.now()
  console.log(`Call to popular posts took ${t1 - t0} milliseconds.`)

  // Return the data
  return json(popular_posts)
}
