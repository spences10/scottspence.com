import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET } from './+server'
import { turso_client } from '$lib/turso/client'

// Mock dependencies
vi.mock('$lib/turso/client', () => ({
	turso_client: vi.fn(),
}))

describe('GET function in fetch-popular-posts server', () => {
	let mock_execute: ReturnType<typeof vi.fn>

	beforeEach(() => {
		vi.resetAllMocks()
		mock_execute = vi.fn()
		vi.mocked(turso_client).mockReturnValue({
			execute: mock_execute,
		} as any)
	})

	it('returns empty arrays when no posts are found', async () => {
		mock_execute.mockResolvedValue({ rows: [] })

		const response = await GET()
		const data = await (response as Response).json()

		expect(data).toEqual({
			daily: [],
			monthly: [],
			yearly: [],
		})
		expect(mock_execute).toHaveBeenCalled()
	})

	it.skip('categorizes posts correctly when found', async () => {
		const mock_posts = [
			{
				period: 'day',
				id: 1,
				pathname: '/posts/day-post',
				title: 'Day Post',
				pageviews: 100,
				visits: 50,
				date_grouping: 'day',
				last_updated: '2023-06-01',
			},
			{
				period: 'month',
				id: 2,
				pathname: '/posts/month-post',
				title: 'Month Post',
				pageviews: 1000,
				visits: 500,
				date_grouping: 'month',
				last_updated: '2023-06-01',
			},
			{
				period: 'year',
				id: 3,
				pathname: '/posts/year-post',
				title: 'Year Post',
				pageviews: 10000,
				visits: 5000,
				date_grouping: 'year',
				last_updated: '2023-06-01',
			},
		]
		mock_execute.mockResolvedValue({ rows: mock_posts })

		const response = await GET()
		const data = await (response as Response).json()

		console.log(
			'Mock execute called with:',
			mock_execute.mock.calls[0]?.[0],
		)
		console.log('GET function returned:', data)

		expect(mock_execute).toHaveBeenCalledWith(
			expect.stringContaining('SELECT'),
		)
		expect(data).toEqual({
			daily: [
				{
					period: 'day',
					id: 1,
					pathname: '/posts/day-post',
					title: 'Day Post',
					pageviews: 100,
					visits: 50,
					date_grouping: 'day',
					last_updated: '2023-06-01',
				},
			],
			monthly: [
				{
					period: 'month',
					id: 2,
					pathname: '/posts/month-post',
					title: 'Month Post',
					pageviews: 1000,
					visits: 500,
					date_grouping: 'month',
					last_updated: '2023-06-01',
				},
			],
			yearly: [
				{
					period: 'year',
					id: 3,
					pathname: '/posts/year-post',
					title: 'Year Post',
					pageviews: 10000,
					visits: 5000,
					date_grouping: 'year',
					last_updated: '2023-06-01',
				},
			],
		})
	})
})
