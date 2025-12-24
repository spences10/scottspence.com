import { env } from '$env/dynamic/private'
import { sqlite_client } from '$lib/sqlite/client'
import crypto from 'node:crypto'

/**
 * Anonymise IP address for privacy
 * IPv4: zeros last octet (192.168.1.100 -> 192.168.1.0)
 * IPv6: zeros last two segments
 */
export const anonymise_ip = (ip: string | null): string | null => {
	if (!ip) return null

	// IPv4
	if (ip.includes('.')) {
		const parts = ip.split('.')
		if (parts.length === 4) {
			parts[3] = '0'
			return parts.join('.')
		}
	}

	// IPv6
	if (ip.includes(':')) {
		const parts = ip.split(':')
		if (parts.length >= 2) {
			parts[parts.length - 1] = '0'
			parts[parts.length - 2] = '0'
			return parts.join(':')
		}
	}

	return ip
}

/**
 * Extract client IP from request headers
 */
export const get_client_ip = (request: Request): string | null => {
	const forwarded = request.headers.get('x-forwarded-for')
	if (forwarded) {
		return forwarded.split(',')[0].trim()
	}
	return request.headers.get('x-real-ip')
}

/**
 * Create daily-rotating visitor hash (GDPR-friendly)
 * Same visitor gets new hash each day
 */
export const get_visitor_hash = (
	ip: string | null,
	user_agent: string | null,
): string => {
	const today = new Date().toISOString().split('T')[0]
	const salt = env.ANALYTICS_SALT || 'default-salt'
	const data = `${ip || 'unknown'}|${user_agent || 'unknown'}|${today}|${salt}`
	return crypto
		.createHash('sha256')
		.update(data)
		.digest('hex')
		.slice(0, 16)
}

// Lazy prepared statement - only prepare after schema exists
let insert_event: ReturnType<typeof sqlite_client.prepare> | null =
	null

const get_insert_statement = () => {
	if (!insert_event) {
		insert_event = sqlite_client.prepare(`
			INSERT INTO analytics_events (visitor_hash, event_type, event_name, path, referrer, user_agent, ip, props, created_at)
			VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
		`)
	}
	return insert_event
}

export type AnalyticsEvent = {
	visitor_hash: string
	event_type: 'page_view' | 'custom'
	event_name?: string | null
	path: string
	referrer?: string | null
	user_agent?: string | null
	ip?: string | null
	props?: Record<string, unknown> | null
}

/**
 * Track an analytics event
 */
export const track_event = (event: AnalyticsEvent) => {
	try {
		get_insert_statement().run(
			event.visitor_hash,
			event.event_type,
			event.event_name || null,
			event.path,
			event.referrer || null,
			event.user_agent || null,
			event.ip || null,
			event.props ? JSON.stringify(event.props) : null,
			Date.now(),
		)
	} catch (error) {
		console.error('Analytics tracking error:', error)
	}
}

/**
 * Track a page view from request context
 */
export const track_page_view = (
	request: Request,
	pathname: string,
) => {
	const ip = get_client_ip(request)
	const user_agent = request.headers.get('user-agent')
	const referrer = request.headers.get('referer')
	const visitor_hash = get_visitor_hash(ip, user_agent)

	track_event({
		visitor_hash,
		event_type: 'page_view',
		path: pathname,
		referrer,
		user_agent,
		ip: anonymise_ip(ip),
	})
}
