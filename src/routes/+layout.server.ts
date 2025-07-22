import { get_popular_posts } from '$lib/popular-posts.svelte'

export const load = async () => {
	// Get popular posts from in-memory cache (1-hour TTL)
	const popular_posts_data = await get_popular_posts()

	return {
		popular_posts: {
			popular_posts_daily: popular_posts_data.daily,
			popular_posts_monthly: popular_posts_data.monthly,
			popular_posts_yearly: popular_posts_data.yearly,
		},
	}
}
