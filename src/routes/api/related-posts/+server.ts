import { turso_client } from '$lib/turso'
import { json } from '@sveltejs/kit'

export const GET = async ({ url }) => {
	const post_id = url.searchParams.get('post_id')

	if (!post_id) {
		return json(
			{ error: 'Missing post_id parameter' },
			{ status: 400 },
		)
	}

	const client = turso_client()
	const result = await client.execute({
		sql: 'SELECT related_post_ids FROM related_posts WHERE post_id = ?',
		args: [post_id],
	})

	if (result.rows.length === 0) {
		return json({ related_posts: [] })
	}

	const related_post_ids_value = result.rows[0].related_post_ids
	const related_post_ids =
		typeof related_post_ids_value === 'string'
			? JSON.parse(related_post_ids_value)
			: []

	// Fetch titles for related posts
	const related_posts_with_titles = await Promise.all(
		related_post_ids.map(async (related_post_id: string) => {
			const post_result = await client.execute({
				sql: 'SELECT title FROM posts WHERE slug = ?',
				args: [related_post_id],
			})
			const title =
				post_result.rows.length > 0
					? post_result.rows[0].title
					: 'Unknown Title'
			return { slug: related_post_id, title }
		}),
	)

	return json({ related_posts: related_posts_with_titles })
}
