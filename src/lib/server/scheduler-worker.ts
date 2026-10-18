import { set_cache_version_reader } from '#lib/cache/server-cache.js';
import { sqlite_client } from '#lib/sqlite/client.js';
import { run_task } from '../../routes/api/ingest/tasks';
import { start_scheduler } from './scheduler';
import { close_task_logs } from './task-logs';

export function start_worker() {
	// Each process has its own connection and cache. Notice writes made
	// by the other process without invalidating on this connection's writes.
	set_cache_version_reader(
		() =>
			sqlite_client.prepare('PRAGMA data_version').get()
				?.data_version,
	);

	const scheduler = start_scheduler((name, run_id) =>
		run_task(
			name,
			globalThis.fetch,
			name === 'standard_site'
				? { mode: 'publish', confirm: true }
				: undefined,
			{ trigger: 'scheduled', run_id },
		),
	);
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
