import cron from 'node-cron';
import {
	afterEach,
	beforeEach,
	describe,
	expect,
	it,
	vi,
} from 'vitest';
import { start_scheduler } from './scheduler';
import { task_schedules } from './task-schedules';

let scheduler: ReturnType<typeof start_scheduler> | undefined;
const completions: (() => void)[] = [];

function deferred() {
	let finish!: () => void;
	const promise = new Promise<void>((resolve) => {
		finish = resolve;
	});
	completions.push(finish);
	return { promise, finish };
}

beforeEach(() => {
	vi.useFakeTimers();
	vi.setSystemTime(new Date('2026-10-18T00:00:00Z'));
	vi.spyOn(console, 'log').mockImplementation(() => {});
	vi.spyOn(console, 'error').mockImplementation(() => {});
	vi.spyOn(console, 'warn').mockImplementation(() => {});
});

afterEach(async () => {
	for (const finish of completions.splice(0)) finish();
	await scheduler?.stop();
	scheduler = undefined;
	vi.useRealTimers();
	vi.restoreAllMocks();
});

describe('Scheduled tasks', () => {
	it('runs at the scheduled time, not on startup, without HTTP', async () => {
		const run_task = vi.fn().mockResolvedValue(undefined);
		const fetch = vi.spyOn(globalThis, 'fetch');
		scheduler = start_scheduler(run_task, [
			{ name: 'update_posts', cron: '* * * * *' },
		]);

		expect(run_task).not.toHaveBeenCalled();
		await vi.advanceTimersByTimeAsync(60_010);
		expect(run_task).toHaveBeenCalledExactlyOnceWith('update_posts');
		expect(fetch).not.toHaveBeenCalled();
	});

	it('skips repeat runs while a task is running', async () => {
		const work = deferred();
		const run_task = vi.fn().mockReturnValue(work.promise);
		scheduler = start_scheduler(run_task, [
			{ name: 'update_posts', cron: '* * * * *' },
		]);

		await vi.advanceTimersByTimeAsync(180_010);
		expect(run_task).toHaveBeenCalledTimes(1);
		work.finish();
		await vi.advanceTimersByTimeAsync(60_000);
		expect(run_task).toHaveBeenCalledTimes(2);
	});

	it('queues simultaneous tasks rather than running them together', async () => {
		const work = deferred();
		const run_task = vi
			.fn()
			.mockReturnValueOnce(work.promise)
			.mockResolvedValue(undefined);
		scheduler = start_scheduler(run_task, [
			{ name: 'update_posts', cron: '* * * * *' },
			{ name: 'backup_database', cron: '* * * * *' },
		]);

		await vi.advanceTimersByTimeAsync(120_010);
		expect(run_task).toHaveBeenCalledTimes(1);
		work.finish();
		await vi.advanceTimersByTimeAsync(1);
		expect(run_task.mock.calls).toEqual([
			['update_posts'],
			['backup_database'],
		]);
	});

	it('reports a failure and continues with later tasks and runs', async () => {
		const run_task = vi
			.fn()
			.mockRejectedValueOnce(new Error('Task failed'))
			.mockResolvedValue(undefined);
		scheduler = start_scheduler(run_task, [
			{ name: 'update_posts', cron: '* * * * *' },
			{ name: 'backup_database', cron: '* * * * *' },
		]);

		await vi.advanceTimersByTimeAsync(120_010);
		expect(run_task).toHaveBeenCalledTimes(4);
		expect(console.error).toHaveBeenCalledWith(
			'[scheduler] Failed update_posts:',
			expect.any(Error),
		);
	});

	it('stops new runs and waits for queued work before shutdown', async () => {
		const work = deferred();
		const run_task = vi.fn().mockReturnValue(work.promise);
		scheduler = start_scheduler(run_task, [
			{ name: 'update_posts', cron: '* * * * *' },
		]);
		await vi.advanceTimersByTimeAsync(60_010);
		const stopped = vi.fn();
		const stopping = scheduler.stop().then(stopped);
		await vi.advanceTimersByTimeAsync(120_000);
		expect(stopped).not.toHaveBeenCalled();
		expect(run_task).toHaveBeenCalledTimes(1);
		work.finish();
		await stopping;
		expect(stopped).toHaveBeenCalledOnce();
		expect(cron.getTasks().size).toBe(0);
	});

	it('rejects invalid cron expressions before registering any jobs', () => {
		expect(() =>
			start_scheduler(vi.fn(), [
				{ name: 'update_posts', cron: '* * * * *' },
				{ name: 'backup_database', cron: 'not a cron' },
			]),
		).toThrow('Invalid schedule for backup_database');
		expect(cron.getTasks().size).toBe(0);
	});

	it('uses the nine production schedules in UTC', () => {
		scheduler = start_scheduler(vi.fn());
		const jobs = [...cron.getTasks().values()];
		expect(jobs).toHaveLength(9);
		expect(
			task_schedules.map(({ name, cron }) => [name, cron]),
		).toEqual([
			['update_posts', '0 * * * *'],
			['update_embeddings', '0 0 * * 0'],
			['update_related_posts', '0 0 * * 0'],
			['backup_database', '0 */6 * * *'],
			['index_now', '0 0 * * *'],
			['send_newsletter_reminder', '0 9 28 * *'],
			['daily_github_activity', '0 2 * * *'],
			['rollup_analytics', '5 3 * * *'],
			['cleanup_analytics', '15 3 * * *'],
		]);
		expect(
			jobs
				.find((job) => job.name === 'rollup_analytics')
				?.getNextRun(),
		).toEqual(new Date('2026-10-18T03:05:00Z'));
	});
});
