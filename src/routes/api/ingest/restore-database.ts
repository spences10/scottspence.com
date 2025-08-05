import { DATABASE_PATH } from '$env/static/private'
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
					file.startsWith('site-data-') && file.endsWith('.db'),
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

		// Create backup of current database before restoring
		const current_backup_name = `site-data-pre-restore-${new Date().toISOString().split('T')[0]}.db`
		const current_backup_path = path.join(backups_dir, current_backup_name)

		try {
			await fs.copyFile(db_path, current_backup_path)
		} catch (error) {
			console.warn('Could not backup current database (may not exist):', error)
		}

		// Restore from backup
		await fs.copyFile(backup_path, db_path)

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