import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { sqlite_client } from './client'

// Create migrations table if it doesn't exist
function init_migrations_table() {
	sqlite_client.exec(`
    CREATE TABLE IF NOT EXISTS migrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      applied_at INTEGER NOT NULL
    )
  `)
}

// Get list of applied migrations
function get_applied_migrations(): string[] {
	const result = sqlite_client.execute(
		'SELECT name FROM migrations ORDER BY id',
	)
	return result.rows.map((row) => (row as { name: string }).name)
}

// Apply a single migration
function apply_migration(name: string, sql: string) {
	try {
		sqlite_client.exec(sql)
		sqlite_client
			.prepare(
				'INSERT INTO migrations (name, applied_at) VALUES (?, ?)',
			)
			.run(name, Date.now())
	} catch (error) {
		console.error(`Failed to apply migration ${name}:`, error)
		throw error
	}
}

// Run all pending migrations
export function run_migrations() {
	init_migrations_table()

	const applied = get_applied_migrations()
	const migrations_dir = 'migrations'

	// Get all migration files
	let migration_files: string[] = []
	try {
		migration_files = readdirSync(migrations_dir)
			.filter((f) => f.endsWith('.sql'))
			.sort()
	} catch (error) {
		// Migrations directory doesn't exist or is empty
		console.log('No migrations directory found')
		return
	}

	// Apply pending migrations
	const pending = migration_files.filter((f) => !applied.includes(f))

	if (pending.length === 0) {
		console.log('No pending migrations')
		return
	}

	console.log(`Applying ${pending.length} migration(s)...`)

	for (const file of pending) {
		console.log(`  - ${file}`)
		const sql = readFileSync(join(migrations_dir, file), 'utf-8')
		apply_migration(file, sql)
	}

	console.log('Migrations complete')
}
