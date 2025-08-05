import { DATABASE_PATH } from '$env/static/private'
import fs from 'node:fs/promises'
import path from 'node:path'

export const import_database = async () => {
	try {
		const db_path =
			DATABASE_PATH ||
			path.join(process.cwd(), 'data', 'site-data.db')
		const backups_dir = path.join(path.dirname(db_path), 'backups')

		// Find the most recent backup file
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

		const latest_backup = backup_files[0]
		const backup_path = path.join(backups_dir, latest_backup)

		// Create backup of current database before replacing
		const current_backup_name = `site-data-local-backup-${new Date().toISOString().split('T')[0]}.db`
		const current_backup_path = path.join(
			backups_dir,
			current_backup_name,
		)

		try {
			await fs.copyFile(db_path, current_backup_path)
		} catch (error) {
			console.warn(
				'Could not backup current database (may not exist):',
				error,
			)
		}

		// Replace current database with latest backup
		await fs.copyFile(backup_path, db_path)

		const imported_size = await fs.stat(db_path)

		return {
			message: 'Database imported successfully',
			imported_from: latest_backup,
			database_size: `${Math.round(imported_size.size / 1024 / 1024)}MB`,
			local_backup_created: current_backup_name,
			available_backups: backup_files.length,
		}
	} catch (error) {
		console.error('Error importing database:', error)
		throw error
	}
}
