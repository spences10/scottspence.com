import { get_popular_posts } from '$lib/state/popular-posts.svelte'

export const load = async () => {
	try {
		// Get popular posts from in-memory cache (1-hour TTL)
		const popular_posts_data = await get_popular_posts()

		return {
			popular_posts: {
				popular_posts_daily: popular_posts_data.daily.map((post) => ({
					...post,
					visits: String(post.visits),
					pageviews: String(post.pageviews),
				})),
				popular_posts_monthly: popular_posts_data.monthly.map(
					(post) => ({
						...post,
						visits: String(post.visits),
						pageviews: String(post.pageviews),
					}),
				),
				popular_posts_yearly: popular_posts_data.yearly.map(
					(post) => ({
						...post,
						visits: String(post.visits),
						pageviews: String(post.pageviews),
					}),
				),
			},
		}
	} catch (error) {
		console.warn(
			'Database unavailable, using empty popular posts:',
			(error as Error)?.message || 'Unknown error',
		)
		// Return empty data when database is blocked/unavailable
		return {
			popular_posts: {
				popular_posts_daily: [],
				popular_posts_monthly: [],
				popular_posts_yearly: [],
			},
		}
	}
}
