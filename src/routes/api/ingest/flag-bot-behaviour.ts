import { sqlite_client } from '$lib/sqlite/client'

/**
 * Behaviour-based bot detection thresholds
 * Adjust these based on observed traffic patterns
 */
export const BOT_THRESHOLDS = {
	// Max hits per visitor per path per day before flagged as bot
	MAX_HITS_PER_PATH_PER_DAY: 50,

	// Max hits per visitor across all paths per day
	MAX_HITS_TOTAL_PER_DAY: 200,

	// Max hits per visitor per path per hour (burst detection)
	MAX_HITS_PER_PATH_PER_HOUR: 20,
} as const

/**
 * Flag suspicious visitors as bots based on behaviour patterns
 * Run via cron at 00:10 daily (after events accumulate, before rollup)
 *
 * Flags events as is_bot=1 when visitor exceeds thresholds
 * Preserves raw data - just updates the bot flag
 */
export const flag_bot_behaviour = async () => {
	const client = sqlite_client

	// Calculate yesterday's date range
	const now = new Date()
	const yesterday = new Date(now)
	yesterday.setDate(yesterday.getDate() - 1)
	const date_str = yesterday.toISOString().slice(0, 10)
	const start_ts = new Date(date_str + 'T00:00:00Z').getTime()
	const end_ts = start_ts + 86400000

	console.log(`[bot-flag] Processing ${date_str}`)

	// Flag 1: Excessive hits per path per day
	const flag_per_path = client.prepare(`
		UPDATE analytics_events
		SET is_bot = 1
		WHERE created_at >= ? AND created_at < ?
		AND is_bot = 0
		AND visitor_hash IN (
			SELECT visitor_hash
			FROM analytics_events
			WHERE created_at >= ? AND created_at < ?
			GROUP BY visitor_hash, path
			HAVING COUNT(*) > ?
		)
	`)
	const per_path_result = flag_per_path.run(
		start_ts,
		end_ts,
		start_ts,
		end_ts,
		BOT_THRESHOLDS.MAX_HITS_PER_PATH_PER_DAY,
	)
	console.log(
		`[bot-flag] Flagged ${per_path_result.changes} events (per-path threshold: ${BOT_THRESHOLDS.MAX_HITS_PER_PATH_PER_DAY})`,
	)

	// Flag 2: Excessive total hits per day
	const flag_total = client.prepare(`
		UPDATE analytics_events
		SET is_bot = 1
		WHERE created_at >= ? AND created_at < ?
		AND is_bot = 0
		AND visitor_hash IN (
			SELECT visitor_hash
			FROM analytics_events
			WHERE created_at >= ? AND created_at < ?
			GROUP BY visitor_hash
			HAVING COUNT(*) > ?
		)
	`)
	const total_result = flag_total.run(
		start_ts,
		end_ts,
		start_ts,
		end_ts,
		BOT_THRESHOLDS.MAX_HITS_TOTAL_PER_DAY,
	)
	console.log(
		`[bot-flag] Flagged ${total_result.changes} events (total threshold: ${BOT_THRESHOLDS.MAX_HITS_TOTAL_PER_DAY})`,
	)

	// Count how many unique visitors were flagged
	const flagged_visitors = client
		.prepare(
			`
		SELECT COUNT(DISTINCT visitor_hash) as count
		FROM analytics_events
		WHERE created_at >= ? AND created_at < ?
		AND is_bot = 1
	`,
		)
		.get(start_ts, end_ts) as { count: number }

	return {
		success: true,
		message: `Flagged bot behaviour for ${date_str}`,
		events_flagged: per_path_result.changes + total_result.changes,
		visitors_flagged: flagged_visitors.count,
		thresholds: BOT_THRESHOLDS,
	}
}
