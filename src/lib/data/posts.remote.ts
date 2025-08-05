import { query } from '$app/server'
import {
	BYPASS_DB_READS,
	CACHE_DURATIONS,
	get_from_cache,
	set_cache,
} from '$lib/cache/server-cache'
import { sqlite_client } from '$lib/sqlite/client'
import * as v from 'valibot'

const POSTS_CACHE_KEY = 'posts'

export const get_posts = query(async (): Promise<Post[]> => {
	if (BYPASS_DB_READS.posts) {
		return []
	}

	// Check server cache first
	const cached = get_from_cache<Post[]>(
		POSTS_CACHE_KEY,
		CACHE_DURATIONS.posts,
	)
	if (cached) {
		return cached
	}

	try {
		const posts_result = await sqlite_client.execute(
			'SELECT * FROM posts ORDER BY date DESC;',
		)
		const posts = posts_result.rows as unknown as Post[]

		// Cache the result
		set_cache(POSTS_CACHE_KEY, posts)
		return posts
	} catch (error) {
		console.warn('Database unavailable:', error)
		return []
	}
})

export const get_post_by_slug = query(
	v.string(),
	async (slug: string): Promise<Post | null> => {
		if (BYPASS_DB_READS.posts) {
			return null
		}

		// Check server cache first
		const cache_key = `post_${slug}`
		const cached = get_from_cache<Post | null>(
			cache_key,
			CACHE_DURATIONS.posts,
		)
		if (cached !== null) {
			return cached
		}

		try {
			const result = await sqlite_client.execute({
				sql: 'SELECT * FROM posts WHERE slug = ?',
				args: [slug],
			})
			const post = (result.rows[0] as unknown as Post) || null

			// Cache the result (including null results)
			set_cache(cache_key, post)
			return post
		} catch (error) {
			console.warn('Database unavailable:', error)
			return null
		}
	},
)
