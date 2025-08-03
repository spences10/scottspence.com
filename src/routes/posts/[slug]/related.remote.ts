import { query } from '$app/server'
import { turso_client } from '$lib/turso/client'
import * as v from 'valibot'

const RelatedPostSchema = v.object({
	slug: v.string(),
	title: v.string(),
	excerpt: v.optional(v.string()),
	date: v.string(),
})

const RelatedPostsSchema = v.array(RelatedPostSchema)

export const get_related_posts = query(
	v.string(),
	async (postSlug) => {
		const client = turso_client()

		// Get related post IDs from the current schema structure
		const related_result = await client.execute({
			sql: `
        SELECT related_post_ids
        FROM related_posts
        WHERE post_id = ?
      `,
			args: [postSlug],
		})

		if (
			related_result.rows.length === 0 ||
			!related_result.rows[0].related_post_ids
		) {
			return []
		}

		// Parse the related_post_ids (it's a JSON string)
		const related_ids = JSON.parse(
			related_result.rows[0].related_post_ids as string,
		)

		if (related_ids.length === 0) {
			return []
		}

		// Get post details for related IDs
		const placeholders = related_ids.map(() => '?').join(',')
		const result = await client.execute({
			sql: `
        SELECT 
          slug,
          title,
          preview as excerpt,
          date
        FROM posts
        WHERE slug IN (${placeholders})
        AND is_private = 0
        LIMIT 6
      `,
			args: related_ids,
		})

		return v.parse(RelatedPostsSchema,
			result.rows.map((row) => ({
				slug: row.slug as string,
				title: row.title as string,
				excerpt: row.excerpt as string | undefined,
				date: row.date as string,
			})),
		)
	},
)
