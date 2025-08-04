import Database from 'better-sqlite3'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

// Get the directory of the current module
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const create_database = () => {
	// Default to data directory in project root
	const db_path = process.env.DATABASE_PATH || path.join(process.cwd(), 'data', 'blog.db')
	
	// Ensure directory exists
	const db_dir = path.dirname(db_path)
	if (!fs.existsSync(db_dir)) {
		fs.mkdirSync(db_dir, { recursive: true })
	}
	
	const db = new Database(db_path)
	
	// Load sqlite-vec extension
	// This path will need to be adjusted based on your deployment
	const vec_extension_path = path.join(
		process.cwd(), 
		'node_modules', 
		'.pnpm', 
		'sqlite-vec-linux-x64@0.1.7-alpha.2',
		'node_modules',
		'sqlite-vec-linux-x64',
		'vec0.so'
	)
	
	try {
		db.loadExtension(vec_extension_path)
	} catch (error) {
		console.warn('Failed to load sqlite-vec extension:', error)
		console.warn('Vector similarity queries will not work')
	}
	
	// Enable WAL mode for better concurrent access
	db.pragma('journal_mode = WAL')
	
	return db
}

// Create a single database instance
const db = create_database()

// Create a compatible interface that matches the libsql client API
export const sqlite_client = {
	execute: (query: string | { sql: string; args?: any[] }) => {
		try {
			if (typeof query === 'string') {
				// Simple string query
				const stmt = db.prepare(query)
				const rows = stmt.all()
				return { rows }
			} else {
				// Query with parameters
				const stmt = db.prepare(query.sql)
				const rows = query.args ? stmt.all(...query.args) : stmt.all()
				return { rows }
			}
		} catch (error) {
			console.error('SQLite execute error:', error)
			throw error
		}
	},
	
	batch: (queries: { sql: string; args?: any[] }[]) => {
		try {
			const transaction = db.transaction(() => {
				for (const query of queries) {
					const stmt = db.prepare(query.sql)
					if (query.args) {
						stmt.run(...query.args)
					} else {
						stmt.run()
					}
				}
			})
			transaction()
			return { success: true }
		} catch (error) {
			console.error('SQLite batch error:', error)
			throw error
		}
	}
}

export const sync_sqlite_replica = async (): Promise<void> => {
	console.log('Local SQLite: no sync needed')
}

// Legacy exports for compatibility during migration
export const turso_client = () => sqlite_client
export const sync_turso_replica = sync_sqlite_replica