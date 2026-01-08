import { query } from '$app/server'
import {
	CACHE_DURATIONS,
	get_from_cache,
	set_cache,
} from '$lib/cache/server-cache'
import { sqlite_client } from '$lib/sqlite/client'
import * as v from 'valibot'
import { BOT_THRESHOLDS } from './bot-thresholds'
import {
	get_period_boundaries,
	type FilterMode,
	type StatsPeriod,
} from './period-stats.helpers'

export type ChartDataPoint = {
	timestamp: string
	views: number
	visitors: number
}

export type ChartData = {
	data_points: ChartDataPoint[]
	period: StatsPeriod
	filter_mode: FilterMode
}

/**
 * Get visitor hashes that exceed behaviour thresholds
 */
const get_behaviour_bot_hashes = (
	start: number,
	end: number,
): Set<string> => {
	const per_path_result = sqlite_client.execute({
		sql: `SELECT DISTINCT visitor_hash
			FROM analytics_events
			WHERE created_at >= ? AND created_at < ?
			GROUP BY visitor_hash, path
			HAVING COUNT(*) > ?`,
		args: [start, end, BOT_THRESHOLDS.MAX_HITS_PER_PATH_PER_DAY],
	})

	const total_result = sqlite_client.execute({
		sql: `SELECT visitor_hash
			FROM analytics_events
			WHERE created_at >= ? AND created_at < ?
			GROUP BY visitor_hash
			HAVING COUNT(*) > ?`,
		args: [start, end, BOT_THRESHOLDS.MAX_HITS_TOTAL_PER_DAY],
	})

	const hashes = new Set<string>()
	per_path_result.rows.forEach((r) =>
		hashes.add(r.visitor_hash as string),
	)
	total_result.rows.forEach((r) =>
		hashes.add(r.visitor_hash as string),
	)
	return hashes
}

/**
 * Get time-series chart data for a period
 * Returns hourly data for today/yesterday, daily for week/month, monthly for year
 */
export const get_chart_data = query(
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
	({ period, filter_mode }): ChartData => {
		const mode = filter_mode as FilterMode

		// Check cache
		const cache_key = `chart_data_${period}_${mode}`
		const cached = get_from_cache<ChartData>(
			cache_key,
			CACHE_DURATIONS.period_stats,
		)
		if (cached) {
			return cached
		}

		const { start, end } = get_period_boundaries(
			period as StatsPeriod,
		)

		// Get behaviour bot hashes
		const behaviour_bots = get_behaviour_bot_hashes(start, end)
		const bot_hashes = [...behaviour_bots]

		// Build WHERE clause based on filter mode
		let bot_condition: string
		let bot_args: (string | number)[] = []

		if (mode === 'humans') {
			if (bot_hashes.length > 0) {
				const placeholders = bot_hashes.map(() => '?').join(',')
				bot_condition = `AND is_bot = 0 AND visitor_hash NOT IN (${placeholders})`
				bot_args = bot_hashes
			} else {
				bot_condition = 'AND is_bot = 0'
			}
		} else if (mode === 'bots') {
			if (bot_hashes.length > 0) {
				const placeholders = bot_hashes.map(() => '?').join(',')
				bot_condition = `AND (is_bot = 1 OR visitor_hash IN (${placeholders}))`
				bot_args = bot_hashes
			} else {
				bot_condition = 'AND is_bot = 1'
			}
		} else {
			bot_condition = ''
		}

		let data_points: ChartDataPoint[] = []

		if (period === 'today' || period === 'yesterday') {
			// Hourly granularity from analytics_events
			const result = sqlite_client.execute({
				sql: `SELECT
					strftime('%Y-%m-%d %H:00', datetime(created_at/1000, 'unixepoch')) as timestamp,
					COUNT(*) as views,
					COUNT(DISTINCT visitor_hash) as visitors
				FROM analytics_events
				WHERE created_at >= ? AND created_at < ? ${bot_condition}
				GROUP BY timestamp
				ORDER BY timestamp ASC`,
				args: [start, end, ...bot_args],
			})
			data_points = result.rows as ChartDataPoint[]
		} else if (period === 'week' || period === 'month') {
			// Daily granularity from analytics_daily
			const start_date = new Date(start).toISOString().split('T')[0]
			const end_date = new Date(end).toISOString().split('T')[0]

			const result = sqlite_client.execute({
				sql: `SELECT
					date as timestamp,
					SUM(views) as views,
					SUM(unique_visitors) as visitors
				FROM analytics_daily
				WHERE date >= ? AND date < ?
				GROUP BY date
				ORDER BY date ASC`,
				args: [start_date, end_date],
			})
			data_points = result.rows as ChartDataPoint[]
		} else if (period === 'year') {
			// Monthly granularity from analytics_monthly
			const now = new Date()
			const year_ago = new Date(
				now.getFullYear() - 1,
				now.getMonth(),
				1,
			)
			const start_month = year_ago.toISOString().slice(0, 7)

			const result = sqlite_client.execute({
				sql: `SELECT
					year_month as timestamp,
					SUM(views) as views,
					SUM(unique_visitors) as visitors
				FROM analytics_monthly
				WHERE year_month >= ?
				GROUP BY year_month
				ORDER BY year_month ASC`,
				args: [start_month],
			})
			data_points = result.rows as ChartDataPoint[]
		}

		const chart_data: ChartData = {
			data_points,
			period: period as StatsPeriod,
			filter_mode: mode,
		}

		set_cache(cache_key, chart_data)
		return chart_data
	},
)
