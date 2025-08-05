import { query } from '$app/server'
import { sqlite_client } from '$lib/sqlite/client'

interface PopularPostsData {
	daily: PopularPost[]
	monthly: PopularPost[]
	yearly: PopularPost[]
}

export const get_popular_posts = query(async (): Promise<PopularPostsData> => {
	try {
		const [daily_result, monthly_result, yearly_result] = await Promise.all([
			sqlite_client.execute({
				sql: `SELECT pp.id, pp.pathname, p.title, pp.pageviews, pp.visits, pp.date_grouping, pp.last_updated
				  FROM popular_posts pp
				  JOIN posts p ON pp.pathname = '/posts/' || p.slug
				  WHERE pp.date_grouping = 'day'
				  ORDER BY pp.pageviews DESC
				  LIMIT 20`,
			}),
			sqlite_client.execute({
				sql: `SELECT pp.id, pp.pathname, p.title, pp.pageviews, pp.visits, pp.date_grouping, pp.last_updated
				  FROM popular_posts pp
				  JOIN posts p ON pp.pathname = '/posts/' || p.slug
				  WHERE pp.date_grouping = 'month'
				  ORDER BY pp.pageviews DESC
				  LIMIT 20`,
			}),
			sqlite_client.execute({
				sql: `SELECT pp.id, pp.pathname, p.title, pp.pageviews, pp.visits, pp.date_grouping, pp.last_updated
				  FROM popular_posts pp
				  JOIN posts p ON pp.pathname = '/posts/' || p.slug
				  WHERE pp.date_grouping = 'year'
				  ORDER BY pp.pageviews DESC
				  LIMIT 20`,
			}),
		])

		return {
			daily: daily_result.rows.map((row) => ({
				id: String(row.id),
				pathname: String(row.pathname),
				title: String(row.title),
				pageviews: Number(row.pageviews),
				visits: Number(row.visits),
				date_grouping: String(row.date_grouping),
				last_updated: String(row.last_updated),
			})),
			monthly: monthly_result.rows.map((row) => ({
				id: String(row.id),
				pathname: String(row.pathname),
				title: String(row.title),
				pageviews: Number(row.pageviews),
				visits: Number(row.visits),
				date_grouping: String(row.date_grouping),
				last_updated: String(row.last_updated),
			})),
			yearly: yearly_result.rows.map((row) => ({
				id: String(row.id),
				pathname: String(row.pathname),
				title: String(row.title),
				pageviews: Number(row.pageviews),
				visits: Number(row.visits),
				date_grouping: String(row.date_grouping),
				last_updated: String(row.last_updated),
			})),
		}
	} catch (error) {
		console.warn('Database unavailable:', error)
		return { daily: [], monthly: [], yearly: [] }
	}
})