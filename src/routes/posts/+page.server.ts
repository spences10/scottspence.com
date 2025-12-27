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
	const start = performance.now()

	if (BYPASS_DB_READS.posts) {
		return { posts: [] }
	}

	// Check server cache first
	const cache_start = performance.now()
	const cached = get_from_cache<Post[]>(
		POSTS_CACHE_KEY,
		CACHE_DURATIONS.posts,
	)
	const cache_time = performance.now() - cache_start

	if (cached) {
		console.log(`[posts] cache hit in ${cache_time.toFixed(1)}ms`)
		return { posts: cached }
	}

	try {
		// Time the DB query
		const db_start = performance.now()
		const posts_result = sqlite_client.execute(
			'SELECT * FROM posts ORDER BY date DESC;',
		)
		const db_time = performance.now() - db_start

		// Time normalization
		const norm_start = performance.now()
		const posts = normalize_posts(posts_result.rows)
		const norm_time = performance.now() - norm_start

		// Cache the result
		set_cache(POSTS_CACHE_KEY, posts)

		const total = performance.now() - start
		console.log(
			`[posts] cache miss: db=${db_time.toFixed(1)}ms, normalize=${norm_time.toFixed(1)}ms, total=${total.toFixed(1)}ms, rows=${posts_result.rows.length}`,
		)

		return { posts }
	} catch (error) {
		console.warn('Database unavailable:', error)
		return { posts: [] }
	}
}
