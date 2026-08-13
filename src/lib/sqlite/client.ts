import { DATABASE_PATH } from '$env/static/private';
import { DatabaseSync } from 'node:sqlite';
import type { SQLInputValue } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';
import * as sqliteVec from 'sqlite-vec';

// Global database instance for singleton pattern with lazy initialization
let db_instance: DatabaseSync | null = null;

/**
 * Creates and configures a new SQLite database instance
 *
 * DEPLOYMENT NOTES FOR COOLIFY:
 * 1. Set DATABASE_PATH environment variable to point to persistent volume
 *    Example: DATABASE_PATH=/app/data/site-data.db
 * 2. Mount persistent storage in Coolify:
 *    - Volume name: site-data (or similar)
 *    - Destination path: /app/data
 *    - This ensures data survives container restarts
 *
 * @returns Configured Database instance
 */
const create_database = () => {
	// Database path configuration
	// Priority: Environment variable > Default data directory
	const db_path =
		DATABASE_PATH || path.join(process.cwd(), 'data', 'site-data.db');

	// Ensure directory exists (critical for first deployment)
	const db_dir = path.dirname(db_path);
	if (!fs.existsSync(db_dir)) {
		fs.mkdirSync(db_dir, { recursive: true });
	}

	const db = new DatabaseSync(db_path, {
		allowExtension: true,
		timeout: 5000,
	});

	/**
	 * Load sqlite-vec extension for vector similarity search
	 *
	 * DOCKER/COOLIFY DEPLOYMENT:
	 * - Uses the sqlite-vec npm package for reliable cross-platform support
	 * - Gracefully degrades if extension loading fails
	 */
	const load_vec_extension = () => {
		try {
			db.loadExtension(sqliteVec.getLoadablePath());
			console.log('sqlite-vec extension loaded successfully');
		} catch (error) {
			console.warn('sqlite-vec extension failed to load:', error);
			console.warn('Vector similarity queries will not work');
		} finally {
			db.enableLoadExtension(false);
		}
	};

	load_vec_extension();

	// Enable WAL mode for better concurrent access
	db.exec('PRAGMA journal_mode = WAL');

	return db;
};

// Type definition for the SQLite client
export type SqliteClient = {
	execute: (query: string | { sql: string; args?: unknown[] }) => {
		rows: Record<string, unknown>[];
	};
	batch: (queries: { sql: string; args?: unknown[] }[]) => {
		success: boolean;
	};
	prepare: (query: string) => {
		run: (...args: unknown[]) => {
			changes: number;
			lastInsertRowid: number | bigint;
		};
		get: (...args: unknown[]) => Record<string, unknown> | undefined;
		all: (...args: unknown[]) => Record<string, unknown>[];
	};
	exec: (sql: string) => void;
	close: () => void;
};

/**
 * Lazy database initialization - creates database instance only when first accessed
 * This prevents database creation during module import and enables better error handling
 *
 * @returns Database instance (singleton)
 */
const get_database = () => {
	if (!db_instance) {
		try {
			db_instance = create_database();
		} catch (error) {
			console.error('Failed to initialize database:', error);
			throw error;
		}
	}
	return db_instance;
};

/**
 * SQLite client with libsql-compatible API
 * Provides a unified interface for database operations that matches Turso's libsql client
 *
 * COOLIFY DEPLOYMENT CHECKLIST:
 * ✓ Database persistence: Set DATABASE_PATH environment variable
 * ✓ Volume mounting: Configure persistent storage for database files
 * ✓ Extension loading: Install sqlite-vec npm package if needed
 * ✓ WAL mode: Enabled for better concurrent access
 * ✓ Error handling: Comprehensive validation and error reporting
 */
export const sqlite_client: SqliteClient = {
	execute: (query: string | { sql: string; args?: unknown[] }) => {
		if (!query) {
			throw new Error('Query cannot be empty');
		}

		try {
			const db = get_database();
			if (typeof query === 'string') {
				// Simple string query
				const stmt = db.prepare(query);
				const rows = stmt.all() as Record<string, unknown>[];
				return { rows };
			} else {
				// Query with parameters
				if (!query.sql) {
					throw new Error('SQL string is required');
				}
				const stmt = db.prepare(query.sql);
				const rows = (
					query.args
						? stmt.all(...(query.args as SQLInputValue[]))
						: stmt.all()
				) as Record<string, unknown>[];
				return { rows };
			}
		} catch (error) {
			console.error('SQLite execute error:', error);
			throw error;
		}
	},

	batch: (queries: { sql: string; args?: unknown[] }[]) => {
		if (!queries || queries.length === 0) {
			throw new Error('Queries array cannot be empty');
		}

		const db = get_database();
		try {
			db.exec('BEGIN');
			for (const query of queries) {
				if (!query.sql) {
					throw new Error('SQL string is required for batch query');
				}
				const stmt = db.prepare(query.sql);
				if (query.args) {
					stmt.run(...(query.args as SQLInputValue[]));
				} else {
					stmt.run();
				}
			}
			db.exec('COMMIT');
			return { success: true };
		} catch (error) {
			if (db.isTransaction) {
				db.exec('ROLLBACK');
			}
			console.error('SQLite batch error:', error);
			throw error;
		}
	},

	prepare: (query: string) => {
		if (!query) {
			throw new Error('Query cannot be empty');
		}

		const db = get_database();
		const stmt = db.prepare(query);
		return {
			run: (...args: unknown[]) => {
				const result = stmt.run(...(args as SQLInputValue[]));
				return { ...result, changes: Number(result.changes) };
			},
			get: (...args: unknown[]) =>
				stmt.get(...(args as SQLInputValue[])) as
					| Record<string, unknown>
					| undefined,
			all: (...args: unknown[]) =>
				stmt.all(...(args as SQLInputValue[])) as Record<
					string,
					unknown
				>[],
		};
	},

	exec: (sql: string) => {
		if (!sql) {
			throw new Error('SQL cannot be empty');
		}

		try {
			const db = get_database();
			db.exec(sql);
		} catch (error) {
			console.error('SQLite exec error:', error);
			throw error;
		}
	},

	close: () => {
		if (db_instance) {
			try {
				db_instance.close();
				db_instance = null;
				console.log('Database connection closed');
			} catch (error) {
				console.error('Error closing database:', error);
			}
		}
	},
};

/**
 * No-op sync function for local SQLite (no replication needed)
 * Maintains API compatibility with Turso's sync_replica function
 */
export const sync_sqlite_replica = async (): Promise<void> => {
	console.log('Local SQLite: no sync needed');
};
