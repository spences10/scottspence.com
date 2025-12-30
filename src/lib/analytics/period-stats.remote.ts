import { query } from '$app/server'
import { sqlite_client } from '$lib/sqlite/client'
import * as v from 'valibot'
import {
	format_period_stats,
	get_period_boundaries,
	type PeriodStats,
	type StatsPeriod,
} from './period-stats.helpers'

// Re-export types for consumers
export type { PeriodStats, StatsPeriod } from './period-stats.helpers'

/**
 * Get analytics stats for a specific time period
 * Queries analytics_events table with time filter
 */
export const get_period_stats = query(
	v.object({
		period: v.picklist([
			'today',
			'yesterday',
			'week',
			'month',
			'year',
		]),
	}),
	({ period }): PeriodStats => {
		const { start, end } = get_period_boundaries(
			period as StatsPeriod,
		)

		// Total views and unique visitors
		const totals_result = sqlite_client.execute({
			sql: `SELECT
				COUNT(*) as views,
				COUNT(DISTINCT visitor_hash) as unique_visitors
			FROM analytics_events
			WHERE created_at >= ? AND created_at < ? AND is_bot = 0`,
			args: [start, end],
		})
		const totals = {
			views: (totals_result.rows[0]?.views as number) ?? 0,
			unique_visitors:
				(totals_result.rows[0]?.unique_visitors as number) ?? 0,
		}

		// Top pages
		const pages_result = sqlite_client.execute({
			sql: `SELECT
				path,
				COUNT(*) as views,
				COUNT(DISTINCT visitor_hash) as visitors
			FROM analytics_events
			WHERE created_at >= ? AND created_at < ? AND is_bot = 0
			GROUP BY path
			ORDER BY visitors DESC
			LIMIT 10`,
			args: [start, end],
		})
		const top_pages = pages_result.rows as {
			path: string
			views: number
			visitors: number
		}[]

		// Countries
		const countries_result = sqlite_client.execute({
			sql: `SELECT
				country,
				COUNT(DISTINCT visitor_hash) as visitors
			FROM analytics_events
			WHERE created_at >= ? AND created_at < ?
				AND is_bot = 0
				AND country IS NOT NULL
				AND country != ''
			GROUP BY country
			ORDER BY visitors DESC
			LIMIT 10`,
			args: [start, end],
		})
		const countries = countries_result.rows as {
			country: string
			visitors: number
		}[]

		// Browsers
		const browsers_result = sqlite_client.execute({
			sql: `SELECT
				browser,
				COUNT(DISTINCT visitor_hash) as visitors
			FROM analytics_events
			WHERE created_at >= ? AND created_at < ?
				AND is_bot = 0
				AND browser IS NOT NULL
			GROUP BY browser
			ORDER BY visitors DESC
			LIMIT 5`,
			args: [start, end],
		})
		const browsers = browsers_result.rows as {
			browser: string
			visitors: number
		}[]

		// Devices
		const devices_result = sqlite_client.execute({
			sql: `SELECT
				device_type,
				COUNT(DISTINCT visitor_hash) as visitors
			FROM analytics_events
			WHERE created_at >= ? AND created_at < ?
				AND is_bot = 0
				AND device_type IS NOT NULL
			GROUP BY device_type
			ORDER BY visitors DESC`,
			args: [start, end],
		})
		const devices = devices_result.rows as {
			device_type: string
			visitors: number
		}[]

		return format_period_stats(
			period as StatsPeriod,
			totals,
			top_pages,
			countries,
			browsers,
			devices,
		)
	},
)
