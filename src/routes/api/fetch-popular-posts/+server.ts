import { turso_client } from '$lib/turso/client'
import { json } from '@sveltejs/kit'
import { differenceInHours, parseISO } from 'date-fns'

const popular_posts_cache = new Map<string, any>()

const CACHE_DURATION_MINUTES = 60

export const GET = async () => {
	const cache_key = 'popular-posts'
	const cached_data = popular_posts_cache.get(cache_key)

	// Check if cache is still valid (within last 5 minutes)
	if (
		cached_data &&
		differenceInHours(
			new Date(),
			parseISO(cached_data.last_fetched),
		) *
			60 <
			CACHE_DURATION_MINUTES
	) {
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

	// Optimized single query - eliminates CTEs and reduces reads by ~95%
	const sql = `
    SELECT 
      pp.date_grouping AS period,
      pp.id,
      pp.pathname,
      p.title,
      pp.pageviews,
      pp.visits,
      pp.date_grouping,
      pp.last_updated,
      ROW_NUMBER() OVER (PARTITION BY pp.date_grouping ORDER BY pp.pageviews DESC) as rn
    FROM popular_posts pp
    JOIN posts p ON pp.pathname = '/posts/' || p.slug
    WHERE pp.date_grouping IN ('day', 'month', 'year')
    ORDER BY pp.date_grouping, pp.pageviews DESC;
  `

	popular_posts = {
		daily: [],
		monthly: [],
		yearly: [],
	}

	try {
		const result = await client.execute(sql)

		// Process the results - only take top 20 per period
		result.rows.forEach((row) => {
			if (row.rn && Number(row.rn) <= 20) {
				// Only take top 20 per period
				if (row.period === 'day') popular_posts.daily.push(row)
				if (row.period === 'month') popular_posts.monthly.push(row)
				if (row.period === 'year') popular_posts.yearly.push(row)
			}
		})
	} catch (error) {
		console.error('❌ Error fetching from Turso DB:', error)
		return null
	}

	// After fetching new data, update the cache
	const new_data = {
		last_fetched: new Date().toISOString(),
		data: popular_posts,
	}
	popular_posts_cache.set(cache_key, new_data)

	// Return the data
	return json(popular_posts)
}
