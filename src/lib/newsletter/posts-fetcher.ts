import { sqlite_client } from '$lib/sqlite/client'

export interface BlogPost {
	title: string
	slug: string
	date: string
	preview: string
	tags: string[]
}

export interface DateRange {
	from: Date
	to: Date
}

/**
 * Get default date range (last month)
 */
function get_default_date_range(): DateRange {
	const to = new Date()
	const from = new Date()
	from.setMonth(from.getMonth() - 1)
	return { from, to }
}

/**
 * Fetch published blog posts from database for given date range
 * Returns posts that are public (is_private = false) within the date range
 */
export async function fetch_blog_posts(
	date_range?: DateRange,
): Promise<BlogPost[]> {
	const range = date_range || get_default_date_range()
	const from_iso = range.from.toISOString()
	const to_iso = range.to.toISOString()

	console.log(
		`Fetching blog posts from database: ${from_iso} to ${to_iso}`,
	)

	try {
		const result = sqlite_client.execute({
			sql: `
				SELECT title, slug, date, preview, tags
				FROM posts
				WHERE is_private = 0
				AND date >= ?
				AND date < ?
				ORDER BY date DESC
			`,
			args: [from_iso, to_iso],
		})

		const posts = result.rows.map((row) => ({
			title: row.title as string,
			slug: row.slug as string,
			date: row.date as string,
			preview: row.preview as string,
			// Tags are stored as comma-separated string in DB
			tags:
				typeof row.tags === 'string'
					? (row.tags as string).split(',').map((t) => t.trim())
					: [],
		}))

		console.log(`Found ${posts.length} blog posts`)
		return posts
	} catch (error) {
		console.error('Error fetching blog posts:', error)
		return []
	}
}
