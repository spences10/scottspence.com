import { DATABASE_PATH, PRODUCTION_URL, INGEST_TOKEN } from '$env/static/private'
import fs from 'node:fs/promises'
import path from 'node:path'

export const pull_database = async () => {
	try {
		const db_path =
			DATABASE_PATH ||
			path.join(process.cwd(), 'data', 'site-data.db')
		const backups_dir = path.join(path.dirname(db_path), 'backups')
		
		// Ensure backups directory exists
		await fs.mkdir(backups_dir, { recursive: true })

		if (!PRODUCTION_URL) {
			throw new Error('PRODUCTION_URL environment variable not set')
		}

		// Download latest backup from production
		console.log('Downloading latest backup from production...')
		const response = await fetch(`${PRODUCTION_URL}/api/ingest/download`, {
			headers: {
				'Authorization': `Bearer ${INGEST_TOKEN}`,
			},
		})

		if (!response.ok) {
			throw new Error(`Failed to download backup: ${response.status} ${response.statusText}`)
		}

		// Save downloaded backup
		const timestamp = new Date().toISOString().split('T')[0]
		const backup_filename = `site-data-${timestamp}.db`
		const backup_path = path.join(backups_dir, backup_filename)
		
		const arrayBuffer = await response.arrayBuffer()
		await fs.writeFile(backup_path, new Uint8Array(arrayBuffer))

		// Create backup of current local database before replacing
		const current_backup_name = `site-data-local-backup-${timestamp}.db`
		const current_backup_path = path.join(backups_dir, current_backup_name)

		try {
			await fs.copyFile(db_path, current_backup_path)
		} catch (error) {
			console.warn('Could not backup current database (may not exist):', error)
		}

		// Replace local database with downloaded backup
		await fs.copyFile(backup_path, db_path)

		const imported_size = await fs.stat(db_path)

		return {
			message: 'Database pulled from production successfully',
			downloaded_backup: backup_filename,
			database_size: `${Math.round(imported_size.size / 1024 / 1024)}MB`,
			local_backup_created: current_backup_name,
		}
	} catch (error) {
		console.error('Error pulling database:', error)
		throw error
	}
}
