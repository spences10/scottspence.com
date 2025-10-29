import { get_post_tags } from '$lib/data/post-tags.remote'

export const load = async () => {
	// Call remote function from load to ensure proper SSR context
	return await get_post_tags()
}
