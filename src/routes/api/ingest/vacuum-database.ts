import { sqlite_client } from '$lib/sqlite/client'

interface VacuumResult {
	success: boolean
	error?: string
}

/**
 * Reclaim unused space in the database
 * Run manually when needed or after large deletes
 */
export async function vacuum_database(): Promise<VacuumResult> {
	try {
		console.log('Starting database vacuum...')
		sqlite_client.exec('VACUUM')
		console.log('Database vacuum complete')

		return {
			success: true,
		}
	} catch (error) {
		console.error('Database vacuum error:', error)
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Unknown error',
		}
	}
}
