/**
 * Server-side active sessions tracking
 * Tracks who's currently viewing what via heartbeats
 * Separate from write queue - this is for real-time "who's here" data
 *
 * Extended to include country/browser/device for consistent live stats
 * (all data from single source, no DB queries needed)
 */

type ActiveSession = {
	visitor_hash: string
	path: string
	last_seen: number
	country?: string
	browser?: string
	device_type?: string
}

type SessionMetadata = {
	country?: string
	browser?: string
	device_type?: string
}

// In-memory map of active sessions
// Key: visitor_hash, Value: session data
const active_sessions = new Map<string, ActiveSession>()

// Session expires after 15s of no heartbeat
const SESSION_TTL_MS = 15_000

/**
 * Record a heartbeat from a visitor
 * Called every 5s from client
 * Now includes metadata for consistent live stats
 */
export const heartbeat = (
	visitor_hash: string,
	path: string,
	metadata?: SessionMetadata,
): void => {
	const existing = active_sessions.get(visitor_hash)
	active_sessions.set(visitor_hash, {
		visitor_hash,
		path,
		last_seen: Date.now(),
		// Preserve existing metadata if not provided (page navigation within session)
		country: metadata?.country ?? existing?.country,
		browser: metadata?.browser ?? existing?.browser,
		device_type: metadata?.device_type ?? existing?.device_type,
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
 * Get aggregated stats from active sessions
 * All data from single in-memory source = consistent
 */
export const get_session_breakdown = () => {
	cleanup_stale_sessions()
	const sessions = Array.from(active_sessions.values())

	// Countries
	const country_counts = new Map<string, number>()
	for (const s of sessions) {
		if (s.country) {
			country_counts.set(
				s.country,
				(country_counts.get(s.country) || 0) + 1,
			)
		}
	}
	const countries_sorted = Array.from(country_counts.entries())
		.map(([country, visitors]) => ({ country, visitors }))
		.sort((a, b) => b.visitors - a.visitors)
	const countries_total = countries_sorted.length
	const countries = countries_sorted.slice(0, 10)

	// Browsers
	const browser_counts = new Map<string, number>()
	for (const s of sessions) {
		if (s.browser) {
			browser_counts.set(
				s.browser,
				(browser_counts.get(s.browser) || 0) + 1,
			)
		}
	}
	const browsers = Array.from(browser_counts.entries())
		.map(([browser, visitors]) => ({ browser, visitors }))
		.sort((a, b) => b.visitors - a.visitors)
		.slice(0, 5)

	// Devices
	const device_counts = new Map<string, number>()
	for (const s of sessions) {
		if (s.device_type) {
			device_counts.set(
				s.device_type,
				(device_counts.get(s.device_type) || 0) + 1,
			)
		}
	}
	const devices = Array.from(device_counts.entries())
		.map(([device_type, visitors]) => ({ device_type, visitors }))
		.sort((a, b) => b.visitors - a.visitors)

	// Paths
	const path_counts = new Map<string, number>()
	for (const s of sessions) {
		path_counts.set(s.path, (path_counts.get(s.path) || 0) + 1)
	}
	const paths_sorted = Array.from(path_counts.entries())
		.map(([path, visitors]) => ({ path, views: visitors, visitors }))
		.sort((a, b) => b.visitors - a.visitors)
	const paths_total = paths_sorted.length
	const top_paths = paths_sorted.slice(0, 10)

	return {
		active_visitors: sessions.length,
		countries,
		countries_total,
		browsers,
		devices,
		top_paths,
		paths_total,
	}
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
