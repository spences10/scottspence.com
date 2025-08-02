// Server-side persistent cache using Map()
const cache = new Map<string, { data: any; timestamp: number }>()

// Global bypass flags - set to false to enable database reads per feature
export const BYPASS_DB_READS = {
	posts: false,
	popular_posts: false,
	reactions: false,
	reactions_leaderboard: false,
	subscribers: false,
	site_stats: false,
	related_posts: false,
	pricing: false,
	post_analytics: false,
	post_tags: false,
} as const

// Cache duration constants (in milliseconds)
export const CACHE_DURATIONS = {
	posts: 24 * 60 * 60 * 1000, // 24 hours
	popular_posts: 60 * 60 * 1000, // 1 hour
	reactions: 5 * 60 * 1000, // 5 minutes
	reactions_leaderboard: 15 * 60 * 1000, // 15 minutes
	subscribers: 24 * 60 * 60 * 1000, // 24 hours
	site_stats: 60 * 60 * 1000, // 1 hour
	related_posts: 60 * 60 * 1000, // 1 hour
	pricing: 24 * 60 * 60 * 1000, // 24 hours
	post_analytics: {
		day: 5 * 60 * 1000, // 5 minutes
		month: 24 * 60 * 60 * 1000, // 24 hours
		year: 24 * 60 * 60 * 1000, // 24 hours
	},
	post_tags: 24 * 60 * 60 * 1000, // 24 hours
} as const

export function get_from_cache<T>(
	key: string,
	max_age: number,
): T | null {
	const cached = cache.get(key)
	if (cached && Date.now() - cached.timestamp < max_age) {
		return cached.data as T
	}
	return null
}

export function set_cache<T>(key: string, data: T): void {
	cache.set(key, { data, timestamp: Date.now() })
}

export function clear_cache(key?: string): void {
	if (key) {
		cache.delete(key)
	} else {
		cache.clear()
	}
}

export function get_cache_stats() {
	return {
		size: cache.size,
		keys: Array.from(cache.keys()),
	}
}
