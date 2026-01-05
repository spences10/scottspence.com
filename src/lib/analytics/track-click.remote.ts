import { command, getRequestEvent } from '$app/server'
import * as v from 'valibot'
import { queue_click_event } from './queue'
import { get_client_ip, get_visitor_hash } from './utils'

/**
 * Track a click event - replaces Fathom.trackEvent()
 * Non-blocking, adds to queue for batched writes
 */
export const track_click = command(
	v.object({
		event_name: v.string(),
		context: v.optional(v.record(v.string(), v.unknown())),
	}),
	({ event_name, context }) => {
		const event = getRequestEvent()
		const request = event.request
		const ip = get_client_ip(request)
		const user_agent = request.headers.get('user-agent')

		queue_click_event({
			event_name,
			event_context: context ? JSON.stringify(context) : null,
			visitor_hash: get_visitor_hash(ip, user_agent),
			path: event.url.pathname,
			created_at: Date.now(),
		})
	},
)
