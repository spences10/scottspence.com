import { sqlite_client } from '$lib/sqlite/client'

/**
 * Analytics event structure for batched writes
 */
export type AnalyticsEvent = {
	visitor_hash: string
	event_type: 'page_view' | 'custom'
	event_name: string | null
	path: string
	referrer: string | null
	user_agent: string | null
	ip: string | null
	country: string | null
	browser: string | null
	device_type: string | null
	os: string | null
	is_bot: boolean
	props: Record<string, unknown> | null
	created_at: number
}

/**
 * Module-level queue - shared across all requests
 * Node.js caches modules, so this array persists
 */
const queue: AnalyticsEvent[] = []
let flush_timer: ReturnType<typeof setInterval> | null = null

/**
 * Queue a page view event (O(1), non-blocking)
 */
export const queue_page_view = (event: AnalyticsEvent): void => {
	queue.push(event)
}

/**
 * Get current queue length (for monitoring)
 */
export const get_queue_length = (): number => queue.length

/**
 * Flush queued events to database
 * Drains queue and batch inserts all events
 */
const flush_batch = (): void => {
	if (queue.length === 0) return

	// Drain queue atomically
	const batch = queue.splice(0, queue.length)

	try {
		const queries = batch.map((event) => ({
			sql: `INSERT INTO analytics_events
				(visitor_hash, event_type, event_name, path, referrer, user_agent, ip, country, browser, device_type, os, is_bot, props, created_at)
				VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
			args: [
				event.visitor_hash,
				event.event_type,
				event.event_name,
				event.path,
				event.referrer,
				event.user_agent,
				event.ip,
				event.country,
				event.browser,
				event.device_type,
				event.os,
				event.is_bot ? 1 : 0,
				event.props ? JSON.stringify(event.props) : null,
				event.created_at,
			],
		}))

		sqlite_client.batch(queries)
		console.log(`[analytics] Flushed ${batch.length} events`)
	} catch (error) {
		// Events are lost on failure - acceptable for analytics
		console.error('[analytics] Flush failed:', error)
	}
}

/**
 * Start the flush timer (5 second interval)
 * Call once on server startup
 */
export const start_flush_timer = (): void => {
	if (flush_timer) return // Already running

	flush_timer = setInterval(() => {
		flush_batch()
	}, 5000) // 5 seconds

	console.log('[analytics] Flush timer started (5s interval)')
}

/**
 * Stop the flush timer and flush remaining events
 * Call on graceful shutdown
 */
export const stop_flush_timer = (): void => {
	if (flush_timer) {
		clearInterval(flush_timer)
		flush_timer = null
	}
	// Flush any remaining events
	flush_batch()
	console.log('[analytics] Flush timer stopped')
}
