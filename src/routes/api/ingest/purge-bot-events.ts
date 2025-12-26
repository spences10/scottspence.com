import { sqlite_client } from '$lib/sqlite/client'

interface PurgeResult {
	success: boolean
	deleted_events: number
	error?: string
}

/**
 * One-time purge of flagged bot events
 * Run after flag_bot_behaviour and rollup_analytics
 * Only use when you want immediate space recovery
 */
export async function purge_bot_events(): Promise<PurgeResult> {
	const client = sqlite_client

	try {
		const result = client
			.prepare(
				`
			DELETE FROM analytics_events
			WHERE is_bot = 1
		`,
			)
			.run()

		// Reclaim space
		if (result.changes > 0) {
			client.exec('VACUUM')
		}

		console.log('Bot events purge complete:', {
			deleted_events: result.changes,
			vacuumed: result.changes > 0,
		})

		return {
			success: true,
			deleted_events: result.changes,
		}
	} catch (error) {
		console.error('Bot events purge error:', error)
		return {
			success: false,
			deleted_events: 0,
			error: error instanceof Error ? error.message : 'Unknown error',
		}
	}
}
