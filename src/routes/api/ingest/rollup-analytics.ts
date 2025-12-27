import { sqlite_client } from '$lib/sqlite/client'

interface RollupResult {
	success: boolean
	monthly_rows: number
	yearly_rows: number
	all_time_rows: number
	error?: string
}

/**
 * Rollup analytics_events into summary tables for /stats page
 * Should be run daily via cron
 */
export async function rollup_analytics(): Promise<RollupResult> {
	const client = sqlite_client

	try {
		// Rollup to analytics_monthly
		// Aggregates by path and year-month
		// COUNT(*) for views - each row is one page view
		const monthly = client.prepare(`
			INSERT OR REPLACE INTO analytics_monthly (pathname, year_month, views, unique_visitors, last_updated)
			SELECT
				path as pathname,
				strftime('%Y-%m', created_at/1000, 'unixepoch') as year_month,
				COUNT(*) as views,
				COUNT(DISTINCT visitor_hash) as unique_visitors,
				CURRENT_TIMESTAMP as last_updated
			FROM analytics_events
			GROUP BY path, strftime('%Y-%m', created_at/1000, 'unixepoch')
		`)
		const monthly_result = monthly.run()

		// Rollup to analytics_yearly
		// Aggregates by path and year
		const yearly = client.prepare(`
			INSERT OR REPLACE INTO analytics_yearly (pathname, year, views, unique_visitors, last_updated)
			SELECT
				path as pathname,
				strftime('%Y', created_at/1000, 'unixepoch') as year,
				COUNT(*) as views,
				COUNT(DISTINCT visitor_hash) as unique_visitors,
				CURRENT_TIMESTAMP as last_updated
			FROM analytics_events
			GROUP BY path, strftime('%Y', created_at/1000, 'unixepoch')
		`)
		const yearly_result = yearly.run()

		// Rollup to analytics_all_time
		// Aggregates by path across all time
		const all_time = client.prepare(`
			INSERT OR REPLACE INTO analytics_all_time (pathname, views, unique_visitors, last_updated)
			SELECT
				path as pathname,
				COUNT(*) as views,
				COUNT(DISTINCT visitor_hash) as unique_visitors,
				CURRENT_TIMESTAMP as last_updated
			FROM analytics_events
			GROUP BY path
		`)
		const all_time_result = all_time.run()

		console.log('Analytics rollup complete:', {
			monthly: monthly_result.changes,
			yearly: yearly_result.changes,
			all_time: all_time_result.changes,
		})

		return {
			success: true,
			monthly_rows: monthly_result.changes,
			yearly_rows: yearly_result.changes,
			all_time_rows: all_time_result.changes,
		}
	} catch (error) {
		console.error('Analytics rollup error:', error)
		return {
			success: false,
			monthly_rows: 0,
			yearly_rows: 0,
			all_time_rows: 0,
			error: error instanceof Error ? error.message : 'Unknown error',
		}
	}
}
