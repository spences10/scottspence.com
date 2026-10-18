import { spawn, type ChildProcess } from 'node:child_process';
import { once } from 'node:events';
import {
	copyFile,
	mkdtemp,
	mkdir,
	rm,
	writeFile,
} from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { DatabaseSync } from 'node:sqlite';
import { afterEach, describe, expect, it, vi } from 'vitest';

const start_script = fileURLToPath(
	new URL('./start.ts', import.meta.url),
);
const running: { child: ChildProcess; directory: string }[] = [];

async function start(worker_fails = false, log_crash = false) {
	const directory = await mkdtemp(join(tmpdir(), 'site-start-'));
	await mkdir(join(directory, 'build'));
	if (log_crash) {
		await mkdir(join(directory, 'src/lib/sqlite'), {
			recursive: true,
		});
		await copyFile(
			fileURLToPath(
				new URL('../sqlite/task-logs.sql', import.meta.url),
			),
			join(directory, 'src/lib/sqlite/task-logs.sql'),
		);
	}
	for (const name of ['index', 'scheduler']) {
		await writeFile(
			join(directory, 'build', `${name}.js`),
			`const timer = setInterval(() => {}, 1000);
			process.on('SIGTERM', () => {
				console.log('${name} stopped');
				clearInterval(timer);
			});
			console.log('${name} ready (' + process.pid + ')');
			${
				name === 'scheduler' && log_crash
					? `(async () => {
				const { TaskLogStore } = await import(${JSON.stringify(new URL('../sqlite/task-logs.ts', import.meta.url).href)});
				const store = new TaskLogStore(${JSON.stringify(join(directory, 'task-logs.db'))}, 'fixture');
				const id = store.queue('unfinished', 'scheduled');
				store.start(id);
				process.send({ type: 'task-logs:ready', filename: store.filename, owner_id: store.owner_id }, () => process.exit(2));
			})();`
					: name === 'scheduler' && worker_fails
						? 'process.exit(2);'
						: ''
			}`,
		);
	}

	const env = { ...process.env };
	delete env.NODE_ENV;
	delete env.SCHEDULER_ENABLED;
	const child = spawn(process.execPath, [start_script], {
		cwd: directory,
		env,
		stdio: ['ignore', 'pipe', 'pipe'],
	});
	running.push({ child, directory });
	let output = '';
	child.stdout?.on('data', (chunk) => (output += chunk));
	child.stderr?.on('data', (chunk) => (output += chunk));
	const exited = once(child, 'close');
	return {
		child,
		directory,
		exited,
		output: () => output,
		pids: () =>
			[...output.matchAll(/ready \((\d+)\)/g)].map((match) =>
				Number(match[1]),
			),
	};
}

afterEach(async () => {
	for (const { child, directory } of running.splice(0)) {
		if (child.exitCode === null && child.signalCode === null) {
			child.kill('SIGTERM');
			await once(child, 'exit');
		}
		await rm(directory, { recursive: true, force: true });
	}
});

describe('Production service startup', () => {
	it('starts web and scheduler without environment flags and stops both cleanly', async () => {
		const service = await start();
		await vi.waitFor(() => {
			expect(service.output()).toContain('index ready');
			expect(service.output()).toContain('scheduler ready');
		});
		service.child.kill('SIGTERM');
		expect(await service.exited).toEqual([0, null]);
		expect(service.output()).toContain('index stopped');
		expect(service.output()).toContain('scheduler stopped');
	});

	it('marks unfinished task history after the owning worker exits', async () => {
		const service = await start(false, true);
		expect(await service.exited).toEqual([2, null]);
		const db = new DatabaseSync(
			join(service.directory, 'task-logs.db'),
			{ readOnly: true },
		);
		try {
			expect(
				db.prepare('SELECT status FROM task_runs').get(),
			).toEqual({ status: 'interrupted' });
			expect(
				db
					.prepare(
						"SELECT count(*) AS count FROM task_events WHERE level = 'error'",
					)
					.get(),
			).toEqual({ count: 1 });
		} finally {
			db.close();
		}
	});

	it('stops the web server and exits with failure if the worker dies', async () => {
		const service = await start(true);
		expect(await service.exited).toEqual([2, null]);
		expect(service.output()).toContain('stopping services');
		expect(service.pids().length).toBeGreaterThan(0);
		// The web process may die before it installs its signal handler.
		// Verify child termination, not whether its final log was flushed.
		for (const pid of service.pids()) {
			expect(() => process.kill(pid, 0)).toThrow(
				expect.objectContaining({ code: 'ESRCH' }),
			);
		}
	});
});
