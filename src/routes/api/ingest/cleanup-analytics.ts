import { sqlite_client } from '$lib/sqlite/client'

/**
 * Daily cleanup job to delete old analytics events
 * Run via cron at 00:15 daily (after rollup completes)
 *
 * Retention: 2 days (only need yesterday for rollup)
 * Also VACUUMs if significant data deleted
 */
export const cleanup_analytics = async () => {
	const client = sqlite_client

	// Delete events older than 2 days (in ms)
	const cutoff_ts = Date.now() - 2 * 24 * 60 * 60 * 1000

	console.log(
		`[cleanup] Deleting events older than ${new Date(cutoff_ts).toISOString()}`,
	)

	const result = client
		.prepare('DELETE FROM analytics_events WHERE created_at < ?')
		.run(cutoff_ts)

	console.log(`[cleanup] Deleted ${result.changes} old events`)

	// VACUUM if we deleted significant data to reclaim space
	if (result.changes > 1000) {
		console.log('[cleanup] Running VACUUM...')
		client.exec('VACUUM')
		console.log('[cleanup] VACUUM complete')
	}

	return {
		success: true,
		deleted: result.changes,
		vacuumed: result.changes > 1000,
	}
}
