import {
	BYPASS_DB_READS,
	CACHE_DURATIONS,
	get_from_cache,
	set_cache,
} from '$lib/cache/server-cache'
import { normalize_posts } from '$lib/data/post-normalizer'
import { sqlite_client } from '$lib/sqlite/client'

const POSTS_CACHE_KEY = 'posts'

export const load = async () => {
	if (BYPASS_DB_READS.posts) {
		return { posts: [] }
	}

	// Check server cache first
	const cached = get_from_cache<Post[]>(
		POSTS_CACHE_KEY,
		CACHE_DURATIONS.posts,
	)
	if (cached) {
		return { posts: cached }
	}

	try {
		const posts_result = sqlite_client.execute(
			'SELECT * FROM posts ORDER BY date DESC;',
		)

		const posts = normalize_posts(posts_result.rows)

		// Cache the result
		set_cache(POSTS_CACHE_KEY, posts)
		return { posts }
	} catch (error) {
		console.warn('Database unavailable:', error)
		return { posts: [] }
	}
}
