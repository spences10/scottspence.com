import { command, getRequestEvent, query } from '$app/server'
import * as v from 'valibot'
import {
	get_active_visitor_count,
	get_all_sessions,
	get_path_viewer_count,
	get_session_breakdown,
	heartbeat,
	remove_session,
} from './active-sessions'
import {
	extract_metadata_from_event,
	format_live_stats_breakdown,
} from './live-analytics.helpers'

/**
 * Send heartbeat - client pings every 5s to say "I'm still here"
 * Returns current stats so we don't need separate query
 * Now extracts country/browser/device from request for consistent live stats
 */
export const send_heartbeat = command(
	v.object({
		session_id: v.string(),
		path: v.string(),
	}),
	({ session_id, path }) => {
		const metadata = extract_metadata_from_event(getRequestEvent())

		heartbeat(session_id, path, metadata)

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
 * Now uses in-memory sessions ONLY for consistent data
 * No DB queries = no cache inconsistency
 */
export const get_live_stats_breakdown = query(() => {
	return format_live_stats_breakdown(get_session_breakdown())
})
