import { beforeEach, describe, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { page } from 'vitest/browser';
import StatsPage from './+page.svelte';

// Mock the icons
vi.mock('#lib/icons/index.js', () => ({
	InformationCircle: () => 'div', // Simple mock component
}));

// Mock remote functions to prevent hanging network calls
vi.mock('#lib/analytics/live-analytics.remote.js', () => ({
	get_live_stats_breakdown: vi.fn(() =>
		Object.assign(
			Promise.resolve({
				active_visitors: 0,
				recent_visitors: 0,
				active_pages: [],
				countries: [],
				countries_total: 0,
				browsers: [],
				devices: [],
				referrers: [],
				top_paths: [],
				paths_total: 0,
			}),
			{ refresh: vi.fn().mockResolvedValue(undefined) },
		),
	),
}));

vi.mock('#lib/analytics/period-stats.remote.js', () => ({
	get_period_stats: vi.fn().mockResolvedValue(null),
}));

vi.mock('#lib/analytics/chart-data.remote.js', () => ({
	get_chart_data: vi.fn().mockResolvedValue(null),
}));

vi.mock('#lib/analytics/engagement-stats.remote.js', () => ({
	get_engagement_stats: vi.fn().mockResolvedValue(null),
}));

describe('Historical Stats Page Component', () => {
	const mockSiteStats = [
		{
			slug: 'test-post-1',
			title: 'Test Post 1',
			yearly_stats: [
				{ year: '2024', views: 500, unique_visitors: 200 },
				{ year: '2023', views: 300, unique_visitors: 150 },
				{ year: '2022', views: 200, unique_visitors: 100 },
			],
			monthly_stats: [
				{ year_month: '2024-12', views: 100, unique_visitors: 50 },
				{ year_month: '2024-11', views: 150, unique_visitors: 75 },
				{ year_month: '2023-12', views: 80, unique_visitors: 40 },
			],
			all_time_stats: { views: 1000, unique_visitors: 400 },
		},
		{
			slug: 'test-post-2',
			title: 'Test Post 2',
			yearly_stats: [
				{ year: '2024', views: 300, unique_visitors: 120 },
				{ year: '2023', views: 250, unique_visitors: 100 },
				{ year: '2022', views: 180, unique_visitors: 80 },
			],
			monthly_stats: [
				{ year_month: '2024-12', views: 80, unique_visitors: 30 },
				{ year_month: '2024-11', views: 120, unique_visitors: 50 },
				{ year_month: '2023-12', views: 60, unique_visitors: 25 },
			],
			all_time_stats: { views: 730, unique_visitors: 300 },
		},
	];

	const mockData = {
		site_stats: mockSiteStats,
		current_year: '2025',
		current_month: '2025-01',
		popular_posts: {
			popular_posts_daily: [],
			popular_posts_monthly: [],
			popular_posts_yearly: [],
		},
	};

	beforeEach(() => {
		vi.clearAllMocks();
	});

	// The section's text as read, with markup whitespace collapsed
	const historical_text = () =>
		page
			.getByRole('region', { name: 'Historical' })
			.element()
			.textContent?.replace(/\s+/g, ' ');

	describe('Initial Rendering', () => {
		test('should render page title', async () => {
			render(StatsPage, { data: mockData });

			const title = page.getByRole('heading', { level: 1 });
			await expect.element(title).toHaveTextContent('Site Stats');
		});

		test('should render the historical section', async () => {
			render(StatsPage, { data: mockData });

			await expect
				.element(page.getByRole('heading', { name: 'Historical' }))
				.toBeInTheDocument();
		});

		test('should start on every historical year', async () => {
			render(StatsPage, { data: mockData });

			await expect
				.element(page.getByRole('button', { name: 'All years' }))
				.toHaveAttribute('aria-pressed', 'true');
			await expect
				.poll(historical_text)
				.toContain('Showing 2023–2024.');
		});
	});

	describe('Period Selection', () => {
		test('should exclude the current year from the year buttons', async () => {
			render(StatsPage, { data: mockData });

			const years = page.getByRole('group', { name: 'Year' });
			await expect
				.element(years.getByRole('button', { name: '2024' }))
				.toBeInTheDocument();
			await expect
				.element(years.getByRole('button', { name: '2023' }))
				.toBeInTheDocument();
			await expect
				.element(
					years.getByRole('button', { name: mockData.current_year }),
				)
				.not.toBeInTheDocument();
		});

		test('should only offer months once a year is selected', async () => {
			render(StatsPage, { data: mockData });

			const month_select = page.getByLabelText('Month');
			await expect.element(month_select).toBeDisabled();

			await page.getByRole('button', { name: '2024' }).click();

			await expect.element(month_select).toBeEnabled();
			await expect
				.element(page.getByRole('option', { name: 'Nov' }))
				.toBeInTheDocument();
			await expect
				.element(page.getByRole('option', { name: 'Dec' }))
				.toBeInTheDocument();
			await expect
				.element(page.getByRole('option', { name: 'Jan' }))
				.not.toBeInTheDocument();
		});

		test('should compare a year with the year before', async () => {
			render(StatsPage, { data: mockData });

			await page.getByRole('button', { name: '2024' }).click();

			await expect
				.poll(historical_text)
				.toContain('Showing 2024, compared with 2023.');
		});

		test('should narrow to a month and reset it on a new year', async () => {
			render(StatsPage, { data: mockData });

			await page.getByRole('button', { name: '2024' }).click();
			await page.getByLabelText('Month').selectOptions('Dec');

			await expect
				.poll(historical_text)
				.toContain('Showing Dec 2024, compared with Nov 2024.');

			await page.getByRole('button', { name: '2023' }).click();

			await expect.poll(historical_text).toContain('Showing 2023.');
		});
	});

	describe('Data Filtering and Display', () => {
		test('should total every historical month by default', async () => {
			render(StatsPage, { data: mockData });

			const summary = page.getByRole('region', {
				name: 'Historical',
			});
			// 330 + 260 views, 165 + 105 visitors
			await expect
				.element(summary.getByText('590', { exact: true }).first())
				.toBeInTheDocument();
			await expect
				.element(summary.getByText('270', { exact: true }).first())
				.toBeInTheDocument();
		});

		test('should rank posts with links for the selected period', async () => {
			render(StatsPage, { data: mockData });

			await page.getByRole('button', { name: '2024' }).click();

			const posts = page.getByRole('list').last();
			await expect
				.element(posts.getByRole('link', { name: 'Test Post 1' }))
				.toHaveAttribute('href', '/posts/test-post-1');
			await expect
				.element(posts.getByRole('link', { name: 'Test Post 2' }))
				.toHaveAttribute('href', '/posts/test-post-2');
			// Test Post 1: 250 views in 2024; Test Post 2: 200
			await expect
				.poll(historical_text)
				.toContain('1 Test Post 1 +85 125 +170 250');
			await expect
				.poll(historical_text)
				.toContain('2 Test Post 2 +55 80 +140 200');
		});

		test('should update the totals when the year changes', async () => {
			render(StatsPage, { data: mockData });

			const summary = page.getByRole('region', {
				name: 'Historical',
			});
			await page.getByRole('button', { name: '2023' }).click();

			// 80 + 60 views in 2023
			await expect
				.element(summary.getByText('140', { exact: true }).first())
				.toBeInTheDocument();
		});
	});

	describe('Edge Cases', () => {
		test('should handle empty stats data gracefully', async () => {
			const emptyData = {
				site_stats: [],
				current_year: '2025',
				current_month: '2025-01',
				popular_posts: {
					popular_posts_daily: [],
					popular_posts_monthly: [],
					popular_posts_yearly: [],
				},
			};

			render(StatsPage, { data: emptyData });

			const noDataMessage = page.getByText(
				'No stats data available yet.',
			);
			await expect.element(noDataMessage).toBeInTheDocument();
		});

		test('should handle error state', async () => {
			const errorData = {
				site_stats: [],
				current_year: '2025',
				current_month: '2025-01',
				error: 'Failed to load data',
				popular_posts: {
					popular_posts_daily: [],
					popular_posts_monthly: [],
					popular_posts_yearly: [],
				},
			};

			render(StatsPage, { data: errorData });

			const errorMessage = page.getByText('Failed to load data');
			await expect.element(errorMessage).toBeInTheDocument();
		});
	});

	describe('Accessibility', () => {
		test('should label the period controls', async () => {
			render(StatsPage, { data: mockData });

			await expect
				.element(page.getByRole('group', { name: 'Year' }))
				.toBeInTheDocument();
			await expect
				.element(page.getByRole('group', { name: 'Metric' }))
				.toBeInTheDocument();
			await expect
				.element(page.getByLabelText('Month'))
				.toBeInTheDocument();
		});

		test('should offer the monthly chart as a table', async () => {
			render(StatsPage, { data: mockData });

			await page.getByText('View as table').click();

			const table = page.getByRole('table', {
				name: 'Views by month and year',
			});
			await expect.element(table).toBeInTheDocument();
			await expect
				.element(table.getByRole('rowheader', { name: '2024' }))
				.toBeInTheDocument();
			// December 2024: 100 + 80 views
			await expect
				.element(table.getByRole('cell', { name: '180' }))
				.toBeInTheDocument();
		});
	});
});
