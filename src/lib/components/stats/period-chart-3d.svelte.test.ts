import { describe, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import PeriodChart3d from './period-chart-3d.svelte';

const dates = [9, 10, 11].map(
	(hour) =>
		new Date(`2025-01-01T${`${hour}`.padStart(2, '0')}:00:00Z`),
);
const to_points = (values: number[]) =>
	values.map((value, index) => ({ date: dates[index], value }));

const series = [
	{
		key: 'bots',
		label: 'Bots',
		colour: 'var(--color-warning)',
		points: to_points([60, 220, 90]),
	},
	{
		key: 'humans',
		label: 'Humans',
		colour: 'var(--color-success)',
		points: to_points([100, 200, 150]),
	},
];

describe('PeriodChart3d', () => {
	test('should draw a curtain for each series', async () => {
		const { container } = await render(PeriodChart3d, {
			series,
			hourly: true,
			raised: true,
			on_flat: vi.fn(),
		});

		await expect
			.poll(
				() => container.querySelectorAll('.lc-area-line').length,
				{
					timeout: 5000,
				},
			)
			.toBe(2);
	});

	test('should stay up while raised', async () => {
		const on_flat = vi.fn();
		render(PeriodChart3d, {
			series,
			hourly: true,
			raised: true,
			on_flat,
		});

		await new Promise((resolve) => setTimeout(resolve, 900));
		expect(on_flat).not.toHaveBeenCalled();
	});

	test('should report back once it has laid flat', async () => {
		const on_flat = vi.fn();
		const { rerender } = await render(PeriodChart3d, {
			series,
			hourly: true,
			raised: true,
			on_flat,
		});

		await rerender({ raised: false });

		await expect
			.poll(() => on_flat.mock.calls.length, { timeout: 5000 })
			.toBe(1);
	});
});

describe('PeriodChart3d without data', () => {
	test('should draw nothing until the series arrive', async () => {
		const { container } = await render(PeriodChart3d, {
			series: [],
			hourly: true,
			raised: true,
			on_flat: vi.fn(),
		});

		await new Promise((resolve) => setTimeout(resolve, 500));
		expect(container.querySelectorAll('.lc-area-line').length).toBe(
			0,
		);
	});
});
