import { BOT_THRESHOLDS } from '$lib/analytics/bot-thresholds'
import { sqlite_client } from '$lib/sqlite/client'
import { flag_bot_behaviour } from './flag-bot-behaviour'

/**
 * Daily rollup job to aggregate analytics_events into summary tables
 * Run via cron at 03:05 daily
 *
 * Flow:
 * 0. Flag behaviour-based bots (scrapers with spoofed UAs)
 * 1. Aggregate yesterday's events → analytics_daily
 * 2. Reaggregate affected month → analytics_monthly
 * 3. Reaggregate affected year → analytics_yearly
 * 4. Reaggregate all time → analytics_all_time
 */
export const rollup_analytics = async () => {
	const client = sqlite_client

	// Calculate yesterday's date range (Unix timestamps in ms)
	const now = new Date()
	const yesterday = new Date(now)
	yesterday.setDate(yesterday.getDate() - 1)
	const date_str = yesterday.toISOString().slice(0, 10) // YYYY-MM-DD
	const year_month = date_str.slice(0, 7) // YYYY-MM
	const year = date_str.slice(0, 4) // YYYY

	// Convert to Unix timestamps (ms) for query
	const start_ts = new Date(date_str + 'T00:00:00Z').getTime()
	const end_ts = start_ts + 86400000 // 24 hours in ms

	console.log(
		`[rollup] Processing ${date_str} (${start_ts} - ${end_ts})`,
	)

	// Step 0: Flag behaviour-based bots before aggregating
	console.log(
		`[rollup] Flagging bots (thresholds: ${BOT_THRESHOLDS.MAX_HITS_PER_PATH_PER_DAY}/path, ${BOT_THRESHOLDS.MAX_HITS_TOTAL_PER_DAY}/total)`,
	)
	const bot_result = await flag_bot_behaviour()
	console.log(
		`[rollup] Flagged ${bot_result.events_flagged} events from ${bot_result.visitors_flagged} visitors as bots`,
	)

	// Step 1: Rollup yesterday's events into analytics_daily
	const rollup_daily = client.prepare(`
		INSERT OR REPLACE INTO analytics_daily (pathname, date, views, unique_visitors, last_updated)
		SELECT
			path as pathname,
			? as date,
			COUNT(*) as views,
			COUNT(DISTINCT visitor_hash) as unique_visitors,
			CURRENT_TIMESTAMP as last_updated
		FROM analytics_events
		WHERE created_at >= ? AND created_at < ? AND is_bot = 0
		GROUP BY path
	`)
	const daily_result = rollup_daily.run(date_str, start_ts, end_ts)
	console.log(`[rollup] Daily: ${daily_result.changes} paths updated`)

	// Step 2: Reaggregate affected month into analytics_monthly
	const rollup_monthly = client.prepare(`
		INSERT OR REPLACE INTO analytics_monthly (pathname, year_month, views, unique_visitors, last_updated)
		SELECT
			pathname,
			? as year_month,
			SUM(views) as views,
			SUM(unique_visitors) as unique_visitors,
			CURRENT_TIMESTAMP as last_updated
		FROM analytics_daily
		WHERE substr(date, 1, 7) = ?
		GROUP BY pathname
	`)
	const monthly_result = rollup_monthly.run(year_month, year_month)
	console.log(
		`[rollup] Monthly (${year_month}): ${monthly_result.changes} paths updated`,
	)

	// Step 3: Reaggregate affected year into analytics_yearly
	// Guard: Only rebuild 2026+ years. Historical years (2020-2025) have imported Fathom data
	// that would be destroyed if we rebuilt from analytics_daily (which only has Dec 28+ data)
	let yearly_result = { changes: 0 }
	if (parseInt(year) >= 2026) {
		const rollup_yearly = client.prepare(`
			INSERT OR REPLACE INTO analytics_yearly (pathname, year, views, unique_visitors, last_updated)
			SELECT
				pathname,
				? as year,
				SUM(views) as views,
				SUM(unique_visitors) as unique_visitors,
				CURRENT_TIMESTAMP as last_updated
			FROM analytics_daily
			WHERE substr(date, 1, 4) = ?
			GROUP BY pathname
		`)
		yearly_result = rollup_yearly.run(year, year)
		console.log(
			`[rollup] Yearly (${year}): ${yearly_result.changes} paths updated`,
		)
	} else {
		console.log(
			`[rollup] Yearly (${year}): skipped (historical Fathom data preserved)`,
		)
	}

	// Step 4: Reaggregate all time into analytics_all_time
	// NOTE: Must use analytics_yearly (not analytics_daily) because daily only has recent data
	// while yearly contains full historical data back to 2020
	const rollup_all_time = client.prepare(`
		INSERT OR REPLACE INTO analytics_all_time (pathname, views, unique_visitors, last_updated)
		SELECT
			pathname,
			SUM(views) as views,
			SUM(unique_visitors) as unique_visitors,
			CURRENT_TIMESTAMP as last_updated
		FROM analytics_yearly
		GROUP BY pathname
	`)
	const all_time_result = rollup_all_time.run()
	console.log(
		`[rollup] All time: ${all_time_result.changes} paths updated`,
	)

	return {
		success: true,
		message: `Rolled up ${date_str}`,
		bots_flagged: bot_result.events_flagged,
		visitors_flagged: bot_result.visitors_flagged,
		daily: daily_result.changes,
		monthly: monthly_result.changes,
		yearly: yearly_result.changes,
		all_time: all_time_result.changes,
	}
}
