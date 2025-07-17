import { get_popular_posts } from '../../routes/popular-posts.remote'

// Lazy-loaded queries - only created when first accessed
let popular_posts_day: any = null
let popular_posts_month: any = null
let popular_posts_year: any = null

// Helper to get the right query based on period (lazy loading)
export function get_popular_posts_for_period(period: 'day' | 'month' | 'year') {
	switch (period) {
		case 'day':
			if (!popular_posts_day) {
				popular_posts_day = get_popular_posts('day')
			}
			return popular_posts_day
		case 'month':
			if (!popular_posts_month) {
				popular_posts_month = get_popular_posts('month')
			}
			return popular_posts_month
		case 'year':
			if (!popular_posts_year) {
				popular_posts_year = get_popular_posts('year')
			}
			return popular_posts_year
		default:
			if (!popular_posts_year) {
				popular_posts_year = get_popular_posts('year')
			}
			return popular_posts_year
	}
}