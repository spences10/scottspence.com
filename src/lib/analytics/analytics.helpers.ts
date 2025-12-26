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

// Query traffic breakdown for humans or bots - single query using JSON aggregation
function query_traffic_breakdown(
	client: SqliteClient,
	cutoff: number,
	limit: number,
	is_bot: boolean,
): TrafficBreakdown {
	// Use COALESCE to avoid MULTI-INDEX OR scan (treats NULL as 0)
	const bot_filter = is_bot ? 'is_bot = 1' : 'COALESCE(is_bot, 0) = 0'

	// Single query with all aggregations using CTEs
	const result = client.execute({
		sql: `WITH filtered AS (
				SELECT * FROM analytics_events
				WHERE created_at > ?1 AND ${bot_filter}
			),
			page_data AS (
				SELECT ae.path, COUNT(DISTINCT ae.visitor_hash) as count, p.title
				FROM filtered ae
				LEFT JOIN posts p ON ae.path = '/posts/' || p.slug
				GROUP BY ae.path
				ORDER BY count DESC
				LIMIT ?2
			),
			country_data AS (
				SELECT country, COUNT(DISTINCT visitor_hash) as count
				FROM filtered WHERE country IS NOT NULL
				GROUP BY country ORDER BY count DESC LIMIT 5
			),
			browser_data AS (
				SELECT browser as name, COUNT(DISTINCT visitor_hash) as count
				FROM filtered WHERE browser IS NOT NULL
				GROUP BY browser ORDER BY count DESC LIMIT 5
			),
			device_data AS (
				SELECT device_type as name, COUNT(DISTINCT visitor_hash) as count
				FROM filtered WHERE device_type IS NOT NULL
				GROUP BY device_type ORDER BY count DESC
			),
			referrer_data AS (
				SELECT
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
				FROM filtered
				GROUP BY name
				HAVING name != '(internal)'
				ORDER BY count DESC LIMIT 5
			)
			SELECT
				(SELECT COUNT(DISTINCT visitor_hash) FROM filtered) as total,
				(SELECT json_group_array(json_object('path', path, 'count', count, 'title', title)) FROM page_data) as pages,
				(SELECT json_group_array(json_object('country', country, 'count', count)) FROM country_data) as countries,
				(SELECT json_group_array(json_object('name', name, 'count', count)) FROM browser_data) as browsers,
				(SELECT json_group_array(json_object('name', name, 'count', count)) FROM device_data) as devices,
				(SELECT json_group_array(json_object('name', name, 'count', count)) FROM referrer_data) as referrers`,
		args: [cutoff, limit],
	})

	const row = result.rows[0] as {
		total: number
		pages: string
		countries: string
		browsers: string
		devices: string
		referrers: string
	}

	return {
		total: row?.total ?? 0,
		pages: row?.pages ? JSON.parse(row.pages) : [],
		countries: row?.countries ? JSON.parse(row.countries) : [],
		browsers: row?.browsers ? JSON.parse(row.browsers) : [],
		devices: row?.devices ? JSON.parse(row.devices) : [],
		referrers: row?.referrers ? JSON.parse(row.referrers) : [],
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
 * Query active visitors on a specific path - single query
 */
export function query_active_on_path(
	client: SqliteClient,
	path: string,
	options: { window_ms?: number } = {},
): ActiveOnPathResult {
	const { window_ms = 5 * 60 * 1000 } = options
	const cutoff = Date.now() - window_ms

	try {
		const result = client.execute({
			sql: `WITH filtered AS (
					SELECT * FROM analytics_events
					WHERE path = ?1 AND created_at > ?2
				),
				country_data AS (
					SELECT country, COUNT(DISTINCT visitor_hash) as count
					FROM filtered
					WHERE COALESCE(is_bot, 0) = 0 AND country IS NOT NULL
					GROUP BY country ORDER BY count DESC LIMIT 5
				)
				SELECT
					(SELECT COUNT(DISTINCT visitor_hash) FROM filtered WHERE COALESCE(is_bot, 0) = 0) as count,
					(SELECT COUNT(DISTINCT visitor_hash) FROM filtered WHERE is_bot = 1) as bots,
					(SELECT json_group_array(json_object('country', country, 'count', count)) FROM country_data) as countries`,
			args: [path, cutoff],
		})

		const row = result.rows[0] as {
			count: number
			bots: number
			countries: string
		}

		return {
			count: row?.count ?? 0,
			bots: row?.bots ?? 0,
			countries: row?.countries ? JSON.parse(row.countries) : [],
		}
	} catch {
		return { count: 0, bots: 0, countries: [] }
	}
}
