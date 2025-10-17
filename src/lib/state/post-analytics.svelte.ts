import { PUBLIC_FATHOM_ID } from '$env/static/public'
import {
	BYPASS_DB_READS,
	CACHE_DURATIONS,
} from '$lib/cache/server-cache'
import { fetch_fathom_data } from '$lib/fathom'
import { sqlite_client } from '$lib/sqlite/client'
import { differenceInHours, parseISO } from 'date-fns'
import { get_date_range } from '../../routes/api/ingest/utils'

class PostAnalyticsState {
	cache = $state<
		Map<string, { data: PostAnalytics; timestamp: number }>
	>(new Map())
	loading = $state<Set<string>>(new Set())

	async load_post_analytics(slug: string): Promise<PostAnalytics> {
		if (BYPASS_DB_READS.post_analytics) {
			return { daily: null, monthly: null, yearly: null }
		}

		// Check cache first
		const cached = this.cache.get(slug)
		if (
			cached &&
			Date.now() - cached.timestamp <
				CACHE_DURATIONS.post_analytics.day
		) {
			return cached.data
		}

		// Prevent concurrent requests for the same slug
		if (this.loading.has(slug)) {
			return (
				cached?.data || { daily: null, monthly: null, yearly: null }
			)
		}

		this.loading.add(slug)

		try {
			// Check each period individually for staleness
			for (const period of ['day', 'month', 'year']) {
				if (await this.stale_data(slug, period)) {
					const [date_from, date_to] = get_date_range(period)
					const fathom_data = await this.get_fathom_data(
						slug,
						period,
						date_from,
						date_to,
					)
					if (fathom_data) {
						await this.insert_fathom_data(slug, [
							{ period, data: fathom_data },
						])
					}
				}
			}

			const analytics = await this.fetch_visits(slug)

			// Cache the result
			this.cache.set(slug, {
				data: analytics || {
					daily: null,
					monthly: null,
					yearly: null,
				},
				timestamp: Date.now(),
			})

			return analytics || { daily: null, monthly: null, yearly: null }
		} catch (error) {
			console.warn(
				'Database unavailable, returning cached or empty analytics:',
				error instanceof Error ? error.message : 'Unknown error',
			)
			// Keep existing cached data on error - don't clear it
			return (
				cached?.data || { daily: null, monthly: null, yearly: null }
			)
		} finally {
			this.loading.delete(slug)
		}
	}

	private async fetch_visits(
		slug: string,
	): Promise<PostAnalytics | null> {
		const client = sqlite_client
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
			console.error('Error fetching from database:', error)
			return null
		}

		return page_analytics
	}

	private async stale_data(
		slug: string,
		period: string,
	): Promise<boolean> {
		const sql = `
			SELECT last_updated
			FROM post_analytics
			WHERE slug = ? AND date_grouping = ?;
		`
		const client = sqlite_client
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

				const durations = CACHE_DURATIONS.post_analytics as any
				return minutes_difference >= durations[period]
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

	private async get_fathom_data(
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
			console.error(
				`Error fetching from Fathom for period ${period}:`,
				error,
			)
			return null
		}
	}

	private async insert_fathom_data(
		slug: string,
		data_batches: { period: any; data: any }[],
	) {
		const client = sqlite_client
		const queries: { sql: string; args: any[] }[] = []

		data_batches.forEach(({ period, data }) => {
			if (!data || !data[0]) {
				console.log(
					`No data available for period: ${period}, skipping...`,
				)
				return // Skip this iteration as there's no data
			}

			const {
				pageviews,
				visits,
				uniques,
				avg_duration,
				bounce_rate,
			} = data[0]

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
}

// Single universal instance shared everywhere
export const post_analytics_state = new PostAnalyticsState()

// Fallback function for server-side usage
export const get_post_analytics_for_slug = async (
	slug: string,
): Promise<PostAnalytics> => {
	if (BYPASS_DB_READS.post_analytics) {
		return { daily: null, monthly: null, yearly: null }
	}

	const client = sqlite_client

	try {
		// Check each period individually for staleness
		for (const period of ['day', 'month', 'year']) {
			if (await stale_data(slug, period)) {
				const [date_from, date_to] = get_date_range(period)
				const fathom_data = await get_fathom_data(
					slug,
					period,
					date_from,
					date_to,
				)
				if (fathom_data) {
					await insert_fathom_data(slug, [
						{ period, data: fathom_data },
					])
				}
			}
		}

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

		return page_analytics
	} catch (error) {
		console.warn(
			'Database unavailable, returning empty analytics:',
			error instanceof Error ? error.message : 'Unknown error',
		)
		return { daily: null, monthly: null, yearly: null }
	}
}

// Helper functions for server-side usage
const stale_data = async (
	slug: string,
	period: string,
): Promise<boolean> => {
	const sql = `
		SELECT last_updated
		FROM post_analytics
		WHERE slug = ? AND date_grouping = ?;
	`
	const client = sqlite_client
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

			const durations = CACHE_DURATIONS.post_analytics as any
			return minutes_difference >= durations[period]
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
	const client = sqlite_client
	const queries: { sql: string; args: any[] }[] = []

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
