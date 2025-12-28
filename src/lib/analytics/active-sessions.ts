/**
 * Server-side active sessions tracking
 * Tracks who's currently viewing what via heartbeats
 * Separate from write queue - this is for real-time "who's here" data
 */

type ActiveSession = {
	visitor_hash: string
	path: string
	last_seen: number
}

// In-memory map of active sessions
// Key: visitor_hash, Value: session data
const active_sessions = new Map<string, ActiveSession>()

// Session expires after 15s of no heartbeat
const SESSION_TTL_MS = 15_000

/**
 * Record a heartbeat from a visitor
 * Called every 5s from client
 */
export const heartbeat = (
	visitor_hash: string,
	path: string,
): void => {
	active_sessions.set(visitor_hash, {
		visitor_hash,
		path,
		last_seen: Date.now(),
	})
}

/**
 * Remove a visitor's session (called on navigation away)
 */
export const remove_session = (visitor_hash: string): void => {
	active_sessions.delete(visitor_hash)
}

/**
 * Get count of unique active visitors site-wide
 */
export const get_active_visitor_count = (): number => {
	cleanup_stale_sessions()
	return active_sessions.size
}

/**
 * Get count of unique visitors on a specific path
 */
export const get_path_viewer_count = (path: string): number => {
	cleanup_stale_sessions()
	let count = 0
	for (const session of active_sessions.values()) {
		if (session.path === path) {
			count++
		}
	}
	return count
}

/**
 * Get all active sessions (for debugging)
 */
export const get_all_sessions = (): ActiveSession[] => {
	cleanup_stale_sessions()
	return Array.from(active_sessions.values())
}

/**
 * Remove sessions that haven't sent heartbeat in TTL
 */
const cleanup_stale_sessions = (): void => {
	const now = Date.now()
	for (const [hash, session] of active_sessions) {
		if (now - session.last_seen > SESSION_TTL_MS) {
			active_sessions.delete(hash)
		}
	}
}
