// Server-side persistent cache using Map()
const cache = new Map<string, { data: any; timestamp: number }>();
let read_version: (() => unknown) | undefined;
let cache_version: unknown;
let version_checked_at = 0;

// PRAGMA data_version changes when another connection commits, not when
// this process writes. Check at most once a second, not on every cache hit.
export function set_cache_version_reader(reader: () => unknown) {
	read_version = reader;
	cache_version = reader();
	version_checked_at = Date.now();
}

function check_cache_version() {
	const now = Date.now();
	if (!read_version || now - version_checked_at < 1000) return;
	const version = read_version();
	if (version !== cache_version) {
		cache.clear();
		cache_version = version;
	}
	version_checked_at = now;
}

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
} as const;

// Cache duration constants (in milliseconds)
export const CACHE_DURATIONS = {
	posts: 24 * 60 * 60 * 1000, // 24 hours
	popular_posts: 60 * 60 * 1000, // 1 hour (backwards compat)
	popular_posts_today: 15 * 60 * 1000, // 15 minutes
	popular_posts_month: 60 * 60 * 1000, // 1 hour
	popular_posts_year: 60 * 60 * 1000, // 1 hour
	reactions: 30 * 1000, // 30 seconds
	reactions_leaderboard: 15 * 60 * 1000, // 15 minutes
	subscribers: 24 * 60 * 60 * 1000, // 24 hours
	site_stats: 60 * 60 * 1000, // 1 hour
	related_posts: 60 * 60 * 1000, // 1 hour
	search_posts: 60 * 60 * 1000, // 1 hour
	pricing: 24 * 60 * 60 * 1000, // 24 hours
	post_analytics: {
		day: 5 * 60 * 1000, // 5 minutes
		month: 24 * 60 * 60 * 1000, // 24 hours
		year: 24 * 60 * 60 * 1000, // 24 hours
		launch_cohort: 60 * 60 * 1000, // 1 hour - daily rollup only changes nightly
	},
	post_tags: 24 * 60 * 60 * 1000, // 24 hours
	period_stats: 30 * 1000, // 30 seconds - prevents hammering on stats page
	blocked_domains: 5 * 60 * 1000, // 5 minutes - blocklist refresh interval
} as const;

export function get_from_cache<T>(
	key: string,
	max_age: number,
): T | null {
	if (cache.size > 0) check_cache_version();
	const cached = cache.get(key);
	if (cached && Date.now() - cached.timestamp < max_age) {
		return cached.data as T;
	}
	return null;
}

export function set_cache<T>(key: string, data: T): void {
	cache.set(key, { data, timestamp: Date.now() });
}

export function clear_cache(key?: string): void {
	if (key) {
		cache.delete(key);
	} else {
		cache.clear();
	}
}

export function get_cache_stats() {
	return {
		size: cache.size,
		keys: Array.from(cache.keys()),
	};
}
