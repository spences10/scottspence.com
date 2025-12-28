import { ANALYTICS_SALT } from '$env/static/private'
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
	const salt = ANALYTICS_SALT || 'default-salt'
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
 * Check if path should be skipped for analytics tracking
 */
export const should_skip_path = (pathname: string): boolean => {
	// Skip internal paths, API routes, assets, and remote function calls
	if (
		pathname.startsWith('/_') ||
		pathname.startsWith('/__') ||
		pathname.startsWith('/api/') ||
		pathname.includes('.') ||
		pathname.includes('__remote')
	) {
		return true
	}
	return false
}
