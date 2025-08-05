import { PUBLIC_FATHOM_ID } from '$env/static/public'
import { fetch_fathom_data } from '$lib/fathom'
import { sqlite_client } from '$lib/sqlite/client'
import { get_date_range } from './utils'

const insert_fathom_data_into_sqlite = async (
	data: PopularPost[],
	period: string,
) => {
	const client = sqlite_client
	const batch_queries = []
	const insert_query = `
    INSERT INTO popular_posts (pathname, pageviews, visits, date_grouping)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(pathname, date_grouping) DO UPDATE SET
      pageviews = excluded.pageviews,
      visits = excluded.visits,
      last_updated = CURRENT_TIMESTAMP;
  `

	// Prepare the data for batch insertion
	for (const post of data) {
		const args = [
			post.pathname,
			typeof post.pageviews === 'string'
				? parseInt(post.pageviews, 10)
				: post.pageviews,
			typeof post.visits === 'string'
				? parseInt(post.visits, 10)
				: post.visits,
			period,
		]
		batch_queries.push({ sql: insert_query, args })
	}

	// Execute all queries in a batch
	if (batch_queries.length > 0) {
		try {
			await client.batch(batch_queries)
		} catch (error) {
			console.error('Error during batch insert into Turso DB:', error)
		}
	}
}

export const update_popular_posts = async (fetch: Fetch) => {
	let all_period_popular_posts = []

	for (const period of ['day', 'month', 'year']) {
		let popular_posts: PopularPost[] = []

		try {
			// Fetch data from Fathom
			const [date_from, date_to] = get_date_range(period)

			const fathom_data = await fetch_fathom_data(
				fetch,
				'aggregations',
				{
					entity: 'pageview',
					entity_id: PUBLIC_FATHOM_ID,
					aggregates: 'visits,pageviews',
					field_grouping: 'pathname',
					date_from,
					date_to,
					sort_by: 'pageviews:desc',
					limit: '100',
				},
				`fetch_popular_posts_${period}`,
			)

			if (fathom_data && Array.isArray(fathom_data)) {
				const transformed_data: PopularPost[] = fathom_data.map(
					(data: any) => ({
						id: '',
						pathname: data.pathname,
						title: 'Default Title',
						pageviews: data.pageviews,
						visits: data.visits,
						date_grouping: period,
						last_updated: '',
					}),
				)

				await insert_fathom_data_into_sqlite(transformed_data, period)
				popular_posts = transformed_data
			}
		} catch (error) {
			console.error(
				'Error fetching from Fathom or inserting into Turso DB:',
				error,
			)
		}

		all_period_popular_posts.push({ period, popular_posts })
	}

	// return all_period_popular_posts
	return { message: 'Popular posts updated' }
}
