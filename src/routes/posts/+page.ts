import { get_posts } from '$lib/data/posts.remote'

export const load = async () => {
	// Call remote function from load to ensure proper SSR context
	const posts = await get_posts()
	return { posts }
}
