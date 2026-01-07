import { flushSync, untrack } from 'svelte'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-svelte'
import { page } from 'vitest/browser'
import PopularPosts from './popular-posts.svelte'

// Mock the remote functions
vi.mock('$lib/data/popular-posts.remote', () => ({
	get_popular_posts: vi.fn(() =>
		Promise.resolve({
			popular_posts_daily: [
				{
					pathname: '/posts/test-daily',
					title: 'Daily Post',
					pageviews: 100,
					visits: 50,
				},
			],
			popular_posts_monthly: [
				{
					pathname: '/posts/test-monthly',
					title: 'Monthly Post',
					pageviews: 500,
					visits: 200,
				},
			],
			popular_posts_yearly: [
				{
					pathname: '/posts/test-yearly-1',
					title: 'Yearly Post One',
					pageviews: 1000,
					visits: 400,
				},
				{
					pathname: '/posts/test-yearly-2',
					title: 'Yearly Post Two',
					pageviews: 800,
					visits: 300,
				},
			],
		}),
	),
}))

// Mock track_click
const mock_track_click = vi.fn()
vi.mock('$lib/analytics/track-click.remote', () => ({
	track_click: (args: { event_name: string }) =>
		mock_track_click(args),
}))

// Mock $app/state
vi.mock('$app/state', () => ({
	page: {
		url: { origin: 'https://scottspence.com' },
	},
}))

describe('PopularPosts Component', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	describe('Initial Rendering', () => {
		it('should render with default yearly view', async () => {
			render(PopularPosts)

			// Wait for async data load
			await vi.waitFor(async () => {
				const select = page.getByRole('combobox')
				await expect.element(select).toBeInTheDocument()
			})

			const select = page.getByRole('combobox')
			await expect.element(select).toHaveValue('popular_posts_yearly')
		})

		it('should display intro text', async () => {
			render(PopularPosts)

			await vi.waitFor(async () => {
				const text = page.getByText(
					/Take a look at some popular content/,
				)
				await expect.element(text).toBeInTheDocument()
			})
		})

		it('should render post cards after data loads', async () => {
			render(PopularPosts)

			await vi.waitFor(async () => {
				const post = page.getByText('Yearly Post One')
				await expect.element(post).toBeInTheDocument()
			})
		})
	})

	describe('Period Selection', () => {
		it('should have all three period options', async () => {
			render(PopularPosts)

			await vi.waitFor(async () => {
				const select = page.getByRole('combobox')
				await expect.element(select).toBeInTheDocument()
			})

			const options = page.getByRole('option')
			await expect
				.element(options.nth(0))
				.toHaveTextContent('Views today')
			await expect
				.element(options.nth(1))
				.toHaveTextContent('Views this month')
			await expect
				.element(options.nth(2))
				.toHaveTextContent('Views this year')
		})

		it('should track click when period changes to daily', async () => {
			render(PopularPosts)

			await vi.waitFor(async () => {
				const select = page.getByRole('combobox')
				await expect.element(select).toBeInTheDocument()
			})

			const select = page.getByRole('combobox')
			await select.selectOptions('popular_posts_daily')

			expect(mock_track_click).toHaveBeenCalledWith({
				event_name: 'popular posts period: today',
			})
		})

		it('should track click when period changes to monthly', async () => {
			render(PopularPosts)

			await vi.waitFor(async () => {
				const select = page.getByRole('combobox')
				await expect.element(select).toBeInTheDocument()
			})

			const select = page.getByRole('combobox')
			await select.selectOptions('popular_posts_monthly')

			expect(mock_track_click).toHaveBeenCalledWith({
				event_name: 'popular posts period: this month',
			})
		})

		it('should display correct posts when period changes', async () => {
			render(PopularPosts)

			await vi.waitFor(async () => {
				const post = page.getByText('Yearly Post One')
				await expect.element(post).toBeInTheDocument()
			})

			const select = page.getByRole('combobox')
			await select.selectOptions('popular_posts_daily')

			await vi.waitFor(async () => {
				const dailyPost = page.getByText('Daily Post')
				await expect.element(dailyPost).toBeInTheDocument()
			})
		})
	})

	describe('Post Card Links', () => {
		it('should have correct href on post cards', async () => {
			render(PopularPosts)

			await vi.waitFor(async () => {
				const title = page.getByText('Yearly Post One')
				await expect.element(title).toBeInTheDocument()
			})

			// Get all links and check the first one has correct href
			const links = page.getByRole('link')
			await expect
				.element(links.first())
				.toHaveAttribute(
					'href',
					'https://scottspence.com/posts/test-yearly-1',
				)
		})

		it('should track click when post card is clicked', async () => {
			render(PopularPosts)

			await vi.waitFor(async () => {
				const title = page.getByText('Yearly Post One')
				await expect.element(title).toBeInTheDocument()
			})

			// Click the first link - prevent navigation to avoid breaking iframe
			const links = page.getByRole('link')
			const link_element = await links.first().element()
			link_element.addEventListener(
				'click',
				(e) => e.preventDefault(),
				{ once: true },
			)
			await links.first().click()

			expect(mock_track_click).toHaveBeenCalledWith({
				event_name: 'popular post click: Yearly Post One',
			})
		})
	})

	describe('Views Display', () => {
		it('should display formatted view count', async () => {
			render(PopularPosts)

			await vi.waitFor(async () => {
				const views = page.getByText(/Views: 1k/)
				await expect.element(views).toBeInTheDocument()
			})
		})
	})

	describe('Rune State Logic', () => {
		it('should test period selection state', async () => {
			type PopularPostsPeriod =
				| 'popular_posts_daily'
				| 'popular_posts_monthly'
				| 'popular_posts_yearly'

			let period_state = $state<PopularPostsPeriod>(
				'popular_posts_yearly',
			)

			// Derived label mapping
			const labels: Record<PopularPostsPeriod, string> = {
				popular_posts_daily: 'today',
				popular_posts_monthly: 'this month',
				popular_posts_yearly: 'this year',
			}
			let current_label = $derived(labels[period_state])

			// Initial state
			expect(untrack(() => current_label)).toBe('this year')

			// Change to daily
			period_state = 'popular_posts_daily'
			flushSync()
			expect(untrack(() => current_label)).toBe('today')

			// Change to monthly
			period_state = 'popular_posts_monthly'
			flushSync()
			expect(untrack(() => current_label)).toBe('this month')
		})

		it('should test posts slicing logic', async () => {
			const mock_posts: PopularPost[] = [
				{
					id: '1',
					pathname: '/posts/1',
					title: 'Post 1',
					pageviews: 100,
					visits: 50,
					date_grouping: '',
					last_updated: '',
				},
				{
					id: '2',
					pathname: '/posts/2',
					title: 'Post 2',
					pageviews: 90,
					visits: 45,
					date_grouping: '',
					last_updated: '',
				},
				{
					id: '3',
					pathname: '/posts/3',
					title: 'Post 3',
					pageviews: 80,
					visits: 40,
					date_grouping: '',
					last_updated: '',
				},
				{
					id: '4',
					pathname: '/posts/4',
					title: 'Post 4',
					pageviews: 70,
					visits: 35,
					date_grouping: '',
					last_updated: '',
				},
				{
					id: '5',
					pathname: '/posts/5',
					title: 'Post 5',
					pageviews: 60,
					visits: 30,
					date_grouping: '',
					last_updated: '',
				},
			]

			let all_posts = $state(mock_posts)
			let displayed_posts = $derived(all_posts.slice(0, 4))

			// Should only show 4 posts
			expect(untrack(() => displayed_posts.length)).toBe(4)
			expect(untrack(() => displayed_posts[3].title)).toBe('Post 4')
		})
	})

	describe('Empty State', () => {
		it('should not render when no posts available', async () => {
			// Override mock for this test
			const { get_popular_posts } =
				await import('$lib/data/popular-posts.remote')
			vi.mocked(get_popular_posts).mockResolvedValueOnce({
				popular_posts_daily: [],
				popular_posts_monthly: [],
				popular_posts_yearly: [],
			})

			render(PopularPosts)

			// Give time for mount
			await new Promise((r) => setTimeout(r, 100))

			const select = page.getByRole('combobox')
			await expect.element(select).not.toBeInTheDocument()
		})
	})
})
