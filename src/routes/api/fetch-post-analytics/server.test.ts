import * as fathom_module from '$lib/fathom'
import * as turso_module from '$lib/turso'
import * as date_fns_module from 'date-fns'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import * as utils_module from '../ingest/utils'
import { GET } from './+server'

// Mock dependencies
vi.mock('$env/static/public', () => ({
	PUBLIC_FATHOM_ID: 'mock-fathom-id',
}))

vi.mock('$lib/turso', () => ({
	turso_client: vi.fn(),
}))

vi.mock('$lib/fathom', () => ({
	fetch_fathom_data: vi.fn(),
}))

vi.mock('date-fns', () => ({
	differenceInHours: vi.fn(),
	parseISO: vi.fn(),
}))

vi.mock('../ingest/utils', () => ({
	get_date_range: vi.fn(),
}))

describe('GET function in fetch-post-analytics server', () => {
	let mock_execute: ReturnType<typeof vi.fn>
	let mock_batch: ReturnType<typeof vi.fn>
	let mock_fetch: ReturnType<typeof vi.fn>
	let analytics_cache: Map<string, any>

	beforeEach(() => {
		vi.resetAllMocks()
		mock_execute = vi.fn()
		mock_batch = vi.fn()
		mock_fetch = vi.fn()
		analytics_cache = new Map()
		vi.mocked(turso_module.turso_client).mockReturnValue({
			execute: mock_execute,
			batch: mock_batch,
		} as any)
		vi.mocked(date_fns_module.differenceInHours).mockReturnValue(25) // Assume data is stale
		vi.mocked(date_fns_module.parseISO).mockReturnValue(new Date())
		vi.mocked(utils_module.get_date_range).mockReturnValue([
			'2023-01-01',
			'2023-12-31',
		])
		vi.mocked(fathom_module.fetch_fathom_data).mockResolvedValue([
			{
				visits: '50',
				uniques: '30',
				pageviews: '100',
				avg_duration: '120',
				bounce_rate: '0.5',
				date: '2023-01-01',
			},
		] as any)
	})

	it('returns 400 if no slug is provided', async () => {
		const url = new URL('http://example.com')
		const response = await GET({ url, fetch: mock_fetch } as any)

		expect(response.status).toBe(400)
		expect(await response.text()).toBe('No slug provided')
	})

	it.skip('fetches new data when data is stale', async () => {
		const url = new URL('http://example.com?slug=test-post')

		// Mock stale data check
		mock_execute.mockImplementation(({ sql, args }) => {
			if (sql.includes('SELECT last_updated')) {
				return Promise.resolve({
					rows: [{ last_updated: '2023-01-01' }],
				})
			} else if (sql.includes('UNION')) {
				return Promise.resolve({
					rows: [
						{
							period: 'day',
							visits: 10,
							pageviews: 20,
							uniques: 8,
							avg_duration: 120,
							bounce_rate: 0.5,
							date_grouping: 'day',
						},
						{
							period: 'month',
							visits: 100,
							pageviews: 200,
							uniques: 80,
							avg_duration: 150,
							bounce_rate: 0.4,
							date_grouping: 'month',
						},
						{
							period: 'year',
							visits: 1000,
							pageviews: 2000,
							uniques: 800,
							avg_duration: 180,
							bounce_rate: 0.3,
							date_grouping: 'year',
						},
					],
				})
			}
			return Promise.resolve({ rows: [] })
		})

		const response = await GET({ url, fetch: mock_fetch } as any)
		const data = await response.json()

		expect(data).toEqual({
			daily_visits: {
				period: 'day',
				visits: 10,
				pageviews: 20,
				uniques: 8,
				avg_duration: 120,
				bounce_rate: 0.5,
				date_grouping: 'day',
			},
			monthly_visits: {
				period: 'month',
				visits: 100,
				pageviews: 200,
				uniques: 80,
				avg_duration: 150,
				bounce_rate: 0.4,
				date_grouping: 'month',
			},
			yearly_visits: {
				period: 'year',
				visits: 1000,
				pageviews: 2000,
				uniques: 800,
				avg_duration: 180,
				bounce_rate: 0.3,
				date_grouping: 'year',
			},
		})

		expect(mock_execute).toHaveBeenCalled()
		expect(mock_batch).toHaveBeenCalledTimes(1)
		expect(fathom_module.fetch_fathom_data).toHaveBeenCalledTimes(3) // Once for each period
	})

	it.skip('uses cached data if available and not stale', async () => {
		const url = new URL('http://example.com?slug=test-post')
		vi.mocked(date_fns_module.differenceInHours).mockReturnValue(1) // Data is fresh

		// Mock initial data in cache
		const cached_data = {
			last_fetched: new Date().toISOString(),
			data: {
				daily: {
					period: 'day',
					visits: 10,
					pageviews: 20,
					uniques: 8,
					avg_duration: 120,
					bounce_rate: 0.5,
					date_grouping: 'day',
				},
				monthly: {
					period: 'month',
					visits: 100,
					pageviews: 200,
					uniques: 80,
					avg_duration: 150,
					bounce_rate: 0.4,
					date_grouping: 'month',
				},
				yearly: {
					period: 'year',
					visits: 1000,
					pageviews: 2000,
					uniques: 800,
					avg_duration: 180,
					bounce_rate: 0.3,
					date_grouping: 'year',
				},
			},
		}
		analytics_cache.set('analytics-test-post', cached_data)

		// Mock analytics data fetch (shouldn't be called)
		mock_execute.mockImplementation(({ sql, args }) => {
			if (sql.includes('SELECT last_updated')) {
				return Promise.resolve({
					rows: [{ last_updated: new Date().toISOString() }],
				})
			}
			return Promise.resolve({ rows: [] })
		})

		const response = await GET({ url, fetch: mock_fetch } as any)
		const data = await response.json()

		expect(data).toEqual({
			daily_visits: {
				period: 'day',
				visits: 10,
				pageviews: 20,
				uniques: 8,
				avg_duration: 120,
				bounce_rate: 0.5,
				date_grouping: 'day',
			},
			monthly_visits: {
				period: 'month',
				visits: 100,
				pageviews: 200,
				uniques: 80,
				avg_duration: 150,
				bounce_rate: 0.4,
				date_grouping: 'month',
			},
			yearly_visits: {
				period: 'year',
				visits: 1000,
				pageviews: 2000,
				uniques: 800,
				avg_duration: 180,
				bounce_rate: 0.3,
				date_grouping: 'year',
			},
		})

		expect(mock_execute).toHaveBeenCalled()
		expect(mock_batch).not.toHaveBeenCalled()
		expect(fathom_module.fetch_fathom_data).not.toHaveBeenCalled()
	})

	it('handles database errors gracefully', async () => {
		const url = new URL('http://example.com?slug=test-post')
		mock_execute.mockRejectedValue(new Error('Database error'))

		const response = await GET({ url, fetch: mock_fetch } as any)
		const data = await response.json()

		expect(data).toEqual({
			daily_visits: null,
			monthly_visits: null,
			yearly_visits: null,
		})
		expect(mock_execute).toHaveBeenCalled()
	})
})
