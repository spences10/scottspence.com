import { command, query } from '$app/server'
import { sqlite_client } from '$lib/sqlite/client'
import * as v from 'valibot'
import {
	get_active_visitor_count,
	get_all_sessions,
	get_path_viewer_count,
	heartbeat,
	remove_session,
} from './active-sessions'

// Time window for "recent" activity (5 minutes in ms)
const RECENT_WINDOW_MS = 5 * 60 * 1000

/**
 * Send heartbeat - client pings every 5s to say "I'm still here"
 * Returns current stats so we don't need separate query
 */
export const send_heartbeat = command(
	v.object({
		session_id: v.string(),
		path: v.string(),
	}),
	({ session_id, path }) => {
		heartbeat(session_id, path)
		return {
			unique_visitors: get_active_visitor_count(),
			path_viewers: get_path_viewer_count(path),
		}
	},
)

/**
 * Remove session - called when user navigates away
 */
export const end_session = command(
	v.object({ session_id: v.string() }),
	({ session_id }) => {
		remove_session(session_id)
	},
)

/**
 * Get live analytics (read-only, no heartbeat)
 * For initial render before heartbeat starts
 */
export const get_live_analytics = query(() => {
	return {
		unique_visitors: get_active_visitor_count(),
	}
})

/**
 * Get viewers for a specific path (read-only)
 * For initial render before heartbeat starts
 */
export const get_viewing_now = query(
	v.object({ path: v.string() }),
	({ path }) => {
		return {
			path,
			viewers: get_path_viewer_count(path),
		}
	},
)

/**
 * Get live dashboard data - all sessions grouped by path
 * For stats page live dashboard
 */
export const get_live_dashboard = query(() => {
	const sessions = get_all_sessions()
	const unique_visitors = get_active_visitor_count()

	// Group by path
	const path_counts = new Map<string, number>()
	for (const session of sessions) {
		const count = path_counts.get(session.path) || 0
		path_counts.set(session.path, count + 1)
	}

	// Convert to sorted array (most viewers first)
	const pages = Array.from(path_counts.entries())
		.map(([path, viewers]) => ({ path, viewers }))
		.sort((a, b) => b.viewers - a.viewers)

	return {
		unique_visitors,
		pages,
	}
})

/**
 * Get comprehensive live stats for dashboard
 * Queries recent events from DB for country/browser/device breakdown
 */
export const get_live_stats_breakdown = query(() => {
	const since = Date.now() - RECENT_WINDOW_MS
	const active_visitors = get_active_visitor_count()
	const sessions = get_all_sessions()

	// Active pages from in-memory sessions
	const path_counts = new Map<string, number>()
	for (const session of sessions) {
		const count = path_counts.get(session.path) || 0
		path_counts.set(session.path, count + 1)
	}
	const active_pages = Array.from(path_counts.entries())
		.map(([path, viewers]) => ({ path, viewers }))
		.sort((a, b) => b.viewers - a.viewers)
		.slice(0, 10)

	// Query recent events for breakdowns (last 5 mins, non-bots only)
	const countries_result = sqlite_client.execute({
		sql: `SELECT country, COUNT(DISTINCT visitor_hash) as visitors
			FROM analytics_events
			WHERE created_at > ? AND is_bot = 0 AND country IS NOT NULL AND country != ''
			GROUP BY country
			ORDER BY visitors DESC
			LIMIT 10`,
		args: [since],
	})
	const countries = countries_result.rows as {
		country: string
		visitors: number
	}[]

	const browsers_result = sqlite_client.execute({
		sql: `SELECT browser, COUNT(DISTINCT visitor_hash) as visitors
			FROM analytics_events
			WHERE created_at > ? AND is_bot = 0 AND browser IS NOT NULL
			GROUP BY browser
			ORDER BY visitors DESC
			LIMIT 5`,
		args: [since],
	})
	const browsers = browsers_result.rows as {
		browser: string
		visitors: number
	}[]

	const devices_result = sqlite_client.execute({
		sql: `SELECT device_type, COUNT(DISTINCT visitor_hash) as visitors
			FROM analytics_events
			WHERE created_at > ? AND is_bot = 0 AND device_type IS NOT NULL
			GROUP BY device_type
			ORDER BY visitors DESC`,
		args: [since],
	})
	const devices = devices_result.rows as {
		device_type: string
		visitors: number
	}[]

	const paths_result = sqlite_client.execute({
		sql: `SELECT path, COUNT(*) as views, COUNT(DISTINCT visitor_hash) as visitors
			FROM analytics_events
			WHERE created_at > ? AND is_bot = 0
			GROUP BY path
			ORDER BY visitors DESC
			LIMIT 10`,
		args: [since],
	})
	const top_paths = paths_result.rows as {
		path: string
		views: number
		visitors: number
	}[]

	// Recent total visitors (unique in last 5 mins from DB)
	const recent_result = sqlite_client.execute({
		sql: `SELECT COUNT(DISTINCT visitor_hash) as count
			FROM analytics_events
			WHERE created_at > ? AND is_bot = 0`,
		args: [since],
	})
	const recent_visitors =
		(recent_result.rows[0]?.count as number) ?? 0

	return {
		active_visitors,
		recent_visitors,
		active_pages,
		countries,
		browsers,
		devices,
		top_paths,
	}
})
