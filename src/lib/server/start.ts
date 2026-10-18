import { fork, type ChildProcess } from 'node:child_process';
import process from 'node:process';
import { clearTimeout, setTimeout } from 'node:timers';

const scheduler_enabled = process.env.SCHEDULER_ENABLED === 'true';
if (scheduler_enabled && process.env.NODE_ENV !== 'production') {
	throw new Error('SCHEDULER_ENABLED requires NODE_ENV=production');
}

const entries = ['./build/index.js'];
if (scheduler_enabled) entries.push('./build/scheduler.js');

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
	child.once('error', (error) => {
		console.error(`[start] Could not start ${entry}:`, error);
		stop(1);
	});
	child.once('exit', (code, signal) => {
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
