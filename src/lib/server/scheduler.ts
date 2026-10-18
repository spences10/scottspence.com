import cron from 'node-cron';
import type { TaskKey } from '../../routes/api/ingest/tasks';
import { task_schedules, type TaskSchedule } from './task-schedules';

export function start_scheduler(
	run_task: (name: TaskKey) => Promise<unknown>,
	schedules: TaskSchedule[] = task_schedules,
) {
	for (const task of schedules) {
		if (!cron.validate(task.cron)) {
			throw new Error(
				`Invalid schedule for ${task.name}: ${task.cron}`,
			);
		}
	}

	let stopping = false;
	let pending = Promise.resolve();

	const jobs = schedules.map(({ name, cron: expression }) =>
		cron.schedule(
			expression,
			() => {
				if (stopping) return;

				// Serialise jobs to avoid concurrent writes within the worker.
				// noOverlap also skips repeats of a queued or running job.
				pending = pending.then(async () => {
					const started = Date.now();
					console.log(`[scheduler] Starting ${name}`);
					try {
						await run_task(name);
						console.log(
							`[scheduler] Completed ${name} in ${Date.now() - started}ms`,
						);
					} catch (error) {
						console.error(`[scheduler] Failed ${name}:`, error);
					}
				});
				return pending;
			},
			{ name, timezone: 'UTC', noOverlap: true },
		),
	);

	return {
		async stop() {
			stopping = true;
			await Promise.all(jobs.map((job) => job.stop()));
			await pending;
			await Promise.all(jobs.map((job) => job.destroy()));
		},
	};
}
