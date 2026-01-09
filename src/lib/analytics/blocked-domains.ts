import { CACHE_DURATIONS } from '$lib/cache/server-cache'
import { sqlite_client } from '$lib/sqlite/client'

/**
 * Shared blocked referrer domains cache
 * Used by queue.ts (ingestion) and period-stats.remote.ts (queries)
 */
let blocked_domains: Set<string> = new Set()
let blocked_domains_loaded_at = 0

/**
 * Get blocked domains from cache, refresh if stale
 * Max one DB query per TTL interval
 */
export const get_blocked_domains = (): Set<string> => {
	const now = Date.now()
	if (
		now - blocked_domains_loaded_at >
		CACHE_DURATIONS.blocked_domains
	) {
		try {
			const result = sqlite_client.execute(
				'SELECT domain FROM blocked_referrer_domains',
			)
			blocked_domains = new Set(
				result.rows.map((r) => {
					const domain = r.domain
					if (typeof domain !== 'string') return ''
					return domain.toLowerCase()
				}),
			)
			blocked_domains_loaded_at = now
		} catch {
			// Table might not exist yet
			blocked_domains = new Set()
			blocked_domains_loaded_at = now
		}
	}
	return blocked_domains
}

/**
 * Check if referrer matches any blocked domain pattern
 */
export const is_blocked_referrer = (
	referrer: string | null,
): boolean => {
	if (!referrer) return false
	const domains = get_blocked_domains()
	const lower = referrer.toLowerCase()
	for (const domain of domains) {
		if (lower.includes(domain)) return true
	}
	return false
}

/**
 * Get blocked domains as array (for SQL queries)
 */
export const get_blocked_domains_array = (): string[] => {
	return [...get_blocked_domains()]
}

/**
 * Invalidate cache - call after adding/removing domains
 */
export const invalidate_blocked_domains_cache = (): void => {
	blocked_domains_loaded_at = 0
}
