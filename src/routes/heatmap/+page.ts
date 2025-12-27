import { get_posts } from '$lib/data/posts.remote'
import { endOfYear, startOfYear } from 'date-fns'

interface GroupedPosts {
	[key: string]: number
}

function group_posts_by_date(posts: Post[]) {
	const grouped_posts: GroupedPosts = {}

	posts.forEach((post) => {
		const date = new Date(post.date)
		const date_string = date.toISOString().slice(0, 10)

		if (grouped_posts[date_string]) {
			grouped_posts[date_string]++
		} else {
			grouped_posts[date_string] = 1
		}
	})

	return grouped_posts
}

function generate_heatmap_data(
	grouped_posts: GroupedPosts,
	year_start: Date,
	year_end: Date,
) {
	const heatmap_data = []
	let current_week = []
	const currentDate = new Date(year_start)

	while (currentDate <= year_end) {
		const day_of_week = currentDate.getDay()
		const date_string = currentDate.toISOString().slice(0, 10)

		current_week[day_of_week] = {
			date: date_string,
			value: grouped_posts[date_string] || 0,
		}

		if (day_of_week === 6) {
			heatmap_data.push(current_week)
			current_week = []
		}

		currentDate.setDate(currentDate.getDate() + 1)
	}

	if (current_week.length > 0) {
		heatmap_data.push(current_week)
	}

	return heatmap_data
}

export const load = async () => {
	// Call remote function from load to ensure proper SSR context
	const posts = await get_posts()
	const grouped_posts = group_posts_by_date(posts)

	const year_start = startOfYear(new Date())
	const year_end = endOfYear(new Date())

	const data = generate_heatmap_data(
		grouped_posts,
		year_start,
		year_end,
	)

	return { data }
}
