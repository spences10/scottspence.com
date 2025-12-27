import { error } from '@sveltejs/kit'
import type { PageLoad } from './$types'

export const load: PageLoad = async ({ params, data }) => {
	const { slug } = params

	try {
		const post = await import(`../../../../posts/${slug}.md`)
		return {
			count: data?.count || null,
			related_posts: data?.related_posts || [],
			Content: post.default,
			meta: { ...post.metadata, slug },
		}
	} catch (err) {
		error(404, {
			message: 'Post not found',
		})
	}
}
