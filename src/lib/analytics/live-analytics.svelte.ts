import { browser } from '$app/environment'
import { beforeNavigate } from '$app/navigation'
import { page } from '$app/state'
import { end_session, send_heartbeat } from './live-analytics.remote'

/**
 * Shared live analytics state
 * Single heartbeat interval, shared across all components
 */

// Session ID - persists for browser session
const get_session_id = (): string => {
	if (!browser) return ''
	let id = sessionStorage.getItem('analytics_session_id')
	if (!id) {
		id = crypto.randomUUID()
		sessionStorage.setItem('analytics_session_id', id)
	}
	return id
}

// Shared reactive state
let unique_visitors = $state(0)
let path_viewers = $state(0)
let current_path = $state('')
let is_initialised = $state(false)

// Interval handle
let heartbeat_interval: ReturnType<typeof setInterval> | null = null

/**
 * Initialise the heartbeat system
 * Call once from +layout.svelte
 */
export const init_live_analytics = () => {
	if (!browser || is_initialised) return

	is_initialised = true
	const session_id = get_session_id()

	// Send initial heartbeat
	const do_heartbeat = async () => {
		const path = page.url.pathname
		current_path = path

		try {
			const result = await send_heartbeat({ session_id, path })
			unique_visitors = result.unique_visitors
			path_viewers = result.path_viewers
		} catch (e) {
			console.error('[analytics] Heartbeat failed:', e)
		}
	}

	// Initial heartbeat
	do_heartbeat()

	// Heartbeat every 5s
	heartbeat_interval = setInterval(do_heartbeat, 5000)

	// Cleanup on navigation (SPA)
	beforeNavigate(() => {
		// Send updated heartbeat with new path on next tick
		// The navigation will update page.url.pathname
	})

	// Cleanup on tab close
	if (browser) {
		window.addEventListener('beforeunload', () => {
			// Fire and forget - can't await in beforeunload
			end_session({ session_id })
		})

		// Also handle visibility change (tab hidden)
		document.addEventListener('visibilitychange', () => {
			if (document.visibilityState === 'hidden') {
				// Could pause heartbeats here if needed
			} else {
				// Resume - send immediate heartbeat
				do_heartbeat()
			}
		})
	}
}

/**
 * Stop heartbeats (for cleanup)
 */
export const stop_live_analytics = () => {
	if (heartbeat_interval) {
		clearInterval(heartbeat_interval)
		heartbeat_interval = null
	}
	is_initialised = false
}

/**
 * Get current live analytics state
 * Components call this to read shared state
 */
export const get_live_state = () => {
	return {
		get unique_visitors() {
			return unique_visitors
		},
		get path_viewers() {
			return path_viewers
		},
		get current_path() {
			return current_path
		},
		get is_initialised() {
			return is_initialised
		},
	}
}
