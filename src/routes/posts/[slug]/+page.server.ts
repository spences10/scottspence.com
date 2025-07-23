import { get_related_posts_for_post } from '$lib/state/related-posts.svelte'
import { get_reaction_count_data } from '$lib/utils/get-reaction-count'

export const load = async ({ url, fetch }) => {
	const slug = url.pathname.split('/').filter(Boolean).pop()

	try {
		// Fetch both data concurrently
		const [count_data, related_posts] = await Promise.all([
			get_reaction_count_data(url.pathname),
			get_related_posts_for_post(slug || ''),
		])

		return {
			count: count_data,
			related_posts,
		}
	} catch (error) {
		console.warn(
			'Database unavailable, using fallback data for post page:',
			error instanceof Error ? error.message : 'Unknown error',
		)
		// Return minimal data when everything fails
		return {
			count: null,
			related_posts: [],
		}
	}
}
