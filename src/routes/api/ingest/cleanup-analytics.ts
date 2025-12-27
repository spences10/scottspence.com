import { sqlite_client } from '$lib/sqlite/client'

export const cleanup_analytics = async () => {
	console.log('Starting analytics cleanup...')

	try {
		// Drop analytics_events table if it exists
		sqlite_client.exec('DROP TABLE IF EXISTS analytics_events;')
		console.log('Dropped analytics_events table')

		// Remove analytics migration records
		sqlite_client.exec('DELETE FROM migrations WHERE id >= 3;')
		console.log('Cleaned up migration records')

		// Vacuum to reclaim space
		sqlite_client.exec('VACUUM;')
		console.log('Database vacuumed')

		return {
			success: true,
			message: 'Analytics cleanup complete - table dropped and database vacuumed',
		}
	} catch (error) {
		console.error('Cleanup failed:', error)
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Unknown error',
		}
	}
}
