import { command, query } from '$app/server'
import * as v from 'valibot'
import {
	get_active_visitor_count,
	get_path_viewer_count,
	heartbeat,
	remove_session,
} from './active-sessions'

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
