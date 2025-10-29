import { get_reaction_counts } from '$lib/data/reactions.remote'
import { get_related_posts } from '$lib/data/related-posts.remote'

export const load = async ({ params, url }) => {
	const slug = params.slug
	const pathname = url.pathname

	try {
		// Fetch both data concurrently using remote functions
		const [reaction_counts, related_posts] = await Promise.all([
			get_reaction_counts(pathname),
			get_related_posts(slug),
		])

		return {
			count: reaction_counts ? { count: reaction_counts } : null,
			related_posts,
		}
	} catch (error) {
		console.warn(
			'Database unavailable, using fallback data for post page:',
			error instanceof Error ? error.message : 'Unknown error',
		)
		return {
			count: null,
			related_posts: [],
		}
	}
}
