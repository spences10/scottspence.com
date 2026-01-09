/**
 * Referrer normalisation - extracts domain and groups known sources
 * Used by period-stats to aggregate referrers meaningfully
 */

/**
 * Internal domains to filter out
 */
export const INTERNAL_DOMAINS = new Set([
	'scottspence.com',
	'scottspence.dev',
	'scottspence.me',
	'scottspence.live',
	'scottspence.co.uk',
	'spences10.dev',
	'spences10.com',
	'spences10.me',
	'ss10.dev',
	'ss10.me',
	'svelte.dad',
	'scott.garden',
	'blog.scottspence.me',
])

/**
 * Search engine patterns → canonical names
 * Order matters - more specific patterns first
 */
const SEARCH_ENGINE_MAPPINGS: [RegExp, string][] = [
	// Google Search (various TLDs)
	[/^(www\.)?google\.[a-z.]+$/, 'Google'],
	[
		/^android-app:\/\/com\.google\.android\.googlequicksearchbox/,
		'Google',
	],
	// Other search engines
	[/^(www\.)?bing\.com$/, 'Bing'],
	[/^(www\.)?duckduckgo\.com$/, 'DuckDuckGo'],
	[/^search\.brave\.com$/, 'Brave Search'],
	[/^(www\.)?kagi\.com$/, 'Kagi'],
	[/^(www\.)?yandex\.[a-z]+$/, 'Yandex'],
	[/^(www\.)?baidu\.com$/, 'Baidu'],
	[/^(www\.)?ecosia\.org$/, 'Ecosia'],
]

/**
 * Extract hostname from referrer URL
 * Returns null if parsing fails
 */
const extract_hostname = (referrer: string): string | null => {
	try {
		// Handle android-app:// scheme
		if (referrer.startsWith('android-app://')) {
			return referrer
		}
		// Add protocol if missing
		const url_string = referrer.includes('://')
			? referrer
			: `https://${referrer}`
		const url = new URL(url_string)
		return url.hostname.toLowerCase()
	} catch {
		return null
	}
}

/**
 * Check if referrer is from an internal domain
 */
export const is_internal_referrer = (referrer: string): boolean => {
	const hostname = extract_hostname(referrer)
	if (!hostname) return false

	// Strip www. for comparison
	const clean_hostname = hostname.replace(/^www\./, '')

	// Check exact match
	if (INTERNAL_DOMAINS.has(clean_hostname)) return true

	// Check if subdomain of internal domain
	for (const domain of INTERNAL_DOMAINS) {
		if (clean_hostname.endsWith(`.${domain}`)) return true
	}

	return false
}

/**
 * Normalise referrer to canonical source name
 * Returns null for internal domains (to be filtered)
 * Returns hostname for unknown sources
 */
export const normalise_referrer = (
	referrer: string | null,
): string | null => {
	if (!referrer || referrer === '') return null

	// Check if internal
	if (is_internal_referrer(referrer)) return null

	const hostname = extract_hostname(referrer)
	if (!hostname) return referrer // Return as-is if can't parse

	// Check search engine mappings
	for (const [pattern, name] of SEARCH_ENGINE_MAPPINGS) {
		if (pattern.test(hostname) || pattern.test(referrer)) {
			return name
		}
	}

	// Return cleaned hostname (strip www.)
	return hostname.replace(/^www\./, '')
}

/**
 * Aggregate referrers by normalised source
 * Groups raw referrer rows into canonical sources
 */
export const aggregate_referrers = (
	raw_referrers: {
		referrer: string
		views: number
		visitors: number
	}[],
): { referrer: string; views: number; visitors: number }[] => {
	const grouped = new Map<
		string,
		{ views: number; visitors: number }
	>()

	for (const row of raw_referrers) {
		const normalised = normalise_referrer(row.referrer)
		if (!normalised) continue // Skip internal/null

		const existing = grouped.get(normalised)
		if (existing) {
			existing.views += row.views
			existing.visitors += row.visitors
		} else {
			grouped.set(normalised, {
				views: row.views,
				visitors: row.visitors,
			})
		}
	}

	// Convert to array and sort by visitors
	return [...grouped.entries()]
		.map(([referrer, stats]) => ({
			referrer,
			views: stats.views,
			visitors: stats.visitors,
		}))
		.sort((a, b) => b.visitors - a.visitors)
}
