import { afterEach, expect, it, vi } from 'vitest';

vi.mock('#lib/cache/server-cache.js', () => ({
	set_cache_version_reader: vi.fn(),
}));
vi.mock('#lib/sqlite/client.js', () => ({ sqlite_client: {} }));
vi.mock('../../routes/api/ingest/tasks', () => ({
	run_task: vi.fn(),
}));
vi.mock('./scheduler', () => ({ start_scheduler: vi.fn() }));
vi.mock('./task-logs', () => ({ close_task_logs: vi.fn() }));

import { start_scheduler } from './scheduler';
import { start_worker } from './scheduler-worker';

afterEach(() => {
	vi.restoreAllMocks();
	vi.clearAllMocks();
	vi.unstubAllEnvs();
});

it.each([undefined, 'development'])(
	'starts the explicitly launched worker with NODE_ENV=%s',
	(node_env) => {
		vi.stubEnv('NODE_ENV', node_env);
		vi.stubEnv('SCHEDULER_ENABLED', undefined);
		// No real signal listeners or cron timers are needed for this check.
		vi.spyOn(process, 'once').mockImplementation(() => process);

		expect(() => start_worker()).not.toThrow();
		expect(start_scheduler).toHaveBeenCalledOnce();
	},
);
