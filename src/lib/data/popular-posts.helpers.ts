import type { SqliteClient } from '$lib/sqlite/client'

interface PopularPostRow {
	id: unknown
	pathname: unknown
	title: unknown
	pageviews: unknown
	visits: unknown
	date_grouping: unknown
	last_updated: unknown
}

export const normalize_popular_post = (
	row: PopularPostRow,
): PopularPost => ({
	id: String(row.id),
	pathname: String(row.pathname),
	title: String(row.title),
	pageviews: Number(row.pageviews),
	visits: Number(row.visits),
	date_grouping: String(row.date_grouping),
	last_updated: String(row.last_updated),
})

export const normalize_popular_posts = (
	rows: PopularPostRow[],
): PopularPost[] => rows.map(normalize_popular_post)

export const build_popular_posts_query = (
	date_grouping: 'day' | 'month' | 'year',
): string => `
	SELECT pp.id, pp.pathname, p.title, pp.pageviews, pp.visits, pp.date_grouping, pp.last_updated
	FROM popular_posts pp
	JOIN posts p ON pp.pathname = '/posts/' || p.slug
	WHERE pp.date_grouping = '${date_grouping}'
	ORDER BY pp.pageviews DESC
	LIMIT 20
`

export const fetch_popular_posts_from_db = async (
	client: SqliteClient,
): Promise<PopularPosts> => {
	const [daily_result, monthly_result, yearly_result] =
		await Promise.all([
			client.execute({ sql: build_popular_posts_query('day') }),
			client.execute({ sql: build_popular_posts_query('month') }),
			client.execute({ sql: build_popular_posts_query('year') }),
		])

	return {
		popular_posts_daily: normalize_popular_posts(
			daily_result.rows as unknown as PopularPostRow[],
		),
		popular_posts_monthly: normalize_popular_posts(
			monthly_result.rows as unknown as PopularPostRow[],
		),
		popular_posts_yearly: normalize_popular_posts(
			yearly_result.rows as unknown as PopularPostRow[],
		),
	}
}
