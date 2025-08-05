// Universal reactive state for posts with Svelte 5 runes
import { BYPASS_DB_READS, CACHE_DURATIONS, get_from_cache, set_cache } from '$lib/cache/server-cache'
import { sqlite_client } from '$lib/sqlite/client'

const CACHE_KEY = 'posts'

class PostsState {
	posts = $state<Post[]>([])
	loading = $state<boolean>(false)
	last_fetched = $state<number>(0)

	async load_posts(): Promise<void> {
		if (BYPASS_DB_READS.posts) {
			return // DB reads disabled
		}

		// Check server cache first
		const server_cached = get_from_cache<Post[]>(CACHE_KEY, CACHE_DURATIONS.posts)
		if (server_cached) {
			this.posts = server_cached
			this.last_fetched = Date.now()
			return
		}

		// Check client cache
		if (
			Date.now() - this.last_fetched < CACHE_DURATIONS.posts &&
			this.posts.length > 0
		) {
			return // Use cached data
		}

		if (this.loading) return // Prevent concurrent requests

		this.loading = true
		const client = sqlite_client

		try {
			const posts_result = await client.execute(
				'SELECT * FROM posts ORDER BY date DESC;',
			)

			const posts = posts_result.rows as unknown as Post[]
			
			// Update both caches
			this.posts = posts
			this.last_fetched = Date.now()
			set_cache(CACHE_KEY, posts)
		} catch (error) {
			console.warn(
				'Database unavailable, keeping cached posts:',
				error instanceof Error ? error.message : 'Unknown error',
			)
			// Keep existing data on error - don't clear it
		} finally {
			this.loading = false
		}
	}
}

// Single universal instance shared everywhere
export const posts_state = new PostsState()

// Legacy context functions for backward compatibility
export function set_posts_state() {
	return posts_state
}

export function get_posts_state(): PostsState {
	return posts_state
}

// Fallback function for server-side usage - now uses server cache
export const get_posts = async (): Promise<{ posts: Post[] }> => {
	if (BYPASS_DB_READS.posts) {
		return { posts: [] }
	}

	// Check server cache first
	const cached = get_from_cache<Post[]>(CACHE_KEY, CACHE_DURATIONS.posts)
	if (cached) {
		return { posts: cached }
	}

	const client = sqlite_client

	try {
		const posts_result = await client.execute(
			'SELECT * FROM posts ORDER BY date DESC;',
		)

		const posts = posts_result.rows as unknown as Post[]
		
		// Cache the result
		set_cache(CACHE_KEY, posts)
		
		return { posts }
	} catch (error) {
		console.warn(
			'Database unavailable, returning empty posts:',
			error instanceof Error ? error.message : 'Unknown error',
		)
		return { posts: [] }
	}
}
