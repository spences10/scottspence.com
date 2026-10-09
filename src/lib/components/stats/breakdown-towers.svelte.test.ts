import { describe, expect, test } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { page } from 'vitest/browser';
import BreakdownTowers from './breakdown-towers.svelte';

const rows = [
	{ label: 'GB', visitors: 120, views: 200 },
	{ label: 'US', visitors: 80, views: 100 },
];

describe('BreakdownTowers', () => {
	test('should title the chart and key both series', async () => {
		render(BreakdownTowers, { title: 'Countries', rows });

		await expect
			.element(page.getByRole('heading', { name: 'Countries' }))
			.toBeInTheDocument();
		await expect
			.element(page.getByText('Visitors', { exact: true }))
			.toBeInTheDocument();
		await expect
			.element(page.getByText('Views', { exact: true }))
			.toBeInTheDocument();
	});

	test('should offer view controls that need no dragging', async () => {
		render(BreakdownTowers, { title: 'Countries', rows });

		const controls = page.getByRole('group', {
			name: 'countries chart view',
		});
		for (const name of [
			'Turn countries chart left',
			'Turn countries chart right',
			'Reset countries chart view',
		]) {
			await expect
				.element(controls.getByRole('button', { name }))
				.toBeInTheDocument();
		}
	});

	test('should stand a tower up for each row and series', async () => {
		const { container } = await render(BreakdownTowers, {
			title: 'Countries',
			rows,
		});

		await expect
			.poll(() => container.querySelectorAll('.lc-rect-box').length, {
				timeout: 5000,
			})
			.toBe(rows.length * 2);
		// The category labels sit along the floor
		await expect.element(page.getByText('GB')).toBeInTheDocument();
		await expect.element(page.getByText('US')).toBeInTheDocument();
	});
});
