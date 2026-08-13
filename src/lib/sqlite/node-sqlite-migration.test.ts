import { backup, DatabaseSync } from 'node:sqlite';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import * as sqliteVec from 'sqlite-vec';
import { describe, expect, test } from 'vitest';
import package_json from '../../../package.json' with { type: 'json' };

const project_root = path.resolve(import.meta.dirname, '../../..');

describe('node:sqlite migration', () => {
	test('requires a Coolify-compatible Node runtime with node:sqlite', () => {
		expect(package_json.engines.node).toBe('>=24.15.0');
		expect(DatabaseSync).toBeTypeOf('function');
	});

	test('does not depend on better-sqlite3 packages', () => {
		expect(package_json.dependencies).not.toHaveProperty(
			'better-sqlite3',
		);
		expect(package_json.devDependencies).not.toHaveProperty(
			'@types/better-sqlite3',
		);
	});

	test('does not install redundant SQLite build packages in Nixpacks', async () => {
		const nixpacks = await fs.readFile(
			path.join(project_root, 'nixpacks.toml'),
			'utf8',
		);

		expect(nixpacks).toContain('nodejs_24');
		expect(nixpacks).not.toContain('libsqlite3-dev');
		expect(nixpacks).not.toContain('"sqlite"');
		expect(nixpacks).not.toContain('sqlite3');
		expect(nixpacks).not.toContain('gcc');
		expect(nixpacks).not.toContain('pkg-config');
	});

	test('keeps SQLite backup behaviour through node:sqlite', async () => {
		const temp_dir = await fs.mkdtemp(
			path.join(os.tmpdir(), 'node-sqlite-backup-'),
		);
		const db_path = path.join(temp_dir, 'source.db');
		const backup_path = path.join(temp_dir, 'backup.db');
		const db = new DatabaseSync(db_path);

		try {
			db.exec('CREATE TABLE entries (value TEXT NOT NULL)');
			db.prepare('INSERT INTO entries (value) VALUES (?)').run('ok');

			await backup(db, backup_path);
		} finally {
			db.close();
		}

		const restored = new DatabaseSync(backup_path, {
			readOnly: true,
		});
		try {
			expect(
				restored.prepare('SELECT value FROM entries').get(),
			).toEqual({ value: 'ok' });
		} finally {
			restored.close();
			await fs.rm(temp_dir, { recursive: true, force: true });
		}
	});

	test('keeps sqlite-vec loadable extension support', () => {
		const db = new DatabaseSync(':memory:', { allowExtension: true });

		try {
			sqliteVec.load(db);
			expect(
				db.prepare('SELECT vec_version() AS version').get(),
			).toEqual({ version: 'v0.1.9' });
		} finally {
			db.close();
		}
	});
});
