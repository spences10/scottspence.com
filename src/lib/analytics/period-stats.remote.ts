import { query } from '$app/server'
import { sqlite_client } from '$lib/sqlite/client'
import * as v from 'valibot'
import {
	format_period_stats,
	get_period_boundaries,
	type FilterMode,
	type PeriodStats,
	type StatsPeriod,
} from './period-stats.helpers'

// Re-export types for consumers
export type {
	FilterMode,
	PeriodStats,
	StatsPeriod,
} from './period-stats.helpers'

// Behaviour-based bot threshold (matches flag-bot-behaviour.ts)
const BOT_THRESHOLD_TOTAL_HITS = 200

/**
 * Get visitor hashes that exceed behaviour thresholds for a period
 * These are bots spoofing real user agents
 */
const get_behaviour_bot_hashes = (
	start: number,
	end: number,
): Set<string> => {
	const result = sqlite_client.execute({
		sql: `SELECT visitor_hash
			FROM analytics_events
			WHERE created_at >= ? AND created_at < ?
			GROUP BY visitor_hash
			HAVING COUNT(*) > ?`,
		args: [start, end, BOT_THRESHOLD_TOTAL_HITS],
	})
	return new Set(result.rows.map((r) => r.visitor_hash as string))
}

/**
 * Get analytics stats for a specific time period
 * Queries analytics_events table with time filter and bot filtering
 *
 * filter_mode:
 * - 'humans' (default): excludes flagged bots AND behaviour bots
 * - 'bots': shows only detected bots (flagged + behaviour)
 * - 'all': raw unfiltered data
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
		filter_mode: v.optional(
			v.picklist(['humans', 'bots', 'all']),
			'humans',
		),
	}),
	({ period, filter_mode }): PeriodStats => {
		const { start, end } = get_period_boundaries(
			period as StatsPeriod,
		)
		const mode = filter_mode as FilterMode

		// Get behaviour bot hashes for this period
		const behaviour_bots = get_behaviour_bot_hashes(start, end)
		const bot_hashes = [...behaviour_bots]

		// Build WHERE clause based on filter mode
		let bot_condition: string
		let bot_args: (string | number)[] = []

		if (mode === 'humans') {
			// Exclude flagged bots AND behaviour bots
			if (bot_hashes.length > 0) {
				const placeholders = bot_hashes.map(() => '?').join(',')
				bot_condition = `AND is_bot = 0 AND visitor_hash NOT IN (${placeholders})`
				bot_args = bot_hashes
			} else {
				bot_condition = 'AND is_bot = 0'
			}
		} else if (mode === 'bots') {
			// Include only bots (flagged OR behaviour)
			if (bot_hashes.length > 0) {
				const placeholders = bot_hashes.map(() => '?').join(',')
				bot_condition = `AND (is_bot = 1 OR visitor_hash IN (${placeholders}))`
				bot_args = bot_hashes
			} else {
				bot_condition = 'AND is_bot = 1'
			}
		} else {
			// All - no filtering
			bot_condition = ''
		}

		// Total views and unique visitors (filtered)
		const totals_result = sqlite_client.execute({
			sql: `SELECT
				COUNT(*) as views,
				COUNT(DISTINCT visitor_hash) as unique_visitors
			FROM analytics_events
			WHERE created_at >= ? AND created_at < ? ${bot_condition}`,
			args: [start, end, ...bot_args],
		})
		const totals = {
			views: (totals_result.rows[0]?.views as number) ?? 0,
			unique_visitors:
				(totals_result.rows[0]?.unique_visitors as number) ?? 0,
		}

		// Bot totals (always calculate for display)
		let bot_totals = { views: 0, visitors: 0 }
		if (bot_hashes.length > 0) {
			const placeholders = bot_hashes.map(() => '?').join(',')
			const bot_result = sqlite_client.execute({
				sql: `SELECT
					COUNT(*) as views,
					COUNT(DISTINCT visitor_hash) as visitors
				FROM analytics_events
				WHERE created_at >= ? AND created_at < ?
				AND (is_bot = 1 OR visitor_hash IN (${placeholders}))`,
				args: [start, end, ...bot_hashes],
			})
			bot_totals = {
				views: (bot_result.rows[0]?.views as number) ?? 0,
				visitors: (bot_result.rows[0]?.visitors as number) ?? 0,
			}
		} else {
			// Just flagged bots
			const bot_result = sqlite_client.execute({
				sql: `SELECT
					COUNT(*) as views,
					COUNT(DISTINCT visitor_hash) as visitors
				FROM analytics_events
				WHERE created_at >= ? AND created_at < ? AND is_bot = 1`,
				args: [start, end],
			})
			bot_totals = {
				views: (bot_result.rows[0]?.views as number) ?? 0,
				visitors: (bot_result.rows[0]?.visitors as number) ?? 0,
			}
		}

		// Top pages
		const pages_result = sqlite_client.execute({
			sql: `SELECT
				path,
				COUNT(*) as views,
				COUNT(DISTINCT visitor_hash) as visitors
			FROM analytics_events
			WHERE created_at >= ? AND created_at < ? ${bot_condition}
			GROUP BY path
			ORDER BY visitors DESC
			LIMIT 10`,
			args: [start, end, ...bot_args],
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
				${bot_condition}
				AND country IS NOT NULL
				AND country != ''
			GROUP BY country
			ORDER BY visitors DESC
			LIMIT 10`,
			args: [start, end, ...bot_args],
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
				${bot_condition}
				AND browser IS NOT NULL
			GROUP BY browser
			ORDER BY visitors DESC
			LIMIT 5`,
			args: [start, end, ...bot_args],
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
				${bot_condition}
				AND device_type IS NOT NULL
			GROUP BY device_type
			ORDER BY visitors DESC`,
			args: [start, end, ...bot_args],
		})
		const devices = devices_result.rows as {
			device_type: string
			visitors: number
		}[]

		return format_period_stats(
			period as StatsPeriod,
			mode,
			totals,
			bot_totals,
			top_pages,
			countries,
			browsers,
			devices,
		)
	},
)
