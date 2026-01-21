import { BOT_THRESHOLDS } from '$lib/analytics/bot-thresholds'
import { sqlite_client } from '$lib/sqlite/client'

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

	// Flag 3: Homepage monitors - high homepage % + high direct % + many IPs
	const flag_homepage_monitors = client.prepare(`
		UPDATE analytics_events
		SET is_bot = 1
		WHERE created_at >= ? AND created_at < ?
		AND is_bot = 0
		AND user_agent IN (
			SELECT user_agent
			FROM analytics_events
			WHERE created_at >= ? AND created_at < ?
			GROUP BY user_agent
			HAVING
				COUNT(DISTINCT visitor_hash) > ?
				AND 100.0 * SUM(CASE WHEN path = '/' THEN 1 ELSE 0 END) / COUNT(*) > ?
				AND 100.0 * SUM(CASE WHEN referrer IS NULL THEN 1 ELSE 0 END) / COUNT(*) > ?
		)
	`)
	const homepage_result = flag_homepage_monitors.run(
		start_ts,
		end_ts,
		start_ts,
		end_ts,
		BOT_THRESHOLDS.MIN_VISITORS_FOR_AGGREGATE,
		BOT_THRESHOLDS.HOMEPAGE_PCT_THRESHOLD,
		BOT_THRESHOLDS.DIRECT_PCT_THRESHOLD,
	)
	console.log(
		`[bot-flag] Flagged ${homepage_result.changes} events (homepage monitors)`,
	)

	// Flag 4: Direct-only scrapers - 100% direct traffic + many IPs + >50% homepage
	// (homepage requirement excludes legitimate app users who visit posts)
	const flag_direct_only = client.prepare(`
		UPDATE analytics_events
		SET is_bot = 1
		WHERE created_at >= ? AND created_at < ?
		AND is_bot = 0
		AND user_agent IN (
			SELECT user_agent
			FROM analytics_events
			WHERE created_at >= ? AND created_at < ?
			GROUP BY user_agent
			HAVING
				COUNT(DISTINCT visitor_hash) > ?
				AND SUM(CASE WHEN referrer IS NULL THEN 1 ELSE 0 END) = COUNT(*)
				AND 100.0 * SUM(CASE WHEN path = '/' THEN 1 ELSE 0 END) / COUNT(*) > 50
		)
	`)
	const direct_result = flag_direct_only.run(
		start_ts,
		end_ts,
		start_ts,
		end_ts,
		BOT_THRESHOLDS.MIN_VISITORS_FOR_DIRECT_ONLY,
	)
	console.log(
		`[bot-flag] Flagged ${direct_result.changes} events (direct-only scrapers)`,
	)

	// Flag 5: Malformed UA (quotes around user agent string)
	const flag_malformed_ua = client.prepare(`
		UPDATE analytics_events
		SET is_bot = 1
		WHERE created_at >= ? AND created_at < ?
		AND is_bot = 0
		AND (user_agent LIKE '"%' OR user_agent LIKE '%"')
	`)
	const malformed_result = flag_malformed_ua.run(start_ts, end_ts)
	console.log(
		`[bot-flag] Flagged ${malformed_result.changes} events (malformed UA)`,
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

	const total_flagged =
		per_path_result.changes +
		total_result.changes +
		homepage_result.changes +
		direct_result.changes +
		malformed_result.changes

	return {
		success: true,
		message: `Flagged bot behaviour for ${date_str}`,
		events_flagged: total_flagged,
		visitors_flagged: flagged_visitors.count,
		thresholds: BOT_THRESHOLDS,
	}
}
