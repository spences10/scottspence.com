import {
	clear_cache,
	set_cache_version_reader,
} from '#lib/cache/server-cache.js';
import { sqlite_client } from '#lib/sqlite/client.js';
import {
	run_task,
	type TaskKey,
} from '../../routes/api/ingest/tasks';
import { start_scheduler } from './scheduler';
import { close_task_logs } from './task-logs';

interface ScheduledTaskConfig {
	data?: unknown;
	after?: TaskKey[];
	cleanup?: () => void;
}

const scheduled_task_config: Partial<
	Record<TaskKey, ScheduledTaskConfig>
> = {
	standard_site: { data: { mode: 'publish', confirm: true } },
	update_posts: {
		after: ['update_embeddings', 'update_related_posts'],
		cleanup: clear_cache,
	},
};

export function start_worker() {
	// Each process has its own connection and cache. Notice writes made
	// by the other process without invalidating on this connection's writes.
	set_cache_version_reader(
		() =>
			sqlite_client.prepare('PRAGMA data_version').get()
				?.data_version,
	);

	const scheduler = start_scheduler(async (name, run_id) => {
		const config = scheduled_task_config[name];
		try {
			const result = await run_task(
				name,
				globalThis.fetch,
				config?.data,
				{ trigger: 'scheduled', run_id },
			);
			for (const task of config?.after ?? []) {
				await run_task(task, globalThis.fetch, undefined, {
					trigger: 'scheduled',
				});
			}
			return result;
		} finally {
			config?.cleanup?.();
		}
	});
	let stopping = false;

	const shutdown = async () => {
		if (stopping) return;
		stopping = true;
		console.log('[scheduler] Stopping; waiting for queued tasks');
		try {
			await scheduler.stop();
		} catch (error) {
			console.error('[scheduler] Shutdown failed:', error);
			process.exitCode = 1;
		} finally {
			sqlite_client.close();
			close_task_logs();
		}
	};

	process.once('SIGTERM', shutdown);
	process.once('SIGINT', shutdown);
	console.log('[scheduler] Started (UTC)');
}
