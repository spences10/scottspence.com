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
	build_engagement_stats,
	type EngagementStats,
} from './engagement-stats.helpers'
import {
	get_period_boundaries,
	type StatsPeriod,
} from './period-stats.helpers'

// Re-export types for consumers
export type {
	EngagementStat,
	EngagementStats,
} from './engagement-stats.helpers'

/**
 * Get behaviour bot hashes for filtering
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
 * Get engagement stats (click rate) per page for a period
 * Only counts human visitors (excludes bots)
 */
export const get_engagement_stats = query(
	v.object({
		period: v.picklist([
			'today',
			'yesterday',
			'week',
			'month',
			'year',
		]),
	}),
	({ period }): EngagementStats => {
		const cache_key = `engagement_stats_${period}`
		const cached = get_from_cache<EngagementStats>(
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

		// Build bot exclusion condition
		let bot_condition: string
		let bot_args: string[] = []

		if (bot_hashes.length > 0) {
			const placeholders = bot_hashes.map(() => '?').join(',')
			bot_condition = `AND is_bot = 0 AND visitor_hash NOT IN (${placeholders})`
			bot_args = bot_hashes
		} else {
			bot_condition = 'AND is_bot = 0'
		}

		// Get human views per path
		const views_result = sqlite_client.execute({
			sql: `SELECT
				path,
				COUNT(*) as human_views
			FROM analytics_events
			WHERE created_at >= ? AND created_at < ? ${bot_condition}
			GROUP BY path`,
			args: [start, end, ...bot_args],
		})

		const views_by_path = new Map<string, number>()
		for (const row of views_result.rows) {
			views_by_path.set(row.path as string, row.human_views as number)
		}

		// Get clicks per path (within same period)
		const clicks_result = sqlite_client.execute({
			sql: `SELECT
				path,
				COUNT(*) as clicks
			FROM click_events
			WHERE created_at >= ? AND created_at < ?
			GROUP BY path`,
			args: [start, end],
		})

		const clicks_by_path = new Map<string, number>()
		for (const row of clicks_result.rows) {
			clicks_by_path.set(row.path as string, row.clicks as number)
		}

		// Use helper to build stats
		const result = build_engagement_stats(
			clicks_by_path,
			views_by_path,
			period as StatsPeriod,
		)

		set_cache(cache_key, result)
		return result
	},
)
