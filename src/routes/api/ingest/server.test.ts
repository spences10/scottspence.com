import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('$app/env/private', () => ({
	INGEST_TOKEN: 'test-ingest-token',
}));
vi.mock('#lib/server/task-logs.js', () => ({
	run_logged_task: (
		_name: string,
		callback: () => Promise<unknown>,
	) => callback(),
	get_task_log_store: vi.fn(),
}));
vi.mock('./query-task-logs', async (original) => ({
	...(await original<typeof import('./query-task-logs')>()),
	query_task_logs: vi.fn(),
}));
vi.mock('./update-posts', () => ({ update_posts: vi.fn() }));
vi.mock('./index-now', () => ({ index_now: vi.fn() }));
vi.mock('./restore-database', () => ({ restore_database: vi.fn() }));
vi.mock('#lib/sqlite/client.js', () => ({
	sqlite_client: { prepare: vi.fn() },
}));
vi.mock('./standard-site', async (import_original) => ({
	...(await import_original<typeof import('./standard-site')>()),
	standard_site_sync: vi.fn(),
}));

import { sqlite_client } from '#lib/sqlite/client.js';
import { POST } from './+server';
import { index_now } from './index-now';
import { standard_site_sync } from './standard-site';
import { update_posts } from './update-posts';
import { run_task } from './tasks';
import { restore_database } from './restore-database';
import {
	query_task_logs,
	TaskLogQueryError,
} from './query-task-logs';

const fetch = vi.fn<typeof globalThis.fetch>();
const request = (
	task: string,
	data?: unknown,
	token = 'test-ingest-token',
) =>
	POST({
		request: new Request('https://example.com/api/ingest', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify({ task, data }),
		}),
		fetch,
	});

beforeEach(() => {
	vi.resetAllMocks();
});

describe('Manual ingest endpoint', () => {
	it('keeps the existing authenticated task request and response', async () => {
		vi.mocked(update_posts).mockResolvedValue({ message: 'Updated' });
		const response = await request('update_posts');
		expect(response.status).toBe(200);
		expect(await response.json()).toEqual({ message: 'Updated' });
		expect(update_posts).toHaveBeenCalledExactlyOnceWith();
	});

	it('rejects unauthorised calls before task lookup or execution', async () => {
		const response = await request(
			'update_posts',
			undefined,
			'wrong',
		);
		expect(response.status).toBe(401);
		expect(update_posts).not.toHaveBeenCalled();
		const unknown = await request('unknown', undefined, 'wrong');
		expect(unknown.status).toBe(401);
	});

	it.each(['unknown', 'constructor', '__proto__'])(
		'rejects an unknown task: %s',
		async (name) => {
			const response = await request(name);
			expect(response.status).toBe(400);
		},
	);

	it('passes the request fetch function to tasks that need it', async () => {
		vi.mocked(index_now).mockResolvedValue({
			message: 'Submitted',
			urls: [],
		});
		const response = await request('index_now');
		expect(response.status).toBe(200);
		expect(index_now).toHaveBeenCalledExactlyOnceWith(fetch);
	});

	it('uses global fetch when a worker calls the shared runner directly', async () => {
		vi.mocked(index_now).mockResolvedValue({
			message: 'Submitted',
			urls: [],
		});
		await run_task('index_now');
		expect(index_now).toHaveBeenCalledExactlyOnceWith(
			globalThis.fetch,
		);
	});

	it('validates task data and keeps validation errors as HTTP 400', async () => {
		const response = await request('run_query', { params: [] });
		expect(response.status).toBe(400);
		expect(await response.json()).toMatchObject({
			message: 'Invalid request data',
		});
		expect(sqlite_client.prepare).not.toHaveBeenCalled();
	});

	it('passes validated data to data-only tasks', async () => {
		const all = vi.fn().mockReturnValue([{ value: 42 }]);
		vi.mocked(sqlite_client.prepare).mockReturnValue({
			all,
			get: vi.fn(),
			run: vi.fn(),
		});
		const response = await request('run_query', {
			query: 'SELECT ? AS value',
			params: [42],
		});
		expect(response.status).toBe(200);
		expect(all).toHaveBeenCalledExactlyOnceWith(42);
		expect(await response.json()).toEqual({
			type: 'read',
			rows: [{ value: 42 }],
			count: 1,
		});
	});

	it('passes fetch and validated data to tasks that need both', async () => {
		vi.mocked(standard_site_sync).mockResolvedValue({
			success: true,
			mode: 'preview',
			writes_performed: 0,
			publication: 'at://example/publication/self',
			document_count: 0,
			documents: [],
		});
		const response = await request('standard_site', {
			mode: 'preview',
		});
		expect(response.status).toBe(200);
		expect(standard_site_sync).toHaveBeenCalledExactlyOnceWith(
			fetch,
			{
				mode: 'preview',
			},
		);
	});

	it('does not pass fetch as the optional restore backup filename', async () => {
		vi.mocked(restore_database).mockResolvedValue({
			message: 'Restored',
			restored_from: 'backup.db',
			database_size: '1MB',
			pre_restore_backup: 'before.db',
			available_backups: [],
		});
		const response = await request('restore_database');
		expect(response.status).toBe(200);
		expect(restore_database).toHaveBeenCalledExactlyOnceWith();
	});

	it('keeps log queries authenticated and validates their parameters', async () => {
		const denied = await request(
			'query_task_logs',
			{ query: 'SELECT 1' },
			'wrong',
		);
		expect(denied.status).toBe(401);
		expect(query_task_logs).not.toHaveBeenCalled();
		const invalid = await request('query_task_logs', { query: '' });
		expect(invalid.status).toBe(400);
		vi.mocked(query_task_logs).mockResolvedValue({
			rows: [{ count: 1 }],
			count: 1,
			truncated: false,
			max_rows: 200,
		});
		const response = await request('query_task_logs', {
			query: 'SELECT count(*) FROM task_runs',
		});
		expect(response.status).toBe(200);
		expect(query_task_logs).toHaveBeenCalledExactlyOnceWith({
			query: 'SELECT count(*) FROM task_runs',
			params: [],
		});
	});

	it('returns a client error for a rejected log query', async () => {
		vi.mocked(query_task_logs).mockRejectedValue(
			new TaskLogQueryError('Read-only queries only'),
		);
		const response = await request('query_task_logs', {
			query: 'DELETE FROM task_runs',
		});
		expect(response.status).toBe(400);
		expect(await response.json()).toEqual({
			message: 'Read-only queries only',
		});
	});

	it('keeps task failures as HTTP 500', async () => {
		vi.mocked(update_posts).mockRejectedValue(
			new Error('Task failed'),
		);
		const response = await request('update_posts');
		expect(response.status).toBe(500);
		expect(await response.json()).toEqual({
			message: 'Error executing task update_posts',
			error: 'Task failed',
		});
	});
});
