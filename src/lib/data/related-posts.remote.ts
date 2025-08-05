import { query } from '$app/server'
import { sqlite_client } from '$lib/sqlite/client'
import * as v from 'valibot'

export const get_related_posts = query(
	v.string(),
	async (post_id: string): Promise<RelatedPost[]> => {
		try {
			const result = await sqlite_client.execute({
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

			if (related_post_ids.length === 0) {
				return []
			}

			// Fetch titles for related posts in a single query, excluding private posts
			const placeholders = related_post_ids.map(() => '?').join(',')
			const posts_result = await sqlite_client.execute({
				sql: `SELECT slug, title FROM posts WHERE slug IN (${placeholders}) AND is_private = 0`,
				args: related_post_ids,
			})

			// Create a map for quick lookup
			const title_map = new Map()
			posts_result.rows.forEach((row) => {
				title_map.set(row.slug, row.title)
			})

			// Build the final array only for posts that have titles (public posts)
			return related_post_ids
				.map((slug: string) => ({
					slug,
					title: title_map.get(slug),
				}))
				.filter((post: RelatedPost) => post.title) // Only include posts with valid titles (public posts)
		} catch (error) {
			console.warn('Database unavailable for related posts:', error)
			return []
		}
	},
)
