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
		return {
			status: 404,
			error: err,
		}
	}
}
