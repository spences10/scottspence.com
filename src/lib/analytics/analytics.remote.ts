import { command, getRequestEvent, query } from '$app/server'
import {
	query_active_on_path,
	query_active_visitors,
} from '$lib/analytics/analytics.helpers'
import {
	anonymise_ip,
	get_client_ip,
	get_visitor_hash,
	track_event,
} from '$lib/analytics/track.server'
import { sqlite_client } from '$lib/sqlite/client'
import * as v from 'valibot'

interface TrackResult {
	success: boolean
}

/**
 * Get site-wide active visitors by page (last 5 minutes)
 */
export const get_active_visitors = query(
	v.object({ limit: v.optional(v.number()) }),
	({ limit = 10 }) => query_active_visitors(sqlite_client, { limit }),
)

/**
 * Get count of visitors viewing a specific path in last 5 minutes
 */
export const get_active_on_path = query(
	v.object({ path: v.string() }),
	({ path }) => query_active_on_path(sqlite_client, path),
)

/**
 * Track custom analytics event from client
 * Usage: track({ name: 'button_click', props: { button: 'signup' } })
 */
export const track = command(
	v.object({
		name: v.pipe(
			v.string(),
			v.trim(),
			v.minLength(1, 'Event name is required'),
			v.maxLength(100, 'Event name too long'),
		),
		props: v.optional(v.record(v.string(), v.unknown())),
	}),
	async ({
		name,
		props,
	}: {
		name: string
		props?: Record<string, unknown>
	}): Promise<TrackResult> => {
		try {
			const { request, url } = getRequestEvent()
			const ip = get_client_ip(request)
			const user_agent = request.headers.get('user-agent')
			const referrer = request.headers.get('referer')
			const visitor_hash = get_visitor_hash(ip, user_agent)

			track_event({
				visitor_hash,
				event_type: 'custom',
				event_name: name,
				path: url.pathname,
				referrer,
				user_agent,
				ip: anonymise_ip(ip),
				props,
			})

			return { success: true }
		} catch (error) {
			console.error('Custom event tracking error:', error)
			return { success: false }
		}
	},
)
