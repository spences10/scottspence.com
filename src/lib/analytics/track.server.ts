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

/**
 * Parse user agent for browser, OS, device type, and bot detection
 */
export interface ParsedUserAgent {
	browser: string | null
	os: string | null
	device_type: 'desktop' | 'mobile' | 'tablet' | null
	is_bot: boolean
}

const BOT_PATTERNS = [
	/bot/i,
	/crawl/i,
	/spider/i,
	/slurp/i,
	/mediapartners/i,
	/googlebot/i,
	/bingbot/i,
	/yandex/i,
	/baidu/i,
	/duckduckbot/i,
	/facebookexternalhit/i,
	/twitterbot/i,
	/linkedinbot/i,
	/whatsapp/i,
	/telegram/i,
	/discord/i,
	/slack/i,
	/pingdom/i,
	/uptimerobot/i,
	/gtmetrix/i,
	/lighthouse/i,
	/headlesschrome/i,
	/phantomjs/i,
	/selenium/i,
	/puppeteer/i,
	/python-requests/i,
	/curl/i,
	/wget/i,
	/httpx/i,
	/axios/i,
	/go-http-client/i,
	/java/i,
	/ruby/i,
	/perl/i,
	/semrush/i,
	/ahrefs/i,
	/mj12bot/i,
	/dotbot/i,
	/applebot/i,
	/bytespider/i,
	/petalbot/i,
	/gptbot/i,
]

export const parse_user_agent = (
	ua: string | null,
): ParsedUserAgent => {
	if (!ua)
		return {
			browser: null,
			os: null,
			device_type: null,
			is_bot: false,
		}

	// Bot detection
	const is_bot = BOT_PATTERNS.some((pattern) => pattern.test(ua))

	// Browser detection
	let browser: string | null = null
	if (/edg/i.test(ua)) browser = 'Edge'
	else if (/opr|opera/i.test(ua)) browser = 'Opera'
	else if (/chrome|chromium|crios/i.test(ua)) browser = 'Chrome'
	else if (/firefox|fxios/i.test(ua)) browser = 'Firefox'
	else if (/safari/i.test(ua) && !/chrome/i.test(ua))
		browser = 'Safari'
	else if (/msie|trident/i.test(ua)) browser = 'IE'
	else if (/samsung/i.test(ua)) browser = 'Samsung'
	else if (/ucbrowser/i.test(ua)) browser = 'UC Browser'

	// OS detection
	let os: string | null = null
	if (/windows/i.test(ua)) os = 'Windows'
	else if (/macintosh|mac os x/i.test(ua)) os = 'macOS'
	else if (/android/i.test(ua)) os = 'Android'
	else if (/iphone|ipad|ipod/i.test(ua)) os = 'iOS'
	else if (/linux/i.test(ua)) os = 'Linux'
	else if (/chromeos/i.test(ua)) os = 'ChromeOS'

	// Device type detection
	let device_type: 'desktop' | 'mobile' | 'tablet' | null = null
	if (/ipad|tablet|playbook|silk/i.test(ua)) device_type = 'tablet'
	else if (
		/mobile|iphone|ipod|android.*mobile|windows phone/i.test(ua)
	)
		device_type = 'mobile'
	else if (os) device_type = 'desktop'

	return { browser, os, device_type, is_bot }
}

/**
 * Get 30-minute window ID for deduplication
 * Format: 2025-12-26T14:00 or 2025-12-26T14:30
 */
const get_window_id = (): string => {
	const now = new Date()
	const minutes = now.getMinutes() < 30 ? '00' : '30'
	return `${now.toISOString().slice(0, 13)}:${minutes}`
}

/**
 * Get upsert statement - deduplicates same visitor+path within 30-min window
 * Increments hit_count on conflict instead of creating new row
 */
const get_upsert_statement = () => {
	return sqlite_client.prepare(`
		INSERT INTO analytics_events (visitor_hash, event_type, event_name, path, referrer, user_agent, ip, country, browser, device_type, os, is_bot, hit_count, window_id, props, created_at)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?)
		ON CONFLICT (visitor_hash, path, window_id) WHERE window_id IS NOT NULL
		DO UPDATE SET hit_count = hit_count + 1, created_at = excluded.created_at
	`)
}

export type AnalyticsEvent = {
	visitor_hash: string
	event_type: 'page_view' | 'custom'
	event_name?: string | null
	path: string
	referrer?: string | null
	user_agent?: string | null
	ip?: string | null
	country?: string | null
	browser?: string | null
	device_type?: string | null
	os?: string | null
	is_bot?: boolean
	props?: Record<string, unknown> | null
}

/**
 * Track an analytics event
 * Uses UPSERT to deduplicate same visitor+path within 30-min window
 */
export const track_event = (event: AnalyticsEvent) => {
	try {
		const window_id = get_window_id()
		get_upsert_statement().run(
			event.visitor_hash,
			event.event_type,
			event.event_name || null,
			event.path,
			event.referrer || null,
			event.user_agent || null,
			event.ip || null,
			event.country || null,
			event.browser || null,
			event.device_type || null,
			event.os || null,
			event.is_bot ? 1 : 0,
			window_id,
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
	const country = request.headers.get('cf-ipcountry')
	const visitor_hash = get_visitor_hash(ip, user_agent)
	const { browser, os, device_type, is_bot } =
		parse_user_agent(user_agent)

	track_event({
		visitor_hash,
		event_type: 'page_view',
		path: pathname,
		referrer,
		user_agent,
		ip: anonymise_ip(ip),
		country,
		browser,
		os,
		device_type,
		is_bot,
	})
}
