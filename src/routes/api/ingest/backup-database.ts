import { DATABASE_PATH } from '$env/static/private'
import Database from 'better-sqlite3'
import fs from 'node:fs/promises'
import path from 'node:path'

export const backup_database = async () => {
	try {
		const db_path =
			DATABASE_PATH ||
			path.join(process.cwd(), 'data', 'site-data.db')
		const backups_dir = path.join(path.dirname(db_path), 'backups')

		// Ensure backups directory exists
		await fs.mkdir(backups_dir, { recursive: true })

		// Create timestamped backup filename with hour for multiple backups per day
		const now = new Date()
		const date = now.toISOString().split('T')[0] // YYYY-MM-DD
		const hour = now.getHours().toString().padStart(2, '0')
		const backup_filename = `site-data-${date}-${hour}00.db`
		const backup_path = path.join(backups_dir, backup_filename)

		// Use SQLite's native backup API to avoid corruption with WAL mode
		// Opens a separate connection for backup to ensure consistency
		const source_db = new Database(db_path, { readonly: true })

		try {
			await source_db.backup(backup_path)
		} finally {
			source_db.close()
		}

		// Clean up old backups (keep 28 backups = 7 days × 4 backups/day)
		const files = await fs.readdir(backups_dir)
		const backup_files = files
			.filter(
				(file) =>
					file.startsWith('site-data-') && file.endsWith('.db'),
			)
			.sort()
			.reverse() // newest first

		// Remove files beyond the 28 most recent
		const files_to_delete = backup_files.slice(28)
		for (const file of files_to_delete) {
			await fs.unlink(path.join(backups_dir, file))
		}

		const backup_size = await fs.stat(backup_path)

		return {
			message: 'Database exported successfully',
			backup_file: backup_filename,
			backup_size: `${Math.round(backup_size.size / 1024 / 1024)}MB`,
			backups_kept: Math.min(backup_files.length, 28),
			files_deleted: files_to_delete.length,
		}
	} catch (error) {
		console.error('Error exporting database:', error)
		throw error
	}
}
