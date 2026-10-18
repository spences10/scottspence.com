import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { TaskLogStore } from '../../../lib/sqlite/task-logs';
import {
	query_task_logs,
	TaskLogQueryError,
	validate_query_task_logs,
} from './query-task-logs';

let directory: string;
let store: TaskLogStore;
const query = (
	sql: string,
	params: (string | number | boolean | null)[] = [],
) => query_task_logs({ query: sql, params }, store.filename);

beforeEach(() => {
	directory = mkdtempSync(join(tmpdir(), 'task-log-query-'));
	store = new TaskLogStore(
		join(directory, 'task-logs.db'),
		'deploy-test',
	);
	const id = store.queue('example', 'manual');
	store.start(id);
	store.finish(id, 'failed', new Error('Example failure'));
});
afterEach(() => {
	store.close();
	rmSync(directory, { recursive: true, force: true });
});

describe('Read-only task log queries', () => {
	it('reads runs with parameters and joins their events', async () => {
		const result = await query(
			'SELECT r.task_name, e.message FROM task_runs r JOIN task_events e ON e.run_id = r.id WHERE r.status = ? ORDER BY e.id',
			['failed'],
		);
		expect(result.count).toBe(3);
		expect(result.rows.at(-1)).toEqual({
			task_name: 'example',
			message: 'Example failure',
		});
		expect(result.truncated).toBe(false);
	});

	it('supports schema discovery, aggregates, dates, CTEs and positional booleans', async () => {
		expect(
			(
				await query(
					"SELECT name FROM sqlite_schema WHERE type = 'table' ORDER BY name",
				)
			).rows,
		).toEqual([{ name: 'task_events' }, { name: 'task_runs' }]);
		expect(
			(
				await query(
					"WITH failed AS (SELECT * FROM task_runs WHERE status = 'failed') SELECT count(*) AS count, date(queued_at / 1000, 'unixepoch') AS day FROM failed",
				)
			).rows,
		).toEqual([{ count: 1, day: expect.any(String) }]);
		expect((await query('SELECT ? AS enabled', [true])).rows).toEqual(
			[{ enabled: 1 }],
		);
	});

	it.each([
		'DELETE FROM task_runs',
		"UPDATE task_runs SET status = 'succeeded'",
		'DROP TABLE task_events',
		'PRAGMA writable_schema = ON',
		"ATTACH DATABASE ':memory:' AS other",
		"SELECT load_extension('/tmp/not-an-extension')",
		"SELECT * FROM pragma_table_info('task_runs')",
		'SELECT count(*) FROM task_runs; DELETE FROM task_runs',
		'WITH x AS (SELECT 1) DELETE FROM task_runs',
		'SELECT randomblob(1000000000)',
	])(
		'rejects writes, additional databases, extensions and multiple statements: %s',
		async (sql) => {
			await expect(query(sql)).rejects.toBeInstanceOf(
				TaskLogQueryError,
			);
			expect(
				(await query('SELECT count(*) AS count FROM task_runs')).rows,
			).toEqual([{ count: 1 }]);
		},
	);

	it('does not expose other tables added to the same database', async () => {
		const db = new DatabaseSync(store.filename);
		db.exec(
			"CREATE TABLE private_internal (value TEXT); INSERT INTO private_internal VALUES ('test-only-sensitive');",
		);
		db.close();
		await expect(
			query('SELECT value FROM private_internal'),
		).rejects.toBeInstanceOf(TaskLogQueryError);
		await expect(
			query('SELECT count(*) FROM private_internal'),
		).rejects.toBeInstanceOf(TaskLogQueryError);
	});

	it('caps result rows even without LIMIT', async () => {
		const result = await query(
			'WITH RECURSIVE n(x) AS (VALUES(1) UNION ALL SELECT x+1 FROM n WHERE x < 1000) SELECT x FROM n',
		);
		expect(result.count).toBe(200);
		expect(result.truncated).toBe(true);
	});

	it('caps returned bytes as well as the row count', async () => {
		const result = await query(
			'WITH RECURSIVE n(x) AS (VALUES(1) UNION ALL SELECT x+1 FROM n WHERE x < 200) SELECT ? AS message FROM n',
			['x'.repeat(4096)],
		);
		expect(result.truncated).toBe(true);
		expect(
			Buffer.byteLength(JSON.stringify(result.rows)),
		).toBeLessThan(257 * 1024);
	});

	it('kills expensive native queries without blocking the web event loop', async () => {
		let responsive = false;
		const request = query(
			'WITH RECURSIVE n(x) AS (VALUES(1) UNION ALL SELECT x+1 FROM n) SELECT sum(x) FROM n',
		);
		setTimeout(() => {
			responsive = true;
		}, 10);
		await expect(request).rejects.toThrow('two-second time limit');
		expect(responsive).toBe(true);
		expect(
			(await query('SELECT count(*) AS count FROM task_runs')).count,
		).toBe(1);
	});

	it('limits concurrent queries without blocking later reads', async () => {
		const sql =
			'WITH RECURSIVE n(x) AS (VALUES(1) UNION ALL SELECT x+1 FROM n) SELECT sum(x) FROM n';
		const pending = Promise.allSettled([query(sql), query(sql)]);
		expect(() => query('SELECT 1')).toThrow('Too many log queries');
		expect(
			(await pending).every((result) => result.status === 'rejected'),
		).toBe(true);
		expect((await query('SELECT 1 AS value')).rows).toEqual([
			{ value: 1 },
		]);
	});

	it('validates bounded SQL and parameters before starting a query', () => {
		expect(validate_query_task_logs({ query: ' SELECT 1 ' })).toEqual(
			{ query: 'SELECT 1', params: [] },
		);
		for (const input of [
			{ query: '' },
			{ query: 'x'.repeat(10_001) },
			{ query: 'SELECT ?', params: [{}] },
			{ query: 'SELECT ?', params: ['x'.repeat(4097)] },
		]) {
			expect(() => validate_query_task_logs(input)).toThrow();
		}
	});
});
