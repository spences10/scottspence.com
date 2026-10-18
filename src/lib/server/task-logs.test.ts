import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
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

const config = vi.hoisted(() => ({ database_path: '' }));
vi.mock('$app/env/private', () => ({
	get DATABASE_PATH() {
		return config.database_path;
	},
	INGEST_TOKEN: 'private-secret-value',
}));

import { TaskLogStore } from '../sqlite/task-logs';
import { log_task_event } from './task-log-context';
import {
	close_task_logs,
	get_task_log_store,
	run_logged_task,
} from './task-logs';

let directory: string;
function rows(table: 'task_runs' | 'task_events') {
	const db = new DatabaseSync(join(directory, 'task-logs.db'), {
		readOnly: true,
	});
	try {
		return db.prepare(`SELECT * FROM ${table}`).all();
	} finally {
		db.close();
	}
}

beforeEach(() => {
	directory = mkdtempSync(join(tmpdir(), 'logged-task-'));
	config.database_path = join(directory, 'site-data.db');
	vi.spyOn(console, 'warn').mockImplementation(() => {});
});
afterEach(() => {
	close_task_logs();
	vi.restoreAllMocks();
	rmSync(directory, { recursive: true, force: true });
});

describe('Shared task logging', () => {
	it('stores manual success and numeric counts but never full results', async () => {
		const result = {
			processed: 3,
			token: 'result-must-not-be-stored',
			api_key: 123456,
		};
		expect(
			await run_logged_task('example', async () => {
				log_task_event('info', 'Processed records', { processed: 3 });
				return result;
			}),
		).toBe(result);
		expect(rows('task_runs')[0]).toMatchObject({
			task_name: 'example',
			trigger: 'manual',
			status: 'succeeded',
		});
		const events = rows('task_events');
		expect(events.map((row) => row.message)).toContain(
			'Processed records',
		);
		expect(JSON.stringify(events)).not.toContain(result.token);
		expect(events.at(-1)?.details_json).toBe('{"processed":3}');
	});

	it('updates a scheduled queue record rather than creating a second run', async () => {
		const store = get_task_log_store();
		const planned = Date.now() - 1000;
		const run_id = store.queue('scheduled', 'scheduled', planned);
		await run_logged_task('scheduled', async () => 'done', {
			trigger: 'scheduled',
			run_id,
		});
		expect(rows('task_runs')).toHaveLength(1);
		expect(rows('task_runs')[0]).toMatchObject({
			id: run_id,
			status: 'succeeded',
			trigger: 'scheduled',
			scheduled_at: planned,
		});
	});

	it('preserves the original error while storing only its redacted message', async () => {
		const error = new Error('Failed with private-secret-value');
		await expect(
			run_logged_task('failing', async () => {
				throw error;
			}),
		).rejects.toBe(error);
		expect(rows('task_runs')[0]).toMatchObject({
			status: 'failed',
			error_message: 'Failed with [REDACTED]',
		});
		expect(JSON.stringify(rows('task_events'))).not.toContain(
			'private-secret-value',
		);
	});

	it('keeps concurrent manual task events attached to the correct runs', async () => {
		await Promise.all(
			['one', 'two'].map((name) =>
				run_logged_task(name, async () => {
					await new Promise((resolve) =>
						setTimeout(resolve, name === 'one' ? 10 : 1),
					);
					log_task_event('info', `Event for ${name}`);
				}),
			),
		);
		for (const run of rows('task_runs')) {
			expect(
				rows('task_events')
					.filter((event) => event.run_id === run.id)
					.map((event) => event.message),
			).toContain(`Event for ${run.task_name}`);
		}
	});

	it('does not change task success or failure when log storage is unavailable', async () => {
		const blocked = join(directory, 'not-a-directory');
		writeFileSync(blocked, 'not a directory');
		config.database_path = join(blocked, 'site-data.db');
		const callback = vi.fn().mockResolvedValue('still works');
		expect(await run_logged_task('example', callback)).toBe(
			'still works',
		);
		expect(callback).toHaveBeenCalledOnce();
		const error = new Error('Original failure');
		await expect(
			run_logged_task('failing', async () => {
				throw error;
			}),
		).rejects.toBe(error);
		expect(console.warn).toHaveBeenCalled();
	});

	it('does not change task results when a completion log write fails', async () => {
		vi.spyOn(TaskLogStore.prototype, 'finish').mockImplementation(
			() => {
				throw new Error('Storage failed');
			},
		);
		expect(await run_logged_task('example', async () => 42)).toBe(42);
		const error = new Error('Original error');
		await expect(
			run_logged_task('failing', async () => {
				throw error;
			}),
		).rejects.toBe(error);
	});
});
