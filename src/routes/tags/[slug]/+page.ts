import { get_post_tags } from '$lib/data/post-tags.remote'

export const load = async ({ params }) => {
	// Call remote function from load to ensure proper SSR context
	const { tags, posts_by_tag } = await get_post_tags()
	return {
		slug: params.slug,
		tags,
		posts_by_tag,
	}
}
