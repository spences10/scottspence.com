import {
	BYPASS_DB_READS,
	CACHE_DURATIONS,
	get_from_cache,
	set_cache,
} from '$lib/cache/server-cache'
import { sqlite_client } from '$lib/sqlite/client'

const CACHE_KEY = 'popular_posts'

interface PopularPost {
	id: string
	pathname: string
	title: string
	pageviews: number
	visits: number
	date_grouping: string
	last_updated: string
}

interface PopularPostsData {
	daily: PopularPost[]
	monthly: PopularPost[]
	yearly: PopularPost[]
}

class PopularPostsState {
	data = $state<PopularPostsData>({
		daily: [],
		monthly: [],
		yearly: [],
	})
	loading = $state<boolean>(false)
	last_fetched = $state<number>(0)

	async load_popular_posts(): Promise<void> {
		if (BYPASS_DB_READS.popular_posts) {
			return // DB reads disabled
		}

		// Check server cache first
		const server_cached = get_from_cache<PopularPostsData>(
			CACHE_KEY,
			CACHE_DURATIONS.popular_posts,
		)
		if (server_cached) {
			this.data = server_cached
			this.last_fetched = Date.now()
			return
		}

		// Check client cache
		if (
			Date.now() - this.last_fetched <
				CACHE_DURATIONS.popular_posts &&
			this.data.daily.length > 0
		) {
			return // Use cached data
		}

		if (this.loading) return // Prevent concurrent requests

		this.loading = true
		const client = sqlite_client

		try {
			// Three targeted queries with indexes - much more efficient
			const [daily_result, monthly_result, yearly_result] =
				await Promise.all([
					client.execute({
						sql: `SELECT pp.id, pp.pathname, p.title, pp.pageviews, pp.visits, pp.date_grouping, pp.last_updated
						  FROM popular_posts pp
						  JOIN posts p ON pp.pathname = '/posts/' || p.slug
						  WHERE pp.date_grouping = 'day'
						  ORDER BY pp.pageviews DESC
						  LIMIT 20`,
					}),
					client.execute({
						sql: `SELECT pp.id, pp.pathname, p.title, pp.pageviews, pp.visits, pp.date_grouping, pp.last_updated
						  FROM popular_posts pp
						  JOIN posts p ON pp.pathname = '/posts/' || p.slug
						  WHERE pp.date_grouping = 'month'
						  ORDER BY pp.pageviews DESC
						  LIMIT 20`,
					}),
					client.execute({
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

			// Update both caches
			this.data = data
			this.last_fetched = Date.now()
			set_cache(CACHE_KEY, data)
		} catch (error) {
			console.warn(
				'Database unavailable, keeping cached popular posts:',
				error instanceof Error ? error.message : 'Unknown error',
			)
			// Keep existing data on error - don't clear it
		} finally {
			this.loading = false
		}
	}
}

// Single universal instance shared everywhere
export const popular_posts_state = new PopularPostsState()

// Fallback function for server-side usage (like layout.server.ts)
export const get_popular_posts =
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

		const client = sqlite_client

		try {
			const [daily_result, monthly_result, yearly_result] =
				await Promise.all([
					client.execute({
						sql: `SELECT pp.id, pp.pathname, p.title, pp.pageviews, pp.visits, pp.date_grouping, pp.last_updated
					  FROM popular_posts pp
					  JOIN posts p ON pp.pathname = '/posts/' || p.slug
					  WHERE pp.date_grouping = 'day'
					  ORDER BY pp.pageviews DESC
					  LIMIT 20`,
					}),
					client.execute({
						sql: `SELECT pp.id, pp.pathname, p.title, pp.pageviews, pp.visits, pp.date_grouping, pp.last_updated
					  FROM popular_posts pp
					  JOIN posts p ON pp.pathname = '/posts/' || p.slug
					  WHERE pp.date_grouping = 'month'
					  ORDER BY pp.pageviews DESC
					  LIMIT 20`,
					}),
					client.execute({
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
			console.warn(
				'Database unavailable, returning empty popular posts:',
				error instanceof Error ? error.message : 'Unknown error',
			)
			return { daily: [], monthly: [], yearly: [] }
		}
	}
