import { spawn, type ChildProcess } from 'node:child_process';
import { once } from 'node:events';
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, describe, expect, it, vi } from 'vitest';

const start_script = fileURLToPath(
	new URL('./start.ts', import.meta.url),
);
const running: { child: ChildProcess; directory: string }[] = [];

async function start(
	scheduler_enabled: boolean,
	worker_fails = false,
	node_env = 'production',
) {
	const directory = await mkdtemp(join(tmpdir(), 'site-start-'));
	await mkdir(join(directory, 'build'));
	for (const name of ['index', 'scheduler']) {
		await writeFile(
			join(directory, 'build', `${name}.js`),
			`const timer = setInterval(() => {}, 1000);
			process.on('SIGTERM', () => {
				console.log('${name} stopped');
				clearInterval(timer);
			});
			console.log('${name} ready (' + process.pid + ')');
			${name === 'scheduler' && worker_fails ? 'process.exit(2);' : ''}`,
		);
	}

	const child = spawn(process.execPath, [start_script], {
		cwd: directory,
		env: {
			...process.env,
			NODE_ENV: node_env,
			SCHEDULER_ENABLED: String(scheduler_enabled),
		},
		stdio: ['ignore', 'pipe', 'pipe'],
	});
	running.push({ child, directory });
	let output = '';
	child.stdout?.on('data', (chunk) => (output += chunk));
	child.stderr?.on('data', (chunk) => (output += chunk));
	const exited = once(child, 'close');
	return {
		child,
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
	it('rejects an enabled scheduler outside production', async () => {
		const service = await start(true, false, 'development');
		expect(await service.exited).toEqual([1, null]);
		expect(service.output()).toContain(
			'SCHEDULER_ENABLED requires NODE_ENV=production',
		);
		expect(service.output()).not.toContain('ready');
	});

	it('starts only the web server until the scheduler is enabled', async () => {
		const service = await start(false);
		await vi.waitFor(() =>
			expect(service.output()).toContain('index ready'),
		);
		service.child.kill('SIGTERM');
		expect(await service.exited).toEqual([0, null]);
		expect(service.output()).not.toContain('scheduler ready');
		expect(service.output()).toContain('index stopped');
	});

	it('starts isolated web and scheduler processes and stops both cleanly', async () => {
		const service = await start(true);
		await vi.waitFor(() => {
			expect(service.output()).toContain('index ready');
			expect(service.output()).toContain('scheduler ready');
		});
		service.child.kill('SIGTERM');
		expect(await service.exited).toEqual([0, null]);
		expect(service.output()).toContain('index stopped');
		expect(service.output()).toContain('scheduler stopped');
	});

	it('stops the web server and exits with failure if the worker dies', async () => {
		const service = await start(true, true);
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
