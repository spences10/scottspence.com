import { query } from '$app/server'
import {
	BYPASS_DB_READS,
	CACHE_DURATIONS,
	get_from_cache,
	set_cache,
} from '$lib/cache/server-cache'
import { sqlite_client } from '$lib/sqlite/client'

interface PopularPostsData {
	daily: PopularPost[]
	monthly: PopularPost[]
	yearly: PopularPost[]
}

const CACHE_KEY = 'popular_posts'

export const get_popular_posts = query(
	async (): Promise<PopularPostsData> => {
		if (BYPASS_DB_READS.popular_posts) {
			return { daily: [], monthly: [], yearly: [] }
		}

		// Check server cache first
		const cached = get_from_cache<PopularPostsData>(
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
				daily: daily_result.rows.map((row) => ({
					id: String(row.id),
					pathname: String(row.pathname),
					title: String(row.title),
					pageviews: Number(row.pageviews),
					visits: Number(row.visits),
					date_grouping: String(row.date_grouping),
					last_updated: String(row.last_updated),
				})),
				monthly: monthly_result.rows.map((row) => ({
					id: String(row.id),
					pathname: String(row.pathname),
					title: String(row.title),
					pageviews: Number(row.pageviews),
					visits: Number(row.visits),
					date_grouping: String(row.date_grouping),
					last_updated: String(row.last_updated),
				})),
				yearly: yearly_result.rows.map((row) => ({
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
			return { daily: [], monthly: [], yearly: [] }
		}
	},
)
