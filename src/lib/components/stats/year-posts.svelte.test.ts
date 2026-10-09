import { describe, expect, test } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { page } from 'vitest/browser';
import YearPosts from './year-posts.svelte';

const post = (
	slug: string,
	title: string,
	months: Record<string, [views: number, visitors: number]>,
) => ({
	slug,
	title,
	yearly_stats: [],
	monthly_stats: Object.entries(months).map(
		([year_month, [views, unique_visitors]]) => ({
			year_month,
			views,
			unique_visitors,
		}),
	),
	all_time_stats: { views: 0, unique_visitors: 0 },
});

const site_stats = [
	post('quiet-post', 'Quiet Post', {
		'2026-01': [10, 9],
		'2026-02': [20, 18],
	}),
	post('busy-post', 'Busy Post', {
		'2026-01': [300, 40],
		'2026-02': [500, 60],
		// Last year's traffic is not this section's business
		'2025-12': [9000, 8000],
	}),
	post('old-post', 'Old Post', { '2025-11': [700, 600] }),
];

describe('YearPosts', () => {
	test('should head the section with the current year', async () => {
		render(YearPosts, { site_stats, current_year: '2026' });

		await expect
			.element(
				page.getByRole('heading', { name: 'Popular posts in 2026' }),
			)
			.toBeInTheDocument();
	});

	test('should rank this year’s posts, leaving out other years', async () => {
		render(YearPosts, { site_stats, current_year: '2026' });

		await page.getByText('View as table').click();

		// Busy Post (800 views) ranks ahead of Quiet Post (30)
		const posts = page.getByRole('rowheader');
		await expect.element(posts.nth(0)).toHaveTextContent('Busy Post');
		await expect
			.element(posts.nth(1))
			.toHaveTextContent('Quiet Post');
		await expect
			.element(page.getByRole('link', { name: 'Old Post' }))
			.not.toBeInTheDocument();
		await expect
			.element(page.getByRole('link', { name: 'Busy Post' }))
			.toHaveAttribute('href', '/posts/busy-post');
		await expect
			.element(page.getByRole('cell', { name: '800', exact: true }))
			.toBeInTheDocument();
	});

	test('should switch the totals to visitors', async () => {
		render(YearPosts, { site_stats, current_year: '2026' });

		await page.getByText('View as table').click();
		await page.getByRole('button', { name: 'Visitors' }).click();

		// Busy Post: 40 + 60 visitors
		await expect
			.element(page.getByRole('cell', { name: '100', exact: true }))
			.toBeInTheDocument();
	});

	test('should stay away when the year has too little to draw', async () => {
		render(YearPosts, { site_stats, current_year: '2027' });

		await expect
			.element(page.getByRole('heading', { name: /Popular posts/ }))
			.not.toBeInTheDocument();
	});
});
