import cron from 'node-cron';
import type { TaskKey } from '../../routes/api/ingest/tasks';
import { queue_task_run, skip_task_run } from './task-logs';
import { task_schedules, type TaskSchedule } from './task-schedules';

export interface SchedulerHistory {
	queued(name: TaskKey, date: Date): string | undefined;
	skipped(name: TaskKey, date: Date, reason: string): void;
}

export function start_scheduler(
	run_task: (name: TaskKey, run_id?: string) => Promise<unknown>,
	schedules: TaskSchedule[] = task_schedules,
	history: SchedulerHistory = {
		queued: queue_task_run,
		skipped: skip_task_run,
	},
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

	const jobs = schedules.map(({ name, cron: expression }) => {
		const job = cron.schedule(
			expression,
			({ date }) => {
				if (stopping) return;
				const run_id = history.queued(name, date);
				// Serialise jobs. noOverlap skips repeats of queued or running jobs.
				pending = pending.then(async () => {
					const started = Date.now();
					console.log(`[scheduler] Starting ${name}`);
					try {
						await run_task(name, run_id);
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
		);
		job.on('execution:overlap', ({ date }) =>
			history.skipped(
				name,
				date,
				'Previous run is queued or running',
			),
		);
		job.on('execution:missed', ({ date }) =>
			history.skipped(
				name,
				date,
				'Scheduler missed the planned start',
			),
		);
		job.on('execution:skipped', ({ date }) =>
			history.skipped(
				name,
				date,
				'Scheduler skipped the planned run',
			),
		);
		return job;
	});

	return {
		async stop() {
			stopping = true;
			await Promise.all(jobs.map((job) => job.stop()));
			await pending;
			await Promise.all(jobs.map((job) => job.destroy()));
		},
	};
}
