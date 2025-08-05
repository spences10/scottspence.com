import { get_popular_posts } from './popular-posts.remote'

export const load = async () => {
	try {
		// Get popular posts from remote functions
		const [daily_posts, monthly_posts, yearly_posts] = await Promise.all([
			get_popular_posts('day'),
			get_popular_posts('month'), 
			get_popular_posts('year')
		])

		return {
			popular_posts: {
				popular_posts_daily: daily_posts.map((post) => ({
					...post,
					visits: String(post.visits),
					pageviews: String(post.pageviews),
				})),
				popular_posts_monthly: monthly_posts.map((post) => ({
					...post,
					visits: String(post.visits),
					pageviews: String(post.pageviews),
				})),
				popular_posts_yearly: yearly_posts.map((post) => ({
					...post,
					visits: String(post.visits),
					pageviews: String(post.pageviews),
				})),
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
