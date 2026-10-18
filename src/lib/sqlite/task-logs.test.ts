import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import {
	afterEach,
	beforeEach,
	describe,
	expect,
	it,
	vi,
} from 'vitest';
import {
	interrupt_task_log_owner,
	sanitise_task_log,
	TaskLogStore,
	type TaskLogDetails,
} from './task-logs';

let directory: string;
const stores: TaskLogStore[] = [];
const connections: DatabaseSync[] = [];
function open() {
	const store = new TaskLogStore(
		join(directory, 'task-logs.db'),
		'deploy-test',
		['private-secret-value'],
	);
	stores.push(store);
	return store;
}
function reader() {
	const db = new DatabaseSync(join(directory, 'task-logs.db'));
	connections.push(db);
	return db;
}

beforeEach(() => {
	directory = mkdtempSync(join(tmpdir(), 'task-logs-'));
});
afterEach(() => {
	for (const store of stores.splice(0)) {
		try {
			store.close();
		} catch {}
	}
	for (const db of connections.splice(0)) db.close();
	vi.useRealTimers();
	rmSync(directory, { recursive: true, force: true });
});

describe('Persistent task history', () => {
	it('persists a manual run and its events across connections and restarts', () => {
		const store = open();
		const id = store.queue('backup_database', 'manual');
		store.start(id);
		store.event(id, 'info', 'Backup written', { bytes: 2048 });
		store.finish(id, 'succeeded');
		store.close();
		open();
		expect(
			reader()
				.prepare('SELECT * FROM task_runs WHERE id = ?')
				.get(id),
		).toMatchObject({
			id,
			task_name: 'backup_database',
			trigger: 'manual',
			status: 'succeeded',
			deployment_id: 'deploy-test',
			scheduled_at: null,
			error_message: null,
			started_at: expect.any(Number),
			finished_at: expect.any(Number),
			duration_ms: expect.any(Number),
		});
		expect(
			reader()
				.prepare(
					'SELECT message FROM task_events WHERE run_id = ? ORDER BY id',
				)
				.all(id)
				.map((row) => row.message),
		).toEqual([
			'Task queued',
			'Task started',
			'Backup written',
			'Task completed',
		]);
	});

	it('records planned times, queue delay and skipped jobs separately', () => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date('2026-10-18T03:00:00Z'));
		const store = open();
		const planned = Date.now();
		const id = store.queue('update_posts', 'scheduled', planned);
		vi.advanceTimersByTime(5000);
		store.start(id);
		vi.advanceTimersByTime(2000);
		store.finish(id, 'succeeded');
		const skipped = store.skip(
			'update_posts',
			planned + 60_000,
			'Previous run is queued or running',
		);
		expect(
			reader()
				.prepare('SELECT * FROM task_runs WHERE id = ?')
				.get(id),
		).toMatchObject({
			scheduled_at: planned,
			queued_at: planned,
			started_at: planned + 5000,
			finished_at: planned + 7000,
			duration_ms: 2000,
		});
		expect(
			reader()
				.prepare('SELECT * FROM task_runs WHERE id = ?')
				.get(skipped),
		).toMatchObject({
			status: 'skipped',
			started_at: null,
			duration_ms: null,
		});
	});

	it('redacts secrets and bounds error and event text without storing string details', () => {
		const store = open();
		const id = store.queue('example', 'manual');
		store.start(id);
		store.event(id, 'warn', 'Bearer abc123 private-secret-value', {
			processed: 2,
			token: 123456,
			payload: 'do not store',
			bad: Infinity,
		} as unknown as TaskLogDetails);
		store.finish(
			id,
			'failed',
			new Error(
				'private-secret-value https://user:password@example.com/?token=hidden token=another-value',
			),
		);
		const db = reader();
		const history = JSON.stringify(
			db.prepare('SELECT * FROM task_events').all(),
		);
		for (const secret of [
			'private-secret-value',
			'abc123',
			'another-value',
			'user:password',
			'do not store',
		])
			expect(history).not.toContain(secret);
		expect(
			db
				.prepare(
					'SELECT details_json FROM task_events WHERE level = ?',
				)
				.get('warn')?.details_json,
		).toBe('{"processed":2}');
		expect(
			db.prepare('SELECT status FROM task_runs WHERE id = ?').get(id)
				?.status,
		).toBe('failed');
		expect(sanitise_task_log('x'.repeat(5000))).toHaveLength(2048);
		expect(sanitise_task_log({ private: 'do not store' })).toBe(
			'Task failed',
		);
		expect(
			sanitise_task_log('secret%2Fvalue', ['secret/value']),
		).toBe('[REDACTED]');
	});

	it('records even an undefined thrown error as a failure', () => {
		const store = open();
		const id = store.queue('example', 'manual');
		store.start(id);
		store.finish(id, 'failed', undefined);
		expect(
			reader()
				.prepare(
					'SELECT status, error_message FROM task_runs WHERE id = ?',
				)
				.get(id),
		).toMatchObject({
			status: 'failed',
			error_message: 'Task failed',
		});
	});

	it('marks only unfinished runs owned by a process known to have exited', () => {
		const first = open();
		const second = open();
		const running = first.queue('one', 'scheduled');
		first.start(running);
		const queued = first.queue('two', 'scheduled');
		const completed = first.queue('three', 'manual');
		first.start(completed);
		first.finish(completed, 'succeeded');
		const other = second.queue('four', 'manual');
		second.start(other);
		expect(
			interrupt_task_log_owner(first.filename, first.owner_id),
		).toBe(2);
		expect(
			interrupt_task_log_owner(first.filename, first.owner_id),
		).toBe(0);
		const db = reader();
		expect(
			db
				.prepare('SELECT status FROM task_runs WHERE id = ?')
				.get(running)?.status,
		).toBe('interrupted');
		expect(
			db
				.prepare(
					'SELECT status, duration_ms FROM task_runs WHERE id = ?',
				)
				.get(queued),
		).toMatchObject({ status: 'interrupted', duration_ms: null });
		expect(
			db
				.prepare('SELECT status FROM task_runs WHERE id = ?')
				.get(completed)?.status,
		).toBe('succeeded');
		expect(
			db
				.prepare('SELECT status FROM task_runs WHERE id = ?')
				.get(other)?.status,
		).toBe('running');
	});

	it('recovers a dead same-host owner but does not interrupt a live owner', () => {
		const store = open();
		const dead = store.queue('dead', 'manual');
		store.start(dead);
		const live = store.queue('live', 'manual');
		store.start(live);
		reader()
			.prepare(
				'UPDATE task_runs SET owner_id = ?, owner_pid = ? WHERE id = ?',
			)
			.run('dead-owner', 2147483647, dead);
		open();
		const db = reader();
		expect(
			db
				.prepare('SELECT status FROM task_runs WHERE id = ?')
				.get(dead)?.status,
		).toBe('interrupted');
		expect(
			db
				.prepare('SELECT status FROM task_runs WHERE id = ?')
				.get(live)?.status,
		).toBe('running');
	});

	it('purges records older than 30 days and cascades their events', () => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date('2026-09-01T00:00:00Z'));
		const store = open();
		const old = store.queue('old', 'manual');
		store.start(old);
		store.finish(old, 'succeeded');
		vi.setSystemTime(new Date('2026-10-01T00:00:00Z'));
		const boundary = store.queue('boundary', 'manual');
		vi.setSystemTime(new Date('2026-10-31T00:00:00Z'));
		const current = store.queue('current', 'manual');
		expect(store.purge()).toEqual({ deleted: 1, retention_days: 30 });
		const db = reader();
		expect(
			db
				.prepare('SELECT id FROM task_runs ORDER BY queued_at')
				.all()
				.map((row) => row.id),
		).toEqual([boundary, current]);
		expect(
			db
				.prepare(
					'SELECT count(*) AS count FROM task_events WHERE run_id = ?',
				)
				.get(old)?.count,
		).toBe(0);
	});
});
