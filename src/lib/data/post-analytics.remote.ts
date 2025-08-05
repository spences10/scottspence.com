import { query } from '$app/server'
import { PUBLIC_FATHOM_ID } from '$env/static/public'
import { fetch_fathom_data } from '$lib/fathom'
import { sqlite_client } from '$lib/sqlite/client'
import { differenceInHours, parseISO } from 'date-fns'
import { get_date_range } from '../../routes/api/ingest/utils'
import * as v from 'valibot'

interface PostAnalytics {
	daily: any | null
	monthly: any | null
	yearly: any | null
}

export const get_post_analytics = query(v.string(), async (slug: string): Promise<PostAnalytics> => {
	try {
		// Check each period individually for staleness and refresh if needed
		for (const period of ['day', 'month', 'year']) {
			if (await is_stale_data(slug, period)) {
				const [date_from, date_to] = get_date_range(period)
				const fathom_data = await get_fathom_data(slug, period, date_from, date_to)
				if (fathom_data) {
					await insert_fathom_data(slug, [{ period, data: fathom_data }])
				}
			}
		}

		// Fetch the analytics data
		let page_analytics: PostAnalytics = {
			daily: null,
			monthly: null,
			yearly: null,
		}

		// Construct and execute the UNION query
		const sql = `
			SELECT 'day' AS period, * FROM post_analytics WHERE date_grouping = 'day' AND slug = ?
			UNION
			SELECT 'month' AS period, * FROM post_analytics WHERE date_grouping = 'month' AND slug = ?
			UNION
			SELECT 'year' AS period, * FROM post_analytics WHERE date_grouping = 'year' AND slug = ?;
		`

		const result = await sqlite_client.execute({
			sql,
			args: [slug, slug, slug],
		})

		// Process the results
		result.rows.forEach((row) => {
			if (row.period === 'day') page_analytics.daily = row
			if (row.period === 'month') page_analytics.monthly = row
			if (row.period === 'year') page_analytics.yearly = row
		})

		return page_analytics
	} catch (error) {
		console.warn('Database unavailable for post analytics:', error)
		return { daily: null, monthly: null, yearly: null }
	}
})

async function is_stale_data(slug: string, period: string): Promise<boolean> {
	const sql = `
		SELECT last_updated
		FROM post_analytics
		WHERE slug = ? AND date_grouping = ?;
	`
	try {
		const result = await sqlite_client.execute({
			sql,
			args: [slug, period],
		})
		const last_updated = result.rows[0]?.last_updated

		if (last_updated) {
			const minutes_difference =
				differenceInHours(new Date(), parseISO(String(last_updated))) * 60

			// Define cache durations in minutes
			const durations: Record<string, number> = {
				day: 60,    // 1 hour
				month: 1440, // 24 hours
				year: 10080, // 7 days
			}
			return minutes_difference >= durations[period]
		} else {
			console.log('No last updated date found, assuming data is stale.')
			return true
		}
	} catch (error) {
		console.error('Error checking last updated:', error)
		return false
	}
}

async function get_fathom_data(
	slug: string,
	period: string,
	date_from: string,
	date_to: string,
) {
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
	try {
		const fathom_data = await fetch_fathom_data(
			fetch,
			'aggregations',
			params,
			`fetch_post_analytics_${period}`,
		)
		return fathom_data
	} catch (error) {
		console.error(`Error fetching from Fathom for period ${period}:`, error)
		return null
	}
}

async function insert_fathom_data(
	slug: string,
	data_batches: { period: any; data: any }[],
) {
	const queries: { sql: string; args: any[] }[] = []

	data_batches.forEach(({ period, data }) => {
		if (!data || !data[0]) {
			console.log(`No data available for period: ${period}, skipping...`)
			return // Skip this iteration as there's no data
		}

		const { pageviews, visits, uniques, avg_duration, bounce_rate } = data[0]

		const args = [
			slug,
			period,
			parseInt(pageviews, 10) || 0,
			parseInt(visits, 10) || 0,
			parseInt(uniques, 10) || 0,
			parseFloat(avg_duration) || 0,
			parseFloat(bounce_rate) || 0,
		]

		const sql = `
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
		`

		queries.push({ sql, args })
	})

	if (queries.length === 0) {
		console.log('No queries to execute, all periods were empty.')
		return // Exit early if there are no queries to execute
	}

	try {
		await sqlite_client.batch(queries)
		console.log(`Batch insert/update completed for ${queries.length} periods.`)
	} catch (error) {
		console.error(`Error inserting batch data:`, error)
	}
}