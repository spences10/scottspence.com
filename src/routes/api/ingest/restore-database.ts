import { DATABASE_PATH } from '$env/static/private'
import Database from 'better-sqlite3'
import fs from 'node:fs/promises'
import path from 'node:path'

export const restore_database = async (backup_filename?: string) => {
	try {
		const db_path =
			DATABASE_PATH ||
			path.join(process.cwd(), 'data', 'site-data.db')
		const backups_dir = path.join(path.dirname(db_path), 'backups')

		// Find available backup files
		const files = await fs.readdir(backups_dir)
		const backup_files = files
			.filter(
				(file) =>
					file.startsWith('site-data-') &&
					file.endsWith('.db') &&
					!file.includes('pre-restore') &&
					!file.includes('corrupted'),
			)
			.sort()
			.reverse() // newest first

		if (backup_files.length === 0) {
			throw new Error('No backup files found in backups directory')
		}

		// Use specified backup or latest one
		const backup_to_restore = backup_filename && backup_files.includes(backup_filename)
			? backup_filename
			: backup_files[0]

		const backup_path = path.join(backups_dir, backup_to_restore)

		// Create backup of current database before restoring using SQLite backup API
		const now = new Date()
		const date = now.toISOString().split('T')[0]
		const hour = now.getHours().toString().padStart(2, '0')
		const minute = now.getMinutes().toString().padStart(2, '0')
		const current_backup_name = `site-data-pre-restore-${date}-${hour}${minute}.db`
		const current_backup_path = path.join(backups_dir, current_backup_name)

		try {
			const current_db = new Database(db_path, { readonly: true })
			try {
				await current_db.backup(current_backup_path)
			} finally {
				current_db.close()
			}
		} catch (error) {
			console.warn('Could not backup current database (may not exist):', error)
		}

		// Restore from backup using SQLite backup API
		const backup_db = new Database(backup_path, { readonly: true })

		try {
			await backup_db.backup(db_path)
		} finally {
			backup_db.close()
		}

		const restored_size = await fs.stat(db_path)

		return {
			message: 'Database restored successfully',
			restored_from: backup_to_restore,
			database_size: `${Math.round(restored_size.size / 1024 / 1024)}MB`,
			pre_restore_backup: current_backup_name,
			available_backups: backup_files,
		}
	} catch (error) {
		console.error('Error restoring database:', error)
		throw error
	}
}