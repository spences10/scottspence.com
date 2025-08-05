import { page } from '@vitest/browser/context'
import { flushSync } from 'svelte'
import {
	afterEach,
	beforeEach,
	describe,
	expect,
	test,
	vi,
} from 'vitest'
import { render } from 'vitest-browser-svelte'
import StatsPage from './+page.svelte'

// Mock the icons
vi.mock('$lib/icons', () => ({
	InformationCircle: () => 'div', // Simple mock component
}))

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
	]

	const mockData = {
		site_stats: mockSiteStats,
		current_year: '2025',
		current_month: '2025-01',
		popular_posts: {
			popular_posts_daily: [],
			popular_posts_monthly: [],
			popular_posts_yearly: [],
		},
	}

	beforeEach(() => {
		vi.clearAllMocks()
	})

	describe('Initial Rendering', () => {
		test('should render page title and description', async () => {
			render(StatsPage, { data: mockData })

			const title = page.getByRole('heading', { level: 1 })
			await expect
				.element(title)
				.toHaveTextContent('Historical Site Statistics')

			const description = page.getByText(
				'This page shows historical analytics data for posts from previous years.',
			)
			await expect.element(description).toBeInTheDocument()
		})

		test('should render info alert about current year data', async () => {
			render(StatsPage, { data: mockData })

			const alertHeading = page.getByRole('heading', { name: 'Looking for current year data?' })
			await expect
				.element(alertHeading)
				.toHaveTextContent('Looking for current year data?')

			const alertText = page.getByText(
				'Visit any post and click the "✨ View the stats for this post ✨" button',
			)
			await expect.element(alertText).toBeInTheDocument()
		})

		test('should render period selection dropdown', async () => {
			render(StatsPage, { data: mockData })

			const periodSelect = page.getByLabelText('Select time period:')
			await expect.element(periodSelect).toBeInTheDocument()

			// Check all period options are present
			await expect
				.element(page.getByText('All Time'))
				.toBeInTheDocument()
			await expect
				.element(page.getByText('Yearly'))
				.toBeInTheDocument()
			await expect
				.element(page.getByText('Monthly'))
				.toBeInTheDocument()
		})
	})

	describe('Date Range Display', () => {
		test('should show correct date range for all-time period', async () => {
			render(StatsPage, { data: mockData })

			// Select all-time period
			const periodSelect = page.getByLabelText('Select time period:')
			await periodSelect.selectOptions('all_time')
			flushSync()

			// Should show the range from earliest to latest year
			const dateRange = page.getByText('2024 - 2022')
			await expect.element(dateRange).toBeInTheDocument()
		})

		test('should show year for yearly period', async () => {
			render(StatsPage, { data: mockData })

			// Select yearly period
			const periodSelect = page.getByLabelText('Select time period:')
			await periodSelect.selectOptions('yearly')
			flushSync()

			// Should show the selected year - look for the "Showing data for:" text
			const showingDataText = page.getByText('Showing data for:')
			await expect.element(showingDataText).toBeInTheDocument()
		})

		test('should show month for monthly period', async () => {
			render(StatsPage, { data: mockData })

			// Select monthly period
			const periodSelect = page.getByLabelText('Select time period:')
			await periodSelect.selectOptions('monthly')
			flushSync()

			// Should show the selected month - look for the "Showing data for:" text
			const showingDataText = page.getByText('Showing data for:')
			await expect.element(showingDataText).toBeInTheDocument()
		})
	})

	describe('Auto-Selection Logic', () => {
		test('should auto-select most recent historical year when switching to yearly', async () => {
			render(StatsPage, { data: mockData })

			const periodSelect = page.getByLabelText('Select time period:')

			// Switch to yearly
			await periodSelect.selectOptions('yearly')
			flushSync()

			// Should auto-select 2024 (most recent historical year)
			const yearSelect = page.getByLabelText('Select year:')
			await expect.element(yearSelect).toHaveValue('2024')
		})

		test('should auto-select most recent historical month when switching to monthly', async () => {
			render(StatsPage, { data: mockData })

			const periodSelect = page.getByLabelText('Select time period:')

			// Switch to monthly
			await periodSelect.selectOptions('monthly')
			flushSync()

			// Should auto-select 2024-12 (most recent historical month)
			const monthSelect = page.getByLabelText('Select month:')
			await expect.element(monthSelect).toHaveValue('2024-12')
		})
	})

	describe('Data Filtering and Display', () => {
		test('should exclude current year from year dropdown options', async () => {
			render(StatsPage, { data: mockData })

			const periodSelect = page.getByLabelText('Select time period:')
			await periodSelect.selectOptions('yearly')
			flushSync()

			// Check that current year is not in the year options
			await expect
				.element(page.getByText(mockData.current_year))
				.not.toBeInTheDocument()
			// Check for historical year options in the dropdown
			await expect
				.element(page.getByRole('option', { name: '2024' }))
				.toBeInTheDocument()
			await expect
				.element(page.getByRole('option', { name: '2023' }))
				.toBeInTheDocument()
			await expect
				.element(page.getByRole('option', { name: '2022' }))
				.toBeInTheDocument()
		})

		test('should exclude current year from month dropdown options', async () => {
			render(StatsPage, { data: mockData })

			const periodSelect = page.getByLabelText('Select time period:')
			await periodSelect.selectOptions('monthly')
			flushSync()

			// Check that no current year months are in the options
			await expect
				.element(page.getByText(`${mockData.current_year}-01`))
				.not.toBeInTheDocument()
			await expect
				.element(page.getByText(`${mockData.current_year}-02`))
				.not.toBeInTheDocument()

			// Should have historical months in the dropdown
			await expect
				.element(page.getByRole('option', { name: '2024-12' }))
				.toBeInTheDocument()
			await expect
				.element(page.getByRole('option', { name: '2024-11' }))
				.toBeInTheDocument()
		})

		test('should display stats table with correct data', async () => {
			render(StatsPage, { data: mockData })

			// Check table headers
			const titleHeader = page.getByText('Title').first()
			const viewsHeader = page.getByText('Views').last()
			const visitorsHeader = page.getByText('Unique Visitors').last()

			await expect.element(titleHeader).toBeInTheDocument()
			await expect.element(viewsHeader).toBeInTheDocument()
			await expect.element(visitorsHeader).toBeInTheDocument()

			// Check that posts are displayed (should show 2024 yearly data by default)
			const post1Link = page.getByRole('link', {
				name: 'Test Post 1',
			})
			const post2Link = page.getByRole('link', {
				name: 'Test Post 2',
			})

			await expect.element(post1Link).toBeInTheDocument()
			await expect.element(post2Link).toBeInTheDocument()

			// Check that view counts are displayed
			await expect.element(page.getByText('500')).toBeInTheDocument() // Test Post 1 views
			await expect.element(page.getByText('300')).toBeInTheDocument() // Test Post 2 views
		})

		test('should update table data when period selection changes', async () => {
			render(StatsPage, { data: mockData })

			const periodSelect = page.getByLabelText('Select time period:')

			// Switch to yearly and verify data updates
			await periodSelect.selectOptions('yearly')
			flushSync()

			// Should show yearly data for 2024
			await expect.element(page.getByText('500')).toBeInTheDocument()
			await expect.element(page.getByText('300')).toBeInTheDocument()

			// Switch to all-time and verify data updates
			await periodSelect.selectOptions('all_time')
			flushSync()

			// Should show all-time data
			await expect
				.element(page.getByText('1K'))
				.toBeInTheDocument()
			await expect.element(page.getByText('730')).toBeInTheDocument()
		})
	})

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
			}

			render(StatsPage, { data: emptyData })

			const noDataMessage = page.getByText(
				'No stats data available yet.',
			)
			await expect.element(noDataMessage).toBeInTheDocument()
		})

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
			}

			render(StatsPage, { data: errorData })

			const errorMessage = page.getByText('Failed to load data')
			await expect.element(errorMessage).toBeInTheDocument()
		})
	})

	describe('Accessibility', () => {
		test('should have proper form labels and ARIA attributes', async () => {
			render(StatsPage, { data: mockData })

			// Check that selects have proper labels
			const periodSelect = page.getByLabelText('Select time period:')
			await expect.element(periodSelect).toBeInTheDocument()

			// When yearly is selected, year select should be labeled
			await periodSelect.selectOptions('yearly')
			flushSync()

			const yearSelect = page.getByLabelText('Select year:')
			await expect.element(yearSelect).toBeInTheDocument()

			// When monthly is selected, month select should be labeled
			await periodSelect.selectOptions('monthly')
			flushSync()

			const monthSelect = page.getByLabelText('Select month:')
			await expect.element(monthSelect).toBeInTheDocument()
		})

		test('should have proper table structure for screen readers', async () => {
			render(StatsPage, { data: mockData })

			// Check table headers exist - the table headers are already tested in other tests
			// Just verify the table structure exists
			const table = page.getByRole('table')
			await expect.element(table).toBeInTheDocument()

			// Verify headers are present (already tested in display test)
			const titleHeader = page.getByText('Title').first()
			const viewsHeader = page.getByText('Views').last()
			const visitorsHeader = page.getByText('Unique Visitors').last()

			await expect.element(titleHeader).toBeInTheDocument()
			await expect.element(viewsHeader).toBeInTheDocument()
			await expect.element(visitorsHeader).toBeInTheDocument()
		})
	})
})
