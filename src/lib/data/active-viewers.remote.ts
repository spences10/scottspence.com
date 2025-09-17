import { query } from '$app/server'
import {
	BYPASS_DB_READS,
	CACHE_DURATIONS,
	get_from_cache,
	set_cache,
} from '$lib/cache/server-cache'
import { sqlite_client } from '$lib/sqlite/client'
import * as v from 'valibot'

interface ActiveViewersData {
	count: number
	page_slug: string
	error?: string
}

export const get_active_viewers = query(
	v.string(),
	async (page_slug: string): Promise<ActiveViewersData> => {
		if (BYPASS_DB_READS.active_viewers) {
			return {
				count: 0,
				page_slug,
			}
		}

		// Check server cache first - short cache for near real-time feel
		const cache_key = `active_viewers_${page_slug}`
		const cached = get_from_cache<ActiveViewersData>(
			cache_key,
			CACHE_DURATIONS.active_viewers,
		)
		if (cached) {
			return cached
		}

		try {
			// Clean up stale sessions (older than 5 minutes)
			const cleanup_stmt = sqlite_client.prepare(`
				DELETE FROM current_visitors 
				WHERE datetime(last_visit) < datetime('now', '-5 minutes')
			`)
			cleanup_stmt.run()

			// Get count of active viewers for this page
			const result = await sqlite_client.execute({
				sql: `
					SELECT COUNT(DISTINCT session_id) as count
					FROM current_visitors 
					WHERE page_slug = ? 
					AND datetime(last_visit) > datetime('now', '-5 minutes')
				`,
				args: [page_slug],
			})

			const count =
				result.rows.length > 0 ? Number(result.rows[0]['count']) : 0

			const data: ActiveViewersData = {
				count,
				page_slug,
			}

			// Cache the result
			set_cache(cache_key, data)
			return data
		} catch (error) {
			console.warn('Database unavailable for active viewers:', error)
			return {
				count: 0,
				page_slug,
				error: 'Database unavailable',
			}
		}
	},
)

export const get_site_wide_active_viewers = query(
	async (): Promise<{ count: number; error?: string }> => {
		if (BYPASS_DB_READS.active_viewers) {
			return { count: 0 }
		}

		// Check server cache first
		const cache_key = 'site_wide_active_viewers'
		const cached = get_from_cache<{ count: number }>(
			cache_key,
			CACHE_DURATIONS.active_viewers,
		)
		if (cached) {
			return cached
		}

		try {
			// Clean up stale sessions (older than 5 minutes)
			const cleanup_stmt = sqlite_client.prepare(`
				DELETE FROM current_visitors 
				WHERE datetime(last_visit) < datetime('now', '-5 minutes')
			`)
			cleanup_stmt.run()

			// Get count of all active viewers across the site
			const result = await sqlite_client.execute(`
				SELECT COUNT(DISTINCT session_id) as count
				FROM current_visitors 
				WHERE datetime(last_visit) > datetime('now', '-5 minutes')
			`)

			const count =
				result.rows.length > 0 ? Number(result.rows[0]['count']) : 0

			const data = { count }

			// Cache the result
			set_cache(cache_key, data)
			return data
		} catch (error) {
			console.warn(
				'Database unavailable for site-wide active viewers:',
				error,
			)
			return {
				count: 0,
				error: 'Database unavailable',
			}
		}
	},
)

export type { ActiveViewersData }
