import {
	DATABASE_PATH,
	INGEST_TOKEN,
	PRODUCTION_URL,
} from '$env/static/private'
import Database from 'better-sqlite3'
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
		const response = await fetch(
			`${PRODUCTION_URL}/api/ingest/download`,
			{
				headers: {
					Authorization: `Bearer ${INGEST_TOKEN}`,
				},
			},
		)

		if (!response.ok) {
			throw new Error(
				`Failed to download backup: ${response.status} ${response.statusText}`,
			)
		}

		// Save downloaded backup to temporary location
		const now = new Date()
		const date = now.toISOString().split('T')[0]
		const hour = now.getHours().toString().padStart(2, '0')
		const minute = now.getMinutes().toString().padStart(2, '0')
		const downloaded_filename = `site-data-downloaded-${date}-${hour}${minute}.db`
		const downloaded_path = path.join(
			backups_dir,
			downloaded_filename,
		)

		const arrayBuffer = await response.arrayBuffer()
		await fs.writeFile(downloaded_path, new Uint8Array(arrayBuffer))

		// Create backup of current local database before replacing using SQLite backup API
		const current_backup_name = `site-data-local-backup-${date}-${hour}${minute}.db`
		const current_backup_path = path.join(
			backups_dir,
			current_backup_name,
		)

		try {
			const current_db = new Database(db_path, { readonly: true })
			try {
				await current_db.backup(current_backup_path)
			} finally {
				current_db.close()
			}
		} catch (error) {
			console.warn(
				'Could not backup current database (may not exist):',
				error,
			)
		}

		// Replace local database with downloaded backup using SQLite backup API
		const downloaded_db = new Database(downloaded_path, {
			readonly: true,
		})

		try {
			await downloaded_db.backup(db_path)
		} finally {
			downloaded_db.close()
		}

		const imported_size = await fs.stat(db_path)

		return {
			message: 'Database pulled from production successfully',
			downloaded_backup: downloaded_filename,
			database_size: `${Math.round(imported_size.size / 1024 / 1024)}MB`,
			local_backup_created: current_backup_name,
		}
	} catch (error) {
		console.error('Error pulling database:', error)
		throw error
	}
}
