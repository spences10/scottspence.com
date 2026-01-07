import { BOT_THRESHOLDS } from '$lib/analytics/bot-thresholds'
import type { SqliteClient } from '$lib/sqlite/client'

interface PopularPostRow {
	pathname: string
	title: string
	views: number
	uniques: number
}

export const normalize_popular_post = (
	row: PopularPostRow,
): PopularPost => ({
	id: row.pathname,
	pathname: row.pathname,
	title: row.title,
	pageviews: row.views,
	visits: row.uniques,
	date_grouping: '',
	last_updated: '',
})

export const normalize_popular_posts = (
	rows: PopularPostRow[],
): PopularPost[] => rows.map(normalize_popular_post)

/**
 * Get today's popular posts from analytics_events (live data)
 * Cached for 15 minutes in remote function
 *
 * Uses inline bot filtering via CTE to exclude:
 * - Visitors with >20 hits to any single path
 * - Visitors with >100 total hits
 */
export const fetch_popular_today = async (
	client: SqliteClient,
): Promise<PopularPost[]> => {
	const today_start = new Date()
	today_start.setHours(0, 0, 0, 0)
	const today_timestamp = today_start.getTime()

	const result = await client.execute({
		sql: `
			WITH bad_visitors AS (
				-- Visitors exceeding per-path threshold
				SELECT DISTINCT visitor_hash
				FROM analytics_events
				WHERE created_at >= ?
				GROUP BY visitor_hash, path
				HAVING COUNT(*) > ?
				UNION
				-- Visitors exceeding total threshold
				SELECT visitor_hash
				FROM analytics_events
				WHERE created_at >= ?
				GROUP BY visitor_hash
				HAVING COUNT(*) > ?
			)
			SELECT
				e.path as pathname,
				p.title,
				COUNT(*) as views,
				COUNT(DISTINCT e.visitor_hash) as uniques
			FROM analytics_events e
			JOIN posts p ON e.path = '/posts/' || p.slug
			WHERE e.created_at >= ?
				AND e.is_bot = 0
				AND e.visitor_hash NOT IN (SELECT visitor_hash FROM bad_visitors)
			GROUP BY e.path
			ORDER BY views DESC
			LIMIT 20
		`,
		args: [
			today_timestamp,
			BOT_THRESHOLDS.MAX_HITS_PER_PATH_PER_DAY,
			today_timestamp,
			BOT_THRESHOLDS.MAX_HITS_TOTAL_PER_DAY,
			today_timestamp,
		],
	})

	return normalize_popular_posts(
		result.rows as unknown as PopularPostRow[],
	)
}

/**
 * Get this month's popular posts from analytics_monthly rollup
 * Cached for 1 hour in remote function
 */
export const fetch_popular_month = async (
	client: SqliteClient,
): Promise<PopularPost[]> => {
	const current_month = new Date().toISOString().slice(0, 7) // YYYY-MM

	const result = await client.execute({
		sql: `
			SELECT
				m.pathname,
				p.title,
				SUM(m.views) as views,
				SUM(m.unique_visitors) as uniques
			FROM analytics_monthly m
			JOIN posts p ON m.pathname = '/posts/' || p.slug
			WHERE m.year_month = ?
			GROUP BY m.pathname
			ORDER BY views DESC
			LIMIT 20
		`,
		args: [current_month],
	})

	return normalize_popular_posts(
		result.rows as unknown as PopularPostRow[],
	)
}

/**
 * Get this year's popular posts from analytics_yearly rollup
 * Cached for 1 hour in remote function
 */
export const fetch_popular_year = async (
	client: SqliteClient,
): Promise<PopularPost[]> => {
	const current_year = new Date().getFullYear().toString()

	const result = await client.execute({
		sql: `
			SELECT
				y.pathname,
				p.title,
				SUM(y.views) as views,
				SUM(y.unique_visitors) as uniques
			FROM analytics_yearly y
			JOIN posts p ON y.pathname = '/posts/' || p.slug
			WHERE y.year = ?
			GROUP BY y.pathname
			ORDER BY views DESC
			LIMIT 20
		`,
		args: [current_year],
	})

	return normalize_popular_posts(
		result.rows as unknown as PopularPostRow[],
	)
}

/**
 * Fetch all popular posts (today, month, year) - for backwards compatibility
 */
export const fetch_popular_posts_from_db = async (
	client: SqliteClient,
): Promise<PopularPosts> => {
	const [daily, monthly, yearly] = await Promise.all([
		fetch_popular_today(client),
		fetch_popular_month(client),
		fetch_popular_year(client),
	])

	return {
		popular_posts_daily: daily,
		popular_posts_monthly: monthly,
		popular_posts_yearly: yearly,
	}
}
