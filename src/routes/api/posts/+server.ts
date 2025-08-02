import { get_posts } from '$lib/posts'
import type { RequestHandler } from '@sveltejs/kit'
import { json } from '@sveltejs/kit'

export const GET: RequestHandler = async () => {
	try {
		const { posts } = await get_posts()
		return json(posts)
	} catch (error) {
		console.warn(
			'Database unavailable for posts API:',
			error instanceof Error ? error.message : 'Unknown error',
		)
		return json({ error: 'Failed to fetch posts' }, { status: 500 })
	}
}
