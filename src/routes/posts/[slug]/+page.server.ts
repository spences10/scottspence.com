import { get_reaction_count_data } from '$lib/utils/get-reaction-count'

export const load = async ({ url, fetch }) => {
	const slug = url.pathname.split('/').filter(Boolean).pop()

	// Fetch both data concurrently
	const [count, related_posts_response] = await Promise.all([
		get_reaction_count_data(url.pathname),
		fetch(`/api/related-posts?post_id=${slug}`),
	])

	if (!related_posts_response.ok) {
		console.error('Failed to fetch related posts')
		return {
			count,
			related_posts: [],
		}
	}

	const { related_posts } = await related_posts_response.json()

	return {
		count,
		related_posts,
	}
}
