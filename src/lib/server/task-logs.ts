import { version } from '$app/env';
import * as private_env from '$app/env/private';
import { dirname, join } from 'node:path';
import {
	TaskLogStore,
	type TaskLogDetails,
	type TaskTrigger,
} from '../sqlite/task-logs';
import { task_log_context } from './task-log-context';

let store: TaskLogStore | undefined;

export function get_task_log_store() {
	if (!store) {
		const secrets = Object.entries({ ...process.env, ...private_env })
			.filter(
				([key, value]) =>
					/TOKEN|SECRET|PASSWORD|PASSPHRASE|KEY|SALT|CREDENTIAL/i.test(
						key,
					) && typeof value === 'string',
			)
			.map(([, value]) => value as string);
		const filename = join(
			dirname(
				private_env.DATABASE_PATH ||
					join(process.cwd(), 'data', 'site-data.db'),
			),
			'task-logs.db',
		);
		store = new TaskLogStore(filename, version, secrets);
		// The supervisor can mark unfinished runs only after this owner exits.
		if (process.connected) {
			process.send?.(
				{
					type: 'task-logs:ready',
					filename,
					owner_id: store.owner_id,
				},
				() => {},
			);
		}
	}
	return store;
}

export function close_task_logs() {
	store?.close();
	store = undefined;
}

function write_log<T>(callback: () => T): T | undefined {
	try {
		return callback();
	} catch {
		// A logging failure must never change a task's result or prevent it running.
		console.warn('[task logs] Could not write task history');
		return undefined;
	}
}

export function queue_task_run(name: string, date: Date) {
	return write_log(() =>
		get_task_log_store().queue(name, 'scheduled', date.getTime()),
	);
}

export function skip_task_run(
	name: string,
	date: Date,
	reason: string,
) {
	write_log(() =>
		get_task_log_store().skip(name, date.getTime(), reason),
	);
}

export interface TaskRunOptions {
	trigger?: TaskTrigger;
	run_id?: string;
}

function result_counts(result: unknown): TaskLogDetails | undefined {
	if (!result || typeof result !== 'object') return;
	return Object.fromEntries(
		Object.entries(result).filter(
			([, value]) =>
				typeof value === 'boolean' ||
				(typeof value === 'number' && Number.isFinite(value)),
		),
	);
}

export async function run_logged_task<T>(
	name: string,
	callback: () => Promise<T>,
	options: TaskRunOptions = {},
): Promise<T> {
	const log_store = write_log(get_task_log_store);
	const run_id =
		options.run_id ??
		(log_store &&
			write_log(() =>
				log_store.queue(name, options.trigger ?? 'manual'),
			));
	if (log_store && run_id) write_log(() => log_store.start(run_id));
	return task_log_context.run(
		log_store && run_id ? { store: log_store, run_id } : undefined,
		async () => {
			try {
				const result = await callback();
				if (log_store && run_id)
					write_log(() =>
						log_store.finish(
							run_id,
							'succeeded',
							undefined,
							result_counts(result),
						),
					);
				return result;
			} catch (error) {
				if (log_store && run_id)
					write_log(() => log_store.finish(run_id, 'failed', error));
				throw error;
			}
		},
	);
}
