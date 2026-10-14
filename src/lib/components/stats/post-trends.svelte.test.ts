import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { page } from 'vitest/browser';
import PostTrends from './post-trends.svelte';

const launch = (overrides: Partial<PostLaunch> = {}): PostLaunch => ({
	cumulative: [100, 300, 450, null, null],
	median: [50, 100, 150, 200, 250],
	days_live: 3,
	day: 2,
	rank: 2,
	cohort_size: 23,
	...overrides,
});

describe('PostTrends', () => {
	it('summarises a young launch against the cohort', async () => {
		await render(PostTrends, { launch: launch() });

		await expect
			.element(page.getByText(/450 views in its 3 days so far/))
			.toBeInTheDocument();
		await expect
			.element(page.getByText(/2nd of 23 posts launched/))
			.toBeInTheDocument();
		await expect
			.element(page.getByText(/where the median is 150/))
			.toBeInTheDocument();
		await expect
			.element(page.getByTestId('launch-chart'))
			.toBeInTheDocument();
	});

	it('describes a full launch window', async () => {
		await render(PostTrends, {
			launch: launch({
				cumulative: [10, 20, 30],
				median: [5, 10, 15],
				days_live: 40,
				rank: 1,
			}),
		});

		await expect
			.element(page.getByText(/30 views in its first 3 days/))
			.toBeInTheDocument();
		await expect
			.element(page.getByText(/1st of 23/))
			.toBeInTheDocument();
	});

	it('flags the tracking change on monthly views that span it', async () => {
		await render(PostTrends, {
			history: [
				{ month: '2025-11', views: 4000, visitors: 2000 },
				{ month: '2025-12', views: 5000, visitors: 2500 },
				{ month: '2026-01', views: 9000, visitors: 7000 },
			],
		});

		await expect
			.element(page.getByTestId('monthly-chart'))
			.toBeInTheDocument();
		await expect
			.element(page.getByText(/Tracking changed in January 2026/))
			.toBeInTheDocument();
		await expect
			.element(page.getByText('New tracking'))
			.toBeInTheDocument();
	});

	it('shows reactions with the per-view rate', async () => {
		await render(PostTrends, {
			reactions: {
				total: 136,
				by_type: { likes: 120, poops: 16 },
				per_1k_views: 1.36,
				site_per_1k_views: 0.9,
			},
		});

		await expect
			.element(page.getByText(/1\.4 reactions per 1,000 views/))
			.toBeInTheDocument();
		await expect
			.element(page.getByText(/site average 0\.9/))
			.toBeInTheDocument();
	});

	it('renders nothing with under three complete months', async () => {
		const { container } = await render(PostTrends, {
			history: [
				{ month: '2026-01', views: 10, visitors: 8 },
				{ month: '2026-02', views: 12, visitors: 9 },
			],
		});
		expect(container.querySelector('section')).toBeNull();
	});
});
