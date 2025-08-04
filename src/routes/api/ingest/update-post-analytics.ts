import { PUBLIC_FATHOM_ID } from '$env/static/public'
import { fetch_fathom_data } from '$lib/fathom'
import { get_posts } from '$lib/posts'
import { sqlite_client } from '$lib/sqlite/client'
import { differenceInHours } from 'date-fns'
import { get_date_range } from './utils'

const delay = (ms: number | undefined) =>
	new Promise((resolve) => setTimeout(resolve, ms))

// Add update frequency constants
const UPDATE_FREQUENCIES = {
	day: 5, // 5 minutes
	month: 24 * 60, // 24 hours in minutes
	year: 24 * 60, // 24 hours in minutes
}

export const update_post_analytics = async (fetch: Fetch) => {
	try {
		const get_last_updated_query = `
      SELECT date_grouping, MAX(last_updated) as last_updated
      FROM post_analytics
      GROUP BY date_grouping;
    `
		const client = sqlite_client
		const last_updated_query_result = await client.execute(
			get_last_updated_query,
		)

		const { posts } = await get_posts()
		const slugs = posts
			.map((post) => post.slug)
			.filter((slug): slug is string => typeof slug === 'string')

		// Create a map of periods that need updating
		const periods_to_update = ['day', 'month', 'year'].filter(
			(period) => {
				const last_updated = last_updated_query_result.rows.find(
					(row) => row.date_grouping === period,
				)

				if (!last_updated || !last_updated.last_updated) return true

				const last_updated_time = new Date(
					typeof last_updated.last_updated === 'number' ||
					typeof last_updated.last_updated === 'string'
						? last_updated.last_updated
						: 0,
				)
				const current_time = new Date()
				const minutes_diff =
					differenceInHours(current_time, last_updated_time) * 60

				return (
					minutes_diff >=
					UPDATE_FREQUENCIES[
						period as keyof typeof UPDATE_FREQUENCIES
					]
				)
			},
		)

		if (periods_to_update.length === 0) {
			return {
				message: 'No periods need updating at this time.',
			}
		}

		for (const period of periods_to_update) {
			await process_period(fetch, period, slugs)
		}

		return {
			message: `Post analytics updated for periods: ${periods_to_update.join(', ')}`,
		}
	} catch (error) {
		console.error('Error during post analytics update:', error)
		return {
			message: 'An error occurred while updating post analytics.',
		}
	}
}

const process_period = async (
	fetch: Fetch,
	period: string,
	slugs: string[],
) => {
	const [date_from, date_to] = get_date_range(period)

	for (const slug of slugs) {
		const params = {
			entity: 'pageview',
			entity_id: PUBLIC_FATHOM_ID,
			aggregates: 'pageviews,visits,uniques,avg_duration,bounce_rate',
			date_grouping: period,
			date_from,
			date_to,
			filters: JSON.stringify([
				{
					property: 'pathname',
					operator: 'is',
					value: `/posts/${slug}`,
				},
			]),
		}

		const fathom_data = await fetch_fathom_data(
			fetch,
			'aggregations',
			params,
			`fetch_post_analytics_${period}`,
		)

		if (fathom_data) {
			await insert_fathom_data_into_turso(fathom_data, slug, period)
		} else {
			console.error(`No data returned for slug: ${slug}`)
		}

		// Delay to respect the rate limit
		await delay(8000)
	}
}

const insert_fathom_data_into_turso = async (
	data: any,
	slug: string,
	period: string,
) => {
	const batch_queries = data.map((row: any) => {
		const { pageviews, visits, uniques, avg_duration, bounce_rate } =
			row
		const args = [
			slug,
			period,
			pageviews,
			visits,
			uniques,
			avg_duration,
			bounce_rate,
		]

		return {
			sql: `
        INSERT INTO post_analytics (
          slug,
          date_grouping,
          pageviews,
          visits,
          uniques,
          avg_duration,
          bounce_rate
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT (slug, date_grouping) DO UPDATE SET
          pageviews = excluded.pageviews,
          visits = excluded.visits,
          uniques = excluded.uniques,
          avg_duration = excluded.avg_duration,
          bounce_rate = excluded.bounce_rate,
          last_updated = CURRENT_TIMESTAMP;
      `,
			args,
		}
	})

	if (batch_queries.length > 0) {
		try {
			const client = sqlite_client
			await client.batch(batch_queries)
			console.log('Batch queries executed:', batch_queries.length)
		} catch (error) {
			console.error('Error during batch insert into Turso DB:', error)
		}
	}
}
