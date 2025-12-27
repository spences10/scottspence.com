import { query } from '$app/server'
import {
	BYPASS_DB_READS,
	CACHE_DURATIONS,
	get_from_cache,
	set_cache,
} from '$lib/cache/server-cache'
import { sqlite_client } from '$lib/sqlite/client'


const CACHE_KEY = 'popular_posts'

export const get_popular_posts = query(
	async (): Promise<PopularPosts> => {
		if (BYPASS_DB_READS.popular_posts) {
			return { popular_posts_daily: [], popular_posts_monthly: [], popular_posts_yearly: [] }
		}

		// Check server cache first
		const cached = get_from_cache<PopularPosts>(
			CACHE_KEY,
			CACHE_DURATIONS.popular_posts,
		)
		if (cached) {
			return cached
		}

		try {
			const [daily_result, monthly_result, yearly_result] =
				await Promise.all([
					sqlite_client.execute({
						sql: `SELECT pp.id, pp.pathname, p.title, pp.pageviews, pp.visits, pp.date_grouping, pp.last_updated
				  FROM popular_posts pp
				  JOIN posts p ON pp.pathname = '/posts/' || p.slug
				  WHERE pp.date_grouping = 'day'
				  ORDER BY pp.pageviews DESC
				  LIMIT 20`,
					}),
					sqlite_client.execute({
						sql: `SELECT pp.id, pp.pathname, p.title, pp.pageviews, pp.visits, pp.date_grouping, pp.last_updated
				  FROM popular_posts pp
				  JOIN posts p ON pp.pathname = '/posts/' || p.slug
				  WHERE pp.date_grouping = 'month'
				  ORDER BY pp.pageviews DESC
				  LIMIT 20`,
					}),
					sqlite_client.execute({
						sql: `SELECT pp.id, pp.pathname, p.title, pp.pageviews, pp.visits, pp.date_grouping, pp.last_updated
				  FROM popular_posts pp
				  JOIN posts p ON pp.pathname = '/posts/' || p.slug
				  WHERE pp.date_grouping = 'year'
				  ORDER BY pp.pageviews DESC
				  LIMIT 20`,
					}),
				])

			const data = {
				popular_posts_daily: daily_result.rows.map((row) => ({
					id: String(row.id),
					pathname: String(row.pathname),
					title: String(row.title),
					pageviews: Number(row.pageviews),
					visits: Number(row.visits),
					date_grouping: String(row.date_grouping),
					last_updated: String(row.last_updated),
				})),
				popular_posts_monthly: monthly_result.rows.map((row) => ({
					id: String(row.id),
					pathname: String(row.pathname),
					title: String(row.title),
					pageviews: Number(row.pageviews),
					visits: Number(row.visits),
					date_grouping: String(row.date_grouping),
					last_updated: String(row.last_updated),
				})),
				popular_posts_yearly: yearly_result.rows.map((row) => ({
					id: String(row.id),
					pathname: String(row.pathname),
					title: String(row.title),
					pageviews: Number(row.pageviews),
					visits: Number(row.visits),
					date_grouping: String(row.date_grouping),
					last_updated: String(row.last_updated),
				})),
			}

			// Cache the result
			set_cache(CACHE_KEY, data)
			return data
		} catch (error) {
			console.warn('Database unavailable:', error)
			return { popular_posts_daily: [], popular_posts_monthly: [], popular_posts_yearly: [] }
		}
	},
)
