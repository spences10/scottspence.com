import { PUBLIC_FATHOM_ID } from '$env/static/public'
import { fetch_fathom_data } from '$lib/fathom'
import { turso_client } from '$lib/turso'
import { get_date_range } from './utils'

const insert_fathom_data_into_turso = async (
	data: PopularPost[],
	period: string,
) => {
	const client = turso_client()
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
			Number.isInteger(post.pageviews)
				? post.pageviews
				: parseInt(post.pageviews, 10),
			Number.isInteger(post.visits)
				? post.visits
				: parseInt(post.visits, 10),
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
				const transformed_data = fathom_data.map(
					(data: PopularPost) => ({
						pathname: data.pathname,
						title: 'Default Title',
						pageviews: data.pageviews,
						visits: data.visits,
					}),
				)

				await insert_fathom_data_into_turso(transformed_data, period)
				popular_posts = transformed_data as unknown as PopularPost[]
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
