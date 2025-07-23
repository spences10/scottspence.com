// Universal reactive state for posts with Svelte 5 runes
import { turso_client } from '$lib/turso'

class PostsState {
	posts = $state<Post[]>([])
	loading = $state<boolean>(false)
	last_fetched = $state<number>(0)

	private readonly CACHE_DURATION = 24 * 60 * 60 * 1000 // 24 hours
	private readonly BYPASS_DB_READS = true // Set to false to enable DB reads

	async load_posts(): Promise<void> {
		if (this.BYPASS_DB_READS) {
			return // DB reads disabled
		}

		// Check if cache is still valid
		if (
			Date.now() - this.last_fetched < this.CACHE_DURATION &&
			this.posts.length > 0
		) {
			return // Use cached data
		}

		if (this.loading) return // Prevent concurrent requests

		this.loading = true
		const client = turso_client()

		try {
			const posts_result = await client.execute(
				'SELECT * FROM posts ORDER BY date DESC;',
			)

			this.posts = posts_result.rows as unknown as Post[]
			this.last_fetched = Date.now()
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

// Fallback function for server-side usage - now uses universal state with caching
export const get_posts = async (): Promise<{ posts: Post[] }> => {
	const BYPASS_DB_READS = true // Set to false to enable DB reads
	if (BYPASS_DB_READS) {
		return { posts: [] }
	}

	const client = turso_client()

	try {
		const posts_result = await client.execute(
			'SELECT * FROM posts ORDER BY date DESC;',
		)

		return {
			posts: posts_result.rows as unknown as Post[],
		}
	} catch (error) {
		console.warn(
			'Database unavailable, returning empty posts:',
			error instanceof Error ? error.message : 'Unknown error',
		)
		return { posts: [] }
	}
}
