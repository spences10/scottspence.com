import { query } from '$app/server'
import {
	BYPASS_DB_READS,
	CACHE_DURATIONS,
	get_from_cache,
	set_cache,
} from '$lib/cache/server-cache'
import { sqlite_client } from '$lib/sqlite/client'
import { fetch_popular_posts_from_db } from './popular-posts.helpers'

const CACHE_KEY = 'popular_posts'

export const get_popular_posts = query(
	async (): Promise<PopularPosts> => {
		if (BYPASS_DB_READS.popular_posts) {
			return {
				popular_posts_daily: [],
				popular_posts_monthly: [],
				popular_posts_yearly: [],
			}
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
			const data = await fetch_popular_posts_from_db(sqlite_client)

			// Cache the result
			set_cache(CACHE_KEY, data)
			return data
		} catch (error) {
			console.warn('Database unavailable:', error)
			return {
				popular_posts_daily: [],
				popular_posts_monthly: [],
				popular_posts_yearly: [],
			}
		}
	},
)
