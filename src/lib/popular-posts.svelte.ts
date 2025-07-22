// Universal reactive state for popular posts with Svelte 5 runes
import { turso_client } from '$lib/turso'
import { getContext, setContext } from 'svelte'

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

	private readonly CACHE_DURATION = 60 * 60 * 1000 // 1 hour

	async load_popular_posts(): Promise<void> {
		// Check if cache is still valid
		if (
			Date.now() - this.last_fetched < this.CACHE_DURATION &&
			this.data.daily.length > 0
		) {
			return // Use cached data
		}

		if (this.loading) return // Prevent concurrent requests

		this.loading = true
		const client = turso_client()

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

			this.data = {
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

			this.last_fetched = Date.now()
		} catch (error) {
			console.error('Error fetching popular posts:', error)
			// Keep existing data on error - don't clear it
		} finally {
			this.loading = false
		}
	}
}

const POPULAR_POSTS_KEY = Symbol('popular_posts')

export function set_popular_posts_state() {
	const state = new PopularPostsState()
	setContext(POPULAR_POSTS_KEY, state)
	return state
}

export function get_popular_posts_state(): PopularPostsState {
	return getContext<PopularPostsState>(POPULAR_POSTS_KEY)
}

// Fallback function for server-side usage (like layout.server.ts)
export const get_popular_posts =
	async (): Promise<PopularPostsData> => {
		const client = turso_client()

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

			return {
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
		} catch (error) {
			console.error('Error fetching popular posts:', error)
			return { daily: [], monthly: [], yearly: [] }
		}
	}
