import { sqlite_client } from '#lib/sqlite/client.js';
import { is_blocked_referrer } from './blocked-domains';

/**
 * Analytics event structure for batched writes
 */
export type AnalyticsEvent = {
	visitor_hash: string;
	event_type: 'page_view' | 'custom';
	event_name: string | null;
	path: string;
	referrer: string | null;
	user_agent: string | null;
	ip: string | null;
	country: string | null;
	browser: string | null;
	device_type: string | null;
	os: string | null;
	is_bot: boolean;
	props: Record<string, unknown> | null;
	created_at: number;
};

/**
 * Click event structure for tracking user interactions
 */
export type ClickEvent = {
	event_name: string;
	event_context: string | null;
	visitor_hash: string;
	path: string;
	created_at: number;
};

/**
 * Module-level queues - shared across all requests
 * Node.js caches modules, so these arrays persist
 */
const queue: AnalyticsEvent[] = [];
const click_queue: ClickEvent[] = [];
const js_ping_queue: JsPing[] = [];
let flush_timer: ReturnType<typeof setInterval> | null = null;

/**
 * Heartbeat seen for a visitor on a path - proves JavaScript ran
 */
export type JsPing = {
	visitor_hash: string;
	path: string;
	created_at: number;
};

// Heartbeats arrive every 5s; only the first per visitor and path is
// written. Visitor hashes rotate daily, so the set is capped, not dated.
const seen_js_pings = new Set<string>();
const MAX_SEEN_JS_PINGS = 50_000;

/**
 * Queue a page view event (O(1), non-blocking)
 * Blocked referrers are nullified before storage
 */
export const queue_page_view = (event: AnalyticsEvent): void => {
	// Filter blocked referrers at ingestion (copy to avoid mutation)
	const to_queue = is_blocked_referrer(event.referrer)
		? { ...event, referrer: null }
		: event;
	queue.push(to_queue);
};

/**
 * Queue a click event (O(1), non-blocking)
 */
export const queue_click_event = (event: ClickEvent): void => {
	click_queue.push(event);
};

/**
 * Queue a JavaScript ping (O(1), non-blocking)
 * Repeat heartbeats for the same visitor and path are dropped
 */
export const queue_js_ping = (ping: JsPing): void => {
	const key = `${ping.visitor_hash}|${ping.path}`;
	if (seen_js_pings.has(key)) return;
	if (seen_js_pings.size >= MAX_SEEN_JS_PINGS) seen_js_pings.clear();
	seen_js_pings.add(key);
	js_ping_queue.push(ping);
};

/**
 * Pending JavaScript pings (for tests and monitoring)
 */
export const get_js_ping_queue_length = (): number =>
	js_ping_queue.length;

/**
 * Get current queue length (for monitoring)
 */
export const get_queue_length = (): number => queue.length;

/**
 * Get live stats from queue (no DB read)
 * Returns recent activity from last flush window (~5s)
 */
export const get_live_stats = () => {
	const human_events = queue.filter((e) => !e.is_bot);
	const unique_visitors = new Set(
		human_events.map((e) => e.visitor_hash),
	).size;
	const unique_paths = new Set(human_events.map((e) => e.path)).size;

	return {
		total_events: queue.length,
		human_events: human_events.length,
		unique_visitors,
		unique_paths,
	};
};

/**
 * Get viewers for a specific path (no DB read)
 * Useful for "X people viewing this page"
 */
export const get_path_viewers = (path: string): number => {
	return new Set(
		queue
			.filter((e) => e.path === path && !e.is_bot)
			.map((e) => e.visitor_hash),
	).size;
};

/**
 * Flush queued events to database
 * Drains both queues and batch inserts all events
 */
const flush_batch = (): void => {
	const has_analytics = queue.length > 0;
	const has_clicks = click_queue.length > 0;
	const has_js_pings = js_ping_queue.length > 0;

	if (!has_analytics && !has_clicks && !has_js_pings) return;

	const queries: { sql: string; args: unknown[] }[] = [];

	// Drain analytics queue
	if (has_analytics) {
		const batch = queue.splice(0, queue.length);
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
			});
		}
	}

	// Drain click queue
	if (has_clicks) {
		const click_batch = click_queue.splice(0, click_queue.length);
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
			});
		}
	}

	// Drain JavaScript ping queue - duplicates after a restart are ignored
	if (has_js_pings) {
		const ping_batch = js_ping_queue.splice(0, js_ping_queue.length);
		for (const ping of ping_batch) {
			queries.push({
				sql: `INSERT OR IGNORE INTO analytics_js_pings
					(visitor_hash, path, created_at)
					VALUES (?, ?, ?)`,
				args: [ping.visitor_hash, ping.path, ping.created_at],
			});
		}
	}

	try {
		sqlite_client.batch(queries);
		console.log(`[analytics] Flushed ${queries.length} events`);
	} catch (error) {
		// Events are lost on failure - acceptable for analytics
		console.error('[analytics] Flush failed:', error);
	}
};

/**
 * Start the flush timer (5 second interval)
 * Call once on server startup
 */
export const start_flush_timer = (): void => {
	if (flush_timer) return; // Already running

	flush_timer = setInterval(() => {
		flush_batch();
	}, 5000); // 5 seconds

	console.log('[analytics] Flush timer started (5s interval)');
};

/**
 * Stop the flush timer and flush remaining events
 * Call on graceful shutdown
 */
export const stop_flush_timer = (): void => {
	if (flush_timer) {
		clearInterval(flush_timer);
		flush_timer = null;
	}
	// Flush any remaining events
	flush_batch();
	console.log('[analytics] Flush timer stopped');
};
