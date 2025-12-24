/**
 * Analytics helper functions - testable pure logic
 * These are used by analytics.remote.ts
 */

export interface ActiveVisitorsResult {
	pages: { path: string; count: number }[]
	total: number
}

export interface ActiveOnPathResult {
	count: number
}

export interface SqliteClient {
	execute: (query: { sql: string; args: unknown[] }) => {
		rows: unknown[]
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
		const result = client.execute({
			sql: `SELECT path, COUNT(DISTINCT visitor_hash) as count
				FROM analytics_events
				WHERE created_at > ?
				GROUP BY path
				ORDER BY count DESC
				LIMIT ?`,
			args: [cutoff, limit],
		})

		const total = client.execute({
			sql: `SELECT COUNT(DISTINCT visitor_hash) as count
				FROM analytics_events
				WHERE created_at > ?`,
			args: [cutoff],
		})

		return {
			pages: result.rows as { path: string; count: number }[],
			total: Number((total.rows[0] as { count: number })?.count ?? 0),
		}
	} catch {
		return { pages: [], total: 0 }
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
		const result = client.execute({
			sql: `SELECT COUNT(DISTINCT visitor_hash) as count
				FROM analytics_events
				WHERE path = ? AND created_at > ?`,
			args: [path, cutoff],
		})

		const count =
			result.rows.length > 0
				? Number((result.rows[0] as { count: number }).count)
				: 0
		return { count }
	} catch {
		return { count: 0 }
	}
}
