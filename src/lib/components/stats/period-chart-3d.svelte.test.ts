import { describe, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import PeriodChart3d from './period-chart-3d.svelte';

const points = [
	{
		date: new Date('2025-01-01T09:00:00Z'),
		views: 100,
		visitors: 70,
	},
	{
		date: new Date('2025-01-01T10:00:00Z'),
		views: 200,
		visitors: 130,
	},
	{
		date: new Date('2025-01-01T11:00:00Z'),
		views: 150,
		visitors: 90,
	},
];

describe('PeriodChart3d', () => {
	test('should draw a curtain for views and for visitors', async () => {
		const { container } = await render(PeriodChart3d, {
			points,
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
			points,
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
			points,
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
