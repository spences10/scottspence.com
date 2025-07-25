import {
	BYPASS_DB_READS,
	CACHE_DURATIONS,
	get_from_cache,
	set_cache,
} from '$lib/cache/server-cache'
import { turso_client } from '$lib/turso'

interface RelatedPost {
	slug: string
	title: string
}

class RelatedPostsState {
	cache = $state<
		Map<string, { posts: RelatedPost[]; timestamp: number }>
	>(new Map())
	loading = $state<Set<string>>(new Set())

	async load_related_posts(post_id: string): Promise<RelatedPost[]> {
		if (BYPASS_DB_READS.related_posts) {
			return [] // DB reads disabled
		}

		// Check server cache first
		const cache_key = `related_posts_${post_id}`
		const server_cached = get_from_cache<RelatedPost[]>(
			cache_key,
			CACHE_DURATIONS.related_posts,
		)
		if (server_cached) {
			return server_cached
		}

		// Check client cache
		const cached = this.cache.get(post_id)
		if (
			cached &&
			Date.now() - cached.timestamp < CACHE_DURATIONS.related_posts
		) {
			return cached.posts
		}

		// Prevent concurrent requests for the same post
		if (this.loading.has(post_id)) {
			return cached?.posts || []
		}

		this.loading.add(post_id)
		const client = turso_client()

		try {
			const result = await client.execute({
				sql: 'SELECT related_post_ids FROM related_posts WHERE post_id = ?',
				args: [post_id],
			})

			if (result.rows.length === 0) {
				this.cache.set(post_id, {
					posts: [],
					timestamp: Date.now(),
				})
				return []
			}

			const related_post_ids_value = result.rows[0].related_post_ids
			const related_post_ids =
				typeof related_post_ids_value === 'string'
					? JSON.parse(related_post_ids_value)
					: []

			// Fetch titles for related posts in a single query
			let related_posts: RelatedPost[] = []

			if (related_post_ids.length > 0) {
				const placeholders = related_post_ids.map(() => '?').join(',')
				const posts_result = await client.execute({
					sql: `SELECT slug, title FROM posts WHERE slug IN (${placeholders})`,
					args: related_post_ids,
				})

				// Create a map for quick lookup
				const title_map = new Map()
				posts_result.rows.forEach((row) => {
					title_map.set(row.slug, row.title)
				})

				// Build the final array maintaining the original order
				related_posts = related_post_ids.map((slug: string) => ({
					slug,
					title: title_map.get(slug) || 'Unknown Title',
				}))
			}

			// Update both caches
			this.cache.set(post_id, {
				posts: related_posts,
				timestamp: Date.now(),
			})
			set_cache(cache_key, related_posts)

			return related_posts
		} catch (error) {
			console.warn(
				'Database unavailable, returning cached or empty related posts:',
				error instanceof Error ? error.message : 'Unknown error',
			)
			// Keep existing cached data on error - don't clear it
			return cached?.posts || []
		} finally {
			this.loading.delete(post_id)
		}
	}
}

// Single universal instance shared everywhere
export const related_posts_state = new RelatedPostsState()

// Fallback function for server-side usage
export const get_related_posts_for_post = async (
	post_id: string,
): Promise<RelatedPost[]> => {
	if (BYPASS_DB_READS.related_posts) {
		return [] // DB reads disabled
	}

	const client = turso_client()

	try {
		const result = await client.execute({
			sql: 'SELECT related_post_ids FROM related_posts WHERE post_id = ?',
			args: [post_id],
		})

		if (result.rows.length === 0) {
			return []
		}

		const related_post_ids_value = result.rows[0].related_post_ids
		const related_post_ids =
			typeof related_post_ids_value === 'string'
				? JSON.parse(related_post_ids_value)
				: []

		// Fetch titles for related posts in a single query
		if (related_post_ids.length > 0) {
			const placeholders = related_post_ids.map(() => '?').join(',')
			const posts_result = await client.execute({
				sql: `SELECT slug, title FROM posts WHERE slug IN (${placeholders})`,
				args: related_post_ids,
			})

			// Create a map for quick lookup
			const title_map = new Map()
			posts_result.rows.forEach((row) => {
				title_map.set(row.slug, row.title)
			})

			// Build the final array maintaining the original order
			return related_post_ids.map((slug: string) => ({
				slug,
				title: title_map.get(slug) || 'Unknown Title',
			}))
		}

		return []
	} catch (error) {
		console.warn(
			'Database unavailable, returning empty related posts:',
			error instanceof Error ? error.message : 'Unknown error',
		)
		return []
	}
}
