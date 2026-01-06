import { query } from '$app/server'
import {
	BYPASS_DB_READS,
	CACHE_DURATIONS,
	get_from_cache,
	set_cache,
} from '$lib/cache/server-cache'
import { sqlite_client } from '$lib/sqlite/client'
import {
	fetch_popular_month,
	fetch_popular_today,
	fetch_popular_year,
} from './popular-posts.helpers'

const CACHE_KEYS = {
	today: 'popular_posts_today',
	month: 'popular_posts_month',
	year: 'popular_posts_year',
}

const empty_result: PopularPosts = {
	popular_posts_daily: [],
	popular_posts_monthly: [],
	popular_posts_yearly: [],
}

export const get_popular_posts = query(
	async (): Promise<PopularPosts> => {
		if (BYPASS_DB_READS.popular_posts) {
			return empty_result
		}

		try {
			// Check caches and fetch only what's stale
			const cached_today = get_from_cache<PopularPost[]>(
				CACHE_KEYS.today,
				CACHE_DURATIONS.popular_posts_today,
			)
			const cached_month = get_from_cache<PopularPost[]>(
				CACHE_KEYS.month,
				CACHE_DURATIONS.popular_posts_month,
			)
			const cached_year = get_from_cache<PopularPost[]>(
				CACHE_KEYS.year,
				CACHE_DURATIONS.popular_posts_year,
			)

			// Fetch only missing data
			const [daily, monthly, yearly] = await Promise.all([
				cached_today ?? fetch_popular_today(sqlite_client),
				cached_month ?? fetch_popular_month(sqlite_client),
				cached_year ?? fetch_popular_year(sqlite_client),
			])

			// Cache what we fetched
			if (!cached_today) set_cache(CACHE_KEYS.today, daily)
			if (!cached_month) set_cache(CACHE_KEYS.month, monthly)
			if (!cached_year) set_cache(CACHE_KEYS.year, yearly)

			return {
				popular_posts_daily: daily,
				popular_posts_monthly: monthly,
				popular_posts_yearly: yearly,
			}
		} catch (error) {
			console.warn('Popular posts fetch failed:', error)
			return empty_result
		}
	},
)
