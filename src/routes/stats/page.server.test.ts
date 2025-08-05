import type { RequestEvent } from '@sveltejs/kit'
import {
	afterEach,
	beforeEach,
	describe,
	expect,
	test,
	vi,
} from 'vitest'
import { load } from './+page.server'

// Mock the sqlite client
const mockExecute = vi.fn()
vi.mock('$lib/sqlite/client', () => ({
	sqlite_client: {
		execute: mockExecute,
	},
}))

// Mock environment
vi.mock('$env/static/private', () => ({
	TURSO_DB_URL: 'test-url',
	TURSO_DB_AUTH_TOKEN: 'test-token',
}))

// Mock server cache
vi.mock('$lib/cache/server-cache', () => ({
	BYPASS_DB_READS: { site_stats: false },
	CACHE_DURATIONS: { site_stats: 30000 },
	get_from_cache: vi.fn(),
	set_cache: vi.fn(),
}))

describe('Stats Page Server Logic', () => {
	beforeEach(() => {
		vi.clearAllMocks()
		// Mock current year as 2025 for consistent testing
		vi.useFakeTimers()
		vi.setSystemTime(new Date('2025-01-15'))
	})

	afterEach(() => {
		vi.useRealTimers()
	})

	const mockRequestEvent = {
		url: new URL('http://localhost:5173/stats'),
		params: {},
		route: { id: '/stats' },
	} as RequestEvent

	describe('Historical Data Filtering', () => {
		test('should exclude current year (2025) from yearly stats', async () => {
			const { get_from_cache } = await import(
				'$lib/cache/server-cache'
			)
			;(get_from_cache as any).mockReturnValue(null) // No cache

			// Mock database response with current year data
			mockExecute.mockResolvedValueOnce({
				rows: [
					{
						slug: 'test-post',
						title: 'Test Post',
						monthly_stats: JSON.stringify([
							{
								year_month: '2024-12',
								views: 50,
								unique_visitors: 25,
							},
							{
								year_month: '2024-11',
								views: 50,
								unique_visitors: 25,
							},
						]),
						yearly_stats: JSON.stringify([
							{ year: '2024', views: 100, unique_visitors: 50 },
						]),
						all_time_stats: JSON.stringify({
							views: 100,
							unique_visitors: 50,
						}),
					},
					{
						slug: 'test-post-2',
						title: 'Test Post 2',
						monthly_stats: JSON.stringify([
							{
								year_month: '2023-12',
								views: 75,
								unique_visitors: 30,
							},
							{
								year_month: '2023-11',
								views: 75,
								unique_visitors: 30,
							},
						]),
						yearly_stats: JSON.stringify([
							{ year: '2023', views: 150, unique_visitors: 60 },
						]),
						all_time_stats: JSON.stringify({
							views: 150,
							unique_visitors: 60,
						}),
					},
				],
			})

			const result = await load()

			expect(result.site_stats).toHaveLength(2) // Only 2 posts should have data

			// Check that yearly stats are properly loaded
			const testPost = result.site_stats.find(
				(p) => p.title === 'Test Post',
			)
			expect(testPost?.yearly_stats).toHaveLength(1)
			expect(testPost?.yearly_stats[0].year).toBe('2024')
			expect(testPost?.yearly_stats[0].views).toBe(100)
			expect(testPost?.yearly_stats[0].unique_visitors).toBe(50)
		})

		test('should exclude current year (2025) from monthly stats', async () => {
			const { get_from_cache } = await import(
				'$lib/cache/server-cache'
			)
			;(get_from_cache as any).mockReturnValue(null) // No cache

			mockExecute.mockResolvedValueOnce({
				rows: [
					{
						slug: 'test-post',
						title: 'Test Post',
						monthly_stats: JSON.stringify([
							{
								year_month: '2024-12',
								views: 100,
								unique_visitors: 50,
							},
							{
								year_month: '2024-11',
								views: 150,
								unique_visitors: 60,
							},
						]),
						yearly_stats: JSON.stringify([
							{ year: '2024', views: 250, unique_visitors: 110 },
						]),
						all_time_stats: JSON.stringify({
							views: 250,
							unique_visitors: 110,
						}),
					},
				],
			})

			const result = await load()

			const testPost = result.site_stats.find(
				(p) => p.title === 'Test Post',
			)
			expect(testPost?.monthly_stats).toHaveLength(2)

			// Check that monthly stats are properly loaded
			const monthlyStats = testPost?.monthly_stats || []
			expect(monthlyStats[0].year_month).toBe('2024-12')
			expect(monthlyStats[0].views).toBe(100)
			expect(monthlyStats[0].unique_visitors).toBe(50)
			expect(monthlyStats[1].year_month).toBe('2024-11')
			expect(monthlyStats[1].views).toBe(150)
			expect(monthlyStats[1].unique_visitors).toBe(60)
		})

		test('should calculate correct all-time stats excluding current year', async () => {
			const { get_from_cache } = await import(
				'$lib/cache/server-cache'
			)
			;(get_from_cache as any).mockReturnValue(null) // No cache

			mockExecute.mockResolvedValueOnce({
				rows: [
					{
						slug: 'test-post',
						title: 'Test Post',
						monthly_stats: JSON.stringify([
							{
								year_month: '2024-12',
								views: 50,
								unique_visitors: 25,
							},
							{
								year_month: '2024-11',
								views: 50,
								unique_visitors: 25,
							},
							{
								year_month: '2023-12',
								views: 75,
								unique_visitors: 30,
							},
							{
								year_month: '2023-11',
								views: 75,
								unique_visitors: 30,
							},
						]),
						yearly_stats: JSON.stringify([
							{ year: '2024', views: 100, unique_visitors: 50 },
							{ year: '2023', views: 150, unique_visitors: 60 },
						]),
						all_time_stats: JSON.stringify({
							views: 250,
							unique_visitors: 110,
						}),
					},
				],
			})

			const result = await load()

			const testPost = result.site_stats.find(
				(p) => p.title === 'Test Post',
			)

			// All-time stats should only include historical data (2024 + 2023)
			expect(testPost?.all_time_stats.views).toBe(250) // 100 + 150, not including 200 from 2025
			expect(testPost?.all_time_stats.unique_visitors).toBe(110) // 50 + 60, not including 75 from 2025
		})
	})

	describe('Error Handling', () => {
		test('should handle database connection errors gracefully', async () => {
			const { get_from_cache } = await import(
				'$lib/cache/server-cache'
			)
			;(get_from_cache as any).mockReturnValue(null) // No cache

			mockExecute.mockRejectedValueOnce(
				new Error('Database connection failed'),
			)

			const result = await load()

			expect(result.error).toBe('Error fetching site stats data')
			expect(result.site_stats).toEqual([])
		})

		test('should handle empty database results', async () => {
			const { get_from_cache } = await import(
				'$lib/cache/server-cache'
			)
			;(get_from_cache as any).mockReturnValue(null) // No cache

			mockExecute.mockResolvedValueOnce({ rows: [] })

			const result = await load()

			expect(result.site_stats).toEqual([])
			expect(result.error).toBeUndefined()
		})
	})

	describe('Data Aggregation', () => {
		test('should correctly aggregate stats for posts with multiple years', async () => {
			const { get_from_cache } = await import(
				'$lib/cache/server-cache'
			)
			;(get_from_cache as any).mockReturnValue(null) // No cache

			mockExecute.mockResolvedValueOnce({
				rows: [
					{
						slug: 'popular-post',
						title: 'Popular Post',
						monthly_stats: JSON.stringify([
							{
								year_month: '2024-12',
								views: 250,
								unique_visitors: 100,
							},
							{
								year_month: '2024-11',
								views: 250,
								unique_visitors: 100,
							},
							{
								year_month: '2023-12',
								views: 150,
								unique_visitors: 75,
							},
							{
								year_month: '2023-11',
								views: 150,
								unique_visitors: 75,
							},
							{
								year_month: '2022-12',
								views: 100,
								unique_visitors: 50,
							},
							{
								year_month: '2022-11',
								views: 100,
								unique_visitors: 50,
							},
						]),
						yearly_stats: JSON.stringify([
							{ year: '2024', views: 500, unique_visitors: 200 },
							{ year: '2023', views: 300, unique_visitors: 150 },
							{ year: '2022', views: 200, unique_visitors: 100 },
						]),
						all_time_stats: JSON.stringify({
							views: 1000,
							unique_visitors: 450,
						}),
					},
				],
			})

			const result = await load()

			const popularPost = result.site_stats.find(
				(p) => p.title === 'Popular Post',
			)

			expect(popularPost?.yearly_stats).toHaveLength(3)
			expect(popularPost?.all_time_stats.views).toBe(1000) // 500 + 300 + 200
			expect(popularPost?.all_time_stats.unique_visitors).toBe(450) // 200 + 150 + 100
		})
	})
})
