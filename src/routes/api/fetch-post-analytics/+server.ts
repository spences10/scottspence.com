import { PUBLIC_FATHOM_ID } from '$env/static/public'
import { fetch_fathom_data } from '$lib/fathom'
import { turso_client } from '$lib/turso'
import type { InStatement } from '@libsql/client'
import { json } from '@sveltejs/kit'
import { differenceInHours, parseISO } from 'date-fns'
import { get_date_range } from '../ingest/utils'

const analytics_cache = new Map<string, any>()

// Add cache duration constants
const CACHE_DURATIONS = {
	day: 5, // 5 minutes
	month: 24 * 60, // 24 hours in minutes
	year: 24 * 60, // 24 hours in minutes
}

export const GET = async ({ url, fetch }) => {
	const slug = url.searchParams.get('slug')
	if (!slug) {
		return new Response('No slug provided', { status: 400 })
	}

	// Check each period individually for staleness
	for (const period of ['day', 'month', 'year']) {
		if (await stale_data(slug, period)) {
			const [date_from, date_to] = get_date_range(period)
			const fathom_data = await get_fathom_data(
				slug,
				period,
				date_from,
				date_to,
				fetch,
			)
			if (fathom_data) {
				await insert_fathom_data(slug, [
					{ period, data: fathom_data },
				])
			}
		}
	}

	const visits = await fetch_visits(slug)

	// Handle null visits case
	if (!visits) {
		return json({
			daily_visits: null,
			monthly_visits: null,
			yearly_visits: null,
		})
	}

	return json({
		daily_visits: visits.daily,
		monthly_visits: visits.monthly,
		yearly_visits: visits.yearly,
	})
}

const fetch_visits = async (slug: string) => {
	const cache_key = `analytics-${slug}`
	let cached_data = analytics_cache.get(cache_key)

	// Check if cached data exists and if any period needs updating
	const needs_update =
		!cached_data ||
		Object.entries(CACHE_DURATIONS).some(([period, duration]) => {
			if (!cached_data || !cached_data.last_fetched) return true
			const minutes_diff =
				differenceInHours(
					new Date(),
					parseISO(cached_data.last_fetched),
				) * 60
			return minutes_diff >= duration
		})

	if (!needs_update) {
		return cached_data.data
	}

	// If cache is stale or doesn't exist, fetch new data
	const client = turso_client()
	let page_analytics: any = {
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

	try {
		const result = await client.execute({
			sql,
			args: [slug, slug, slug],
		})

		// Process the results
		result.rows.forEach((row) => {
			if (row.period === 'day') page_analytics.daily = row
			if (row.period === 'month') page_analytics.monthly = row
			if (row.period === 'year') page_analytics.yearly = row
		})
	} catch (error) {
		console.error('Error fetching from Turso DB:', error)
		return null
	}

	// After fetching new data, update the cache
	const new_data = {
		last_fetched: new Date().toISOString(),
		data: page_analytics,
	}
	analytics_cache.set(cache_key, new_data)

	// Return the data
	return page_analytics
}

const stale_data = async (slug: string, period: string) => {
	const sql = `
    SELECT last_updated
    FROM post_analytics
    WHERE slug = ? AND date_grouping = ?;
  `
	const client = turso_client()
	try {
		const result = await client.execute({
			sql,
			args: [slug, period],
		})
		const last_updated = result.rows[0]?.last_updated

		if (last_updated) {
			const minutes_difference =
				differenceInHours(
					new Date(),
					parseISO(String(last_updated)),
				) * 60

			return (
				minutes_difference >=
				CACHE_DURATIONS[period as keyof typeof CACHE_DURATIONS]
			)
		} else {
			console.log(
				'No last updated date found, assuming data is stale.',
			)
			return true
		}
	} catch (error) {
		console.error('Error checking last updated:', error)
		return false
	}
}

const get_fathom_data = async (
	slug: string,
	period: string,
	date_from: string,
	date_to: string,
	fetch: Fetch,
) => {
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
		console.error(
			`Error fetching from Fathom for period ${period}:`,
			error,
		)
		return null
	}
}

const insert_fathom_data = async (
	slug: string,
	data_batches: { period: any; data: any }[],
) => {
	const client = turso_client()
	const queries: InStatement[] | { sql: string; args: any[] }[] = []

	data_batches.forEach(({ period, data }) => {
		if (!data || !data[0]) {
			console.log(
				`No data available for period: ${period}, skipping...`,
			)
			return // Skip this iteration as there's no data
		}

		const { pageviews, visits, uniques, avg_duration, bounce_rate } =
			data[0]

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
		await client.batch(queries)
		console.log(
			`Batch insert/update completed for ${queries.length} periods.`,
		)
	} catch (error) {
		console.error(`Error inserting batch data:`, error)
	}
}
