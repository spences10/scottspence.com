import { DATABASE_PATH } from '$env/static/private'
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

		// Create timestamped backup filename
		const timestamp = new Date().toISOString().split('T')[0] // YYYY-MM-DD
		const backup_filename = `site-data-${timestamp}.db`
		const backup_path = path.join(backups_dir, backup_filename)

		// Copy database file
		await fs.copyFile(db_path, backup_path)

		// Clean up old backups (keep only 7 days)
		const files = await fs.readdir(backups_dir)
		const backup_files = files
			.filter(
				(file) =>
					file.startsWith('site-data-') && file.endsWith('.db'),
			)
			.sort()
			.reverse() // newest first

		// Remove files beyond the 7 most recent
		const files_to_delete = backup_files.slice(7)
		for (const file of files_to_delete) {
			await fs.unlink(path.join(backups_dir, file))
		}

		const backup_size = await fs.stat(backup_path)

		return {
			message: 'Database exported successfully',
			backup_file: backup_filename,
			backup_size: `${Math.round(backup_size.size / 1024 / 1024)}MB`,
			backups_kept: Math.min(backup_files.length, 7),
			files_deleted: files_to_delete.length,
		}
	} catch (error) {
		console.error('Error exporting database:', error)
		throw error
	}
}
