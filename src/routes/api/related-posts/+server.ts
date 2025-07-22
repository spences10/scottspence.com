import { turso_client } from '$lib/turso'
import { json } from '@sveltejs/kit'

// Cache for related posts (post_id -> related posts data)
const related_posts_cache = new Map<
	string,
	{
		data: { related_posts: { slug: string; title: string }[] }
		timestamp: number
	}
>()

const CACHE_DURATION = 60 * 60 * 1000 // 1 hour in milliseconds

export const GET = async ({ url }) => {
	const post_id = url.searchParams.get('post_id')

	if (!post_id) {
		return json(
			{ error: 'Missing post_id parameter' },
			{ status: 400 },
		)
	}

	// Check cache first
	const cached = related_posts_cache.get(post_id)
	if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
		return json(cached.data)
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

	// Fetch titles for related posts in a single query
	let related_posts_with_titles: { slug: string; title: string }[] =
		[]

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
		related_posts_with_titles = related_post_ids.map(
			(slug: string) => ({
				slug,
				title: title_map.get(slug) || 'Unknown Title',
			}),
		)
	}

	const response_data = { related_posts: related_posts_with_titles }

	// Cache the result
	related_posts_cache.set(post_id, {
		data: response_data,
		timestamp: Date.now(),
	})

	return json(response_data)
}
