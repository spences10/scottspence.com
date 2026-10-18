import { afterEach, expect, it, vi } from 'vitest';

vi.mock('#lib/cache/server-cache.js', () => ({
	set_cache_version_reader: vi.fn(),
	clear_cache: vi.fn(),
}));
vi.mock('#lib/sqlite/client.js', () => ({ sqlite_client: {} }));
vi.mock('../../routes/api/ingest/tasks', () => ({
	run_task: vi.fn(),
}));
vi.mock('./scheduler', () => ({ start_scheduler: vi.fn() }));
vi.mock('./task-logs', () => ({ close_task_logs: vi.fn() }));

import { clear_cache } from '#lib/cache/server-cache.js';
import { run_task } from '../../routes/api/ingest/tasks';
import { start_scheduler } from './scheduler';
import { start_worker } from './scheduler-worker';

function scheduled_runner() {
	vi.spyOn(process, 'once').mockImplementation(() => process);
	start_worker();
	return vi.mocked(start_scheduler).mock.calls[0][0];
}

function deferred() {
	let finish!: () => void;
	const promise = new Promise<void>((resolve) => {
		finish = resolve;
	});
	return { promise, finish };
}

afterEach(() => {
	vi.restoreAllMocks();
	vi.resetAllMocks();
	vi.unstubAllEnvs();
});

it.each([undefined, 'development'])(
	'starts the explicitly launched worker with NODE_ENV=%s',
	(node_env) => {
		vi.stubEnv('NODE_ENV', node_env);
		vi.stubEnv('SCHEDULER_ENABLED', undefined);
		expect(() => scheduled_runner()).not.toThrow();
		expect(start_scheduler).toHaveBeenCalledOnce();
	},
);

it.each(['standard_site', 'backup_database'] as const)(
	'runs scheduled %s without the post-refresh pipeline',
	async (name) => {
		const run_scheduled_task = scheduled_runner();
		await run_scheduled_task(name, 'scheduled-run');
		expect(run_task).toHaveBeenCalledExactlyOnceWith(
			name,
			globalThis.fetch,
			name === 'standard_site'
				? { mode: 'publish', confirm: true }
				: undefined,
			{ trigger: 'scheduled', run_id: 'scheduled-run' },
		);
		expect(clear_cache).not.toHaveBeenCalled();
	},
);

it('waits for posts, embeddings and related posts in order before clearing caches', async () => {
	const posts = deferred();
	const embeddings = deferred();
	const related = deferred();
	const steps: string[] = [];
	vi.mocked(run_task).mockImplementation((name) => {
		steps.push(name);
		if (name === 'update_posts') return posts.promise;
		if (name === 'update_embeddings') return embeddings.promise;
		return related.promise;
	});
	vi.mocked(clear_cache).mockImplementation(() => {
		steps.push('clear_cache');
	});
	const run_scheduled_task = scheduled_runner();
	const running = run_scheduled_task('update_posts', 'scheduled-run');

	expect(steps).toEqual(['update_posts']);
	posts.finish();
	await vi.waitFor(() =>
		expect(steps).toEqual(['update_posts', 'update_embeddings']),
	);
	embeddings.finish();
	await vi.waitFor(() =>
		expect(steps).toEqual([
			'update_posts',
			'update_embeddings',
			'update_related_posts',
		]),
	);
	expect(clear_cache).not.toHaveBeenCalled();
	related.finish();
	await running;

	expect(steps).toEqual([
		'update_posts',
		'update_embeddings',
		'update_related_posts',
		'clear_cache',
	]);
	expect(vi.mocked(run_task).mock.calls).toEqual([
		[
			'update_posts',
			globalThis.fetch,
			undefined,
			{ trigger: 'scheduled', run_id: 'scheduled-run' },
		],
		[
			'update_embeddings',
			globalThis.fetch,
			undefined,
			{ trigger: 'scheduled' },
		],
		[
			'update_related_posts',
			globalThis.fetch,
			undefined,
			{ trigger: 'scheduled' },
		],
	]);
});

it.each([
	'update_posts',
	'update_embeddings',
	'update_related_posts',
] as const)(
	'stops the pipeline on a rejected %s task and still clears caches',
	async (failed_task) => {
		const error = new Error('Task failed');
		vi.mocked(run_task).mockImplementation(async (name) => {
			if (name === failed_task) throw error;
		});
		const run_scheduled_task = scheduled_runner();
		await expect(
			run_scheduled_task('update_posts', 'scheduled-run'),
		).rejects.toBe(error);
		const sequence = [
			'update_posts',
			'update_embeddings',
			'update_related_posts',
		];
		expect(
			vi.mocked(run_task).mock.calls.map(([name]) => name),
		).toEqual(sequence.slice(0, sequence.indexOf(failed_task) + 1));
		expect(clear_cache).toHaveBeenCalledOnce();
	},
);
