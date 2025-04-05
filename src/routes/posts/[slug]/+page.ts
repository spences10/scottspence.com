import { error } from '@sveltejs/kit'

export const load = async ({
	params,
	data: { count, related_posts },
}) => {
	const { slug } = params

	try {
		const post = await import(`../../../../posts/${slug}.md`)
		return {
			count,
			related_posts,
			Content: post.default,
			meta: { ...post.metadata, slug },
		}
	} catch (err) {
		error(404, {
			message: 'Post not found',
		})
	}
}
