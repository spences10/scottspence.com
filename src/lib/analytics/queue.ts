import { sqlite_client } from '$lib/sqlite/client'
import { is_blocked_referrer } from './blocked-domains'

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
 * Click event structure for tracking user interactions
 */
export type ClickEvent = {
	event_name: string
	event_context: string | null
	visitor_hash: string
	path: string
	created_at: number
}

/**
 * Module-level queues - shared across all requests
 * Node.js caches modules, so these arrays persist
 */
const queue: AnalyticsEvent[] = []
const click_queue: ClickEvent[] = []
let flush_timer: ReturnType<typeof setInterval> | null = null

/**
 * Queue a page view event (O(1), non-blocking)
 * Blocked referrers are nullified before storage
 */
export const queue_page_view = (event: AnalyticsEvent): void => {
	// Filter blocked referrers at ingestion (copy to avoid mutation)
	const to_queue = is_blocked_referrer(event.referrer)
		? { ...event, referrer: null }
		: event
	queue.push(to_queue)
}

/**
 * Queue a click event (O(1), non-blocking)
 */
export const queue_click_event = (event: ClickEvent): void => {
	click_queue.push(event)
}

/**
 * Get current queue length (for monitoring)
 */
export const get_queue_length = (): number => queue.length

/**
 * Get live stats from queue (no DB read)
 * Returns recent activity from last flush window (~5s)
 */
export const get_live_stats = () => {
	const human_events = queue.filter((e) => !e.is_bot)
	const unique_visitors = new Set(
		human_events.map((e) => e.visitor_hash),
	).size
	const unique_paths = new Set(human_events.map((e) => e.path)).size

	return {
		total_events: queue.length,
		human_events: human_events.length,
		unique_visitors,
		unique_paths,
	}
}

/**
 * Get viewers for a specific path (no DB read)
 * Useful for "X people viewing this page"
 */
export const get_path_viewers = (path: string): number => {
	return new Set(
		queue
			.filter((e) => e.path === path && !e.is_bot)
			.map((e) => e.visitor_hash),
	).size
}

/**
 * Flush queued events to database
 * Drains both queues and batch inserts all events
 */
const flush_batch = (): void => {
	const has_analytics = queue.length > 0
	const has_clicks = click_queue.length > 0

	if (!has_analytics && !has_clicks) return

	const queries: { sql: string; args: unknown[] }[] = []

	// Drain analytics queue
	if (has_analytics) {
		const batch = queue.splice(0, queue.length)
		for (const event of batch) {
			queries.push({
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
			})
		}
	}

	// Drain click queue
	if (has_clicks) {
		const click_batch = click_queue.splice(0, click_queue.length)
		for (const event of click_batch) {
			queries.push({
				sql: `INSERT INTO click_events
					(event_name, event_context, visitor_hash, path, created_at)
					VALUES (?, ?, ?, ?, ?)`,
				args: [
					event.event_name,
					event.event_context,
					event.visitor_hash,
					event.path,
					event.created_at,
				],
			})
		}
	}

	try {
		sqlite_client.batch(queries)
		console.log(`[analytics] Flushed ${queries.length} events`)
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
