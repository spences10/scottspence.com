import { query } from '$app/server'
import {
	BYPASS_DB_READS,
	CACHE_DURATIONS,
	get_from_cache,
	set_cache,
} from '$lib/cache/server-cache'
import { sqlite_client } from '$lib/sqlite/client'
import * as v from 'valibot'
import { get_related_posts as get_related_posts_from_embeddings } from '../../routes/api/ingest/embeddings'

export const get_related_posts = query(
	v.string(),
	async (post_id: string): Promise<RelatedPost[]> => {
		if (BYPASS_DB_READS.related_posts) {
			return []
		}

		// Check server cache first
		const cache_key = `related_posts_${post_id}`
		const cached = get_from_cache<RelatedPost[]>(
			cache_key,
			CACHE_DURATIONS.related_posts,
		)
		if (cached) {
			return cached
		}

		try {
			// Use vector similarity search with privacy filtering built-in
			const related_post_ids =
				await get_related_posts_from_embeddings(post_id, 4)

			if (related_post_ids.length === 0) {
				// Cache empty result to avoid repeated database queries
				set_cache(cache_key, [])
				return []
			}

			// Fetch titles for the related posts (already filtered for privacy)
			const placeholders = related_post_ids.map(() => '?').join(',')
			const posts_result = await sqlite_client.execute({
				sql: `SELECT slug, title FROM posts WHERE slug IN (${placeholders})`,
				args: related_post_ids,
			})

			// Create a map for quick lookup
			const title_map = new Map()
			posts_result.rows.forEach((row) => {
				title_map.set(row.slug, row.title)
			})

			// Build the final array maintaining the order from similarity search
			const related_posts = related_post_ids
				.map((slug: string) => ({
					slug,
					title: title_map.get(slug),
				}))
				.filter((post: RelatedPost) => post.title) // Only include posts with valid titles

			// Cache the result
			set_cache(cache_key, related_posts)
			return related_posts
		} catch (error) {
			console.warn('Database unavailable for related posts:', error)
			return []
		}
	},
)
