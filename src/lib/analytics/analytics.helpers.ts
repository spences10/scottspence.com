/**
 * Analytics helper functions - testable pure logic
 * These are used by analytics.remote.ts
 */

/**
 * Convert ISO 3166-1 alpha-2 country code to flag emoji
 * e.g., "GB" -> "🇬🇧", "US" -> "🇺🇸"
 */
export function country_to_flag(country_code: string | null): string {
	if (!country_code || country_code.length !== 2) return '🌍'
	const code = country_code.toUpperCase()
	// Regional indicator symbols: A=🇦 (U+1F1E6), B=🇧 (U+1F1E7), etc.
	const offset = 0x1f1e6 - 65 // 65 is 'A'
	return String.fromCodePoint(
		code.charCodeAt(0) + offset,
		code.charCodeAt(1) + offset,
	)
}

/**
 * Format countries as "3 🇬🇧 2 🇺🇸 1 🇩🇪"
 */
export function format_countries(countries: CountryCount[]): string {
	if (!countries.length) return ''
	return countries
		.map((c) => `${c.count} ${country_to_flag(c.country)}`)
		.join(' ')
}

export interface CountryCount {
	country: string
	count: number
}

export interface NameCount {
	name: string
	count: number
}

export interface PageCount {
	path: string
	count: number
	title?: string
}

export interface TrafficBreakdown {
	total: number
	pages: PageCount[]
	countries: CountryCount[]
	browsers: NameCount[]
	devices: NameCount[]
	referrers: NameCount[]
}

export interface ActiveVisitorsResult {
	humans: TrafficBreakdown
	bots: TrafficBreakdown
}

export interface ActiveOnPathResult {
	count: number
	bots: number
	countries: CountryCount[]
}

export interface SqliteClient {
	execute: (query: { sql: string; args: unknown[] }) => {
		rows: unknown[]
	}
}

// Helper to create empty traffic breakdown
function empty_breakdown(): TrafficBreakdown {
	return {
		total: 0,
		pages: [],
		countries: [],
		browsers: [],
		devices: [],
		referrers: [],
	}
}

// Query traffic breakdown for humans or bots
function query_traffic_breakdown(
	client: SqliteClient,
	cutoff: number,
	limit: number,
	is_bot: boolean,
): TrafficBreakdown {
	const bot_filter = is_bot
		? 'is_bot = 1'
		: '(is_bot = 0 OR is_bot IS NULL)'

	// Pages with post titles
	const pages = client.execute({
		sql: `SELECT
				ae.path,
				COUNT(DISTINCT ae.visitor_hash) as count,
				p.title
			FROM analytics_events ae
			LEFT JOIN posts p ON ae.path = '/posts/' || p.slug
			WHERE ae.created_at > ? AND ${bot_filter}
			GROUP BY ae.path
			ORDER BY count DESC
			LIMIT ?`,
		args: [cutoff, limit],
	})

	// Total count
	const total = client.execute({
		sql: `SELECT COUNT(DISTINCT visitor_hash) as count
			FROM analytics_events
			WHERE created_at > ? AND ${bot_filter}`,
		args: [cutoff],
	})

	// Countries (top 5)
	const countries = client.execute({
		sql: `SELECT country, COUNT(DISTINCT visitor_hash) as count
			FROM analytics_events
			WHERE created_at > ? AND ${bot_filter} AND country IS NOT NULL
			GROUP BY country
			ORDER BY count DESC
			LIMIT 5`,
		args: [cutoff],
	})

	// Browsers (top 5) - for bots this shows bot user agents
	const browsers = client.execute({
		sql: `SELECT browser as name, COUNT(DISTINCT visitor_hash) as count
			FROM analytics_events
			WHERE created_at > ? AND ${bot_filter} AND browser IS NOT NULL
			GROUP BY browser
			ORDER BY count DESC
			LIMIT 5`,
		args: [cutoff],
	})

	// Device types
	const devices = client.execute({
		sql: `SELECT device_type as name, COUNT(DISTINCT visitor_hash) as count
			FROM analytics_events
			WHERE created_at > ? AND ${bot_filter} AND device_type IS NOT NULL
			GROUP BY device_type
			ORDER BY count DESC`,
		args: [cutoff],
	})

	// Referrers (top 5)
	const referrers = client.execute({
		sql: `SELECT
				CASE
					WHEN referrer LIKE '%://scottspence.com%' THEN '(internal)'
					WHEN referrer IS NULL OR referrer = '' THEN 'Direct / Unknown'
					ELSE SUBSTR(referrer, INSTR(referrer, '://') + 3,
						CASE
							WHEN INSTR(SUBSTR(referrer, INSTR(referrer, '://') + 3), '/') > 0
							THEN INSTR(SUBSTR(referrer, INSTR(referrer, '://') + 3), '/') - 1
							ELSE LENGTH(referrer)
						END
					)
				END as name,
				COUNT(DISTINCT visitor_hash) as count
			FROM analytics_events
			WHERE created_at > ? AND ${bot_filter}
			GROUP BY name
			HAVING name != '(internal)'
			ORDER BY count DESC
			LIMIT 5`,
		args: [cutoff],
	})

	return {
		total: Number((total.rows[0] as { count: number })?.count ?? 0),
		pages: pages.rows as PageCount[],
		countries: countries.rows as CountryCount[],
		browsers: browsers.rows as NameCount[],
		devices: devices.rows as NameCount[],
		referrers: referrers.rows as NameCount[],
	}
}

/**
 * Query active visitors across the site
 */
export function query_active_visitors(
	client: SqliteClient,
	options: { limit?: number; window_ms?: number } = {},
): ActiveVisitorsResult {
	const { limit = 10, window_ms = 5 * 60 * 1000 } = options
	const cutoff = Date.now() - window_ms

	try {
		return {
			humans: query_traffic_breakdown(client, cutoff, limit, false),
			bots: query_traffic_breakdown(client, cutoff, limit, true),
		}
	} catch {
		return {
			humans: empty_breakdown(),
			bots: empty_breakdown(),
		}
	}
}

/**
 * Query active visitors on a specific path
 */
export function query_active_on_path(
	client: SqliteClient,
	path: string,
	options: { window_ms?: number } = {},
): ActiveOnPathResult {
	const { window_ms = 5 * 60 * 1000 } = options
	const cutoff = Date.now() - window_ms

	try {
		// Humans
		const result = client.execute({
			sql: `SELECT COUNT(DISTINCT visitor_hash) as count
				FROM analytics_events
				WHERE path = ? AND created_at > ? AND (is_bot = 0 OR is_bot IS NULL)`,
			args: [path, cutoff],
		})

		// Bots
		const bots = client.execute({
			sql: `SELECT COUNT(DISTINCT visitor_hash) as count
				FROM analytics_events
				WHERE path = ? AND created_at > ? AND is_bot = 1`,
			args: [path, cutoff],
		})

		// Countries (humans only)
		const countries = client.execute({
			sql: `SELECT country, COUNT(DISTINCT visitor_hash) as count
				FROM analytics_events
				WHERE path = ? AND created_at > ? AND (is_bot = 0 OR is_bot IS NULL) AND country IS NOT NULL
				GROUP BY country
				ORDER BY count DESC
				LIMIT 5`,
			args: [path, cutoff],
		})

		const count =
			result.rows.length > 0
				? Number((result.rows[0] as { count: number }).count)
				: 0
		return {
			count,
			bots: Number((bots.rows[0] as { count: number })?.count ?? 0),
			countries: countries.rows as CountryCount[],
		}
	} catch {
		return { count: 0, bots: 0, countries: [] }
	}
}
