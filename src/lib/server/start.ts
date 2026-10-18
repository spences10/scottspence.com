import { fork, type ChildProcess } from 'node:child_process';
import process from 'node:process';
import { clearTimeout, setTimeout } from 'node:timers';
import { interrupt_task_log_owner } from '../sqlite/task-logs.ts';

const entries = ['./build/index.js', './build/scheduler.js'];

const children = new Set<ChildProcess>();
let stopping = false;
let shutdown_timer: NodeJS.Timeout | undefined;

const stop = (
	exit_code: number,
	signal: NodeJS.Signals = 'SIGTERM',
) => {
	if (stopping) return;
	stopping = true;
	process.exitCode = exit_code;
	for (const child of children) child.kill(signal);
	shutdown_timer = setTimeout(() => {
		process.exitCode = 1;
		for (const child of children) child.kill('SIGKILL');
	}, 30_000);
	shutdown_timer.unref();
};

process.once('SIGTERM', () => stop(0));
process.once('SIGINT', () => stop(0, 'SIGINT'));

for (const entry of entries) {
	const child = fork(entry, [], { stdio: 'inherit' });
	children.add(child);
	let log_owner: { filename: string; owner_id: string } | undefined;
	child.on('message', (message: unknown) => {
		if (
			message &&
			typeof message === 'object' &&
			'type' in message &&
			message.type === 'task-logs:ready' &&
			'filename' in message &&
			typeof message.filename === 'string' &&
			'owner_id' in message &&
			typeof message.owner_id === 'string'
		)
			log_owner = {
				filename: message.filename,
				owner_id: message.owner_id,
			};
	});
	child.once('error', (error) => {
		console.error(`[start] Could not start ${entry}:`, error);
		stop(1);
	});
	child.once('close', (code, signal) => {
		if (log_owner) {
			try {
				interrupt_task_log_owner(
					log_owner.filename,
					log_owner.owner_id,
				);
			} catch {
				console.warn(
					'[task logs] Could not mark unfinished tasks as interrupted',
				);
			}
		}
		children.delete(child);
		if (!stopping) {
			console.error(
				`[start] ${entry} exited (${signal ?? code}); stopping services`,
			);
			stop(code || 1);
		}
		if (children.size === 0) clearTimeout(shutdown_timer);
	});
}
