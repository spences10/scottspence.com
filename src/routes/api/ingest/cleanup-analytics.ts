import { sqlite_client } from '$lib/sqlite/client'

interface CleanupResult {
	success: boolean
	deleted_events: number
	error?: string
}

const RETENTION_DAYS = 7

/**
 * Delete analytics events older than retention period
 * Should be run daily via cron, after rollup_analytics
 */
export async function cleanup_analytics(): Promise<CleanupResult> {
	const client = sqlite_client

	try {
		const cutoff_ms =
			Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000

		const result = client
			.prepare(
				`
			DELETE FROM analytics_events
			WHERE created_at < ?
		`,
			)
			.run(cutoff_ms)

		// Reclaim space after delete
		if (result.changes > 0) {
			client.exec('VACUUM')
		}

		console.log('Analytics cleanup complete:', {
			deleted_events: result.changes,
			retention_days: RETENTION_DAYS,
			cutoff: new Date(cutoff_ms).toISOString(),
			vacuumed: result.changes > 0,
		})

		return {
			success: true,
			deleted_events: result.changes,
		}
	} catch (error) {
		console.error('Analytics cleanup error:', error)
		return {
			success: false,
			deleted_events: 0,
			error: error instanceof Error ? error.message : 'Unknown error',
		}
	}
}
