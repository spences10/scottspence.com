import { describe, expect, it, vi } from 'vitest'
import {
	fetch_popular_month,
	fetch_popular_posts_from_db,
	fetch_popular_today,
	fetch_popular_year,
	normalize_popular_post,
	normalize_popular_posts,
} from './popular-posts.helpers'

describe('popular-posts.helpers', () => {
	describe('normalize_popular_post', () => {
		it('should normalize a row with all fields', () => {
			const row = {
				pathname: '/posts/test-post',
				title: 'Test Post',
				views: 100,
				uniques: 50,
			}

			const result = normalize_popular_post(row)

			expect(result).toEqual({
				id: '/posts/test-post',
				pathname: '/posts/test-post',
				title: 'Test Post',
				pageviews: 100,
				visits: 50,
				date_grouping: '',
				last_updated: '',
			})
		})

		it('should map views to pageviews and uniques to visits', () => {
			const row = {
				pathname: '/posts/test',
				title: 'Test',
				views: 200,
				uniques: 100,
			}

			const result = normalize_popular_post(row)

			expect(result.pageviews).toBe(200)
			expect(result.visits).toBe(100)
		})
	})

	describe('normalize_popular_posts', () => {
		it('should normalize an array of rows', () => {
			const rows = [
				{
					pathname: '/posts/post-1',
					title: 'Post 1',
					views: 100,
					uniques: 50,
				},
				{
					pathname: '/posts/post-2',
					title: 'Post 2',
					views: 200,
					uniques: 100,
				},
			]

			const result = normalize_popular_posts(rows)

			expect(result).toHaveLength(2)
			expect(result[0].title).toBe('Post 1')
			expect(result[1].title).toBe('Post 2')
		})

		it('should return empty array for empty input', () => {
			const result = normalize_popular_posts([])
			expect(result).toEqual([])
		})
	})

	describe('fetch_popular_today', () => {
		it('should query analytics_events for today', async () => {
			const mock_client = {
				execute: vi.fn().mockResolvedValue({
					rows: [
						{
							pathname: '/posts/today-post',
							title: 'Today Post',
							views: 100,
							uniques: 50,
						},
					],
				}),
			}

			const result = await fetch_popular_today(mock_client as any)

			expect(mock_client.execute).toHaveBeenCalled()
			const call = mock_client.execute.mock.calls[0][0]
			expect(call.sql).toContain('analytics_events')
			expect(call.sql).toContain('is_bot = 0')
			expect(result).toHaveLength(1)
			expect(result[0].title).toBe('Today Post')
		})
	})

	describe('fetch_popular_month', () => {
		it('should query analytics_monthly for current month', async () => {
			const mock_client = {
				execute: vi.fn().mockResolvedValue({
					rows: [
						{
							pathname: '/posts/monthly-post',
							title: 'Monthly Post',
							views: 500,
							uniques: 250,
						},
					],
				}),
			}

			const result = await fetch_popular_month(mock_client as any)

			expect(mock_client.execute).toHaveBeenCalled()
			const call = mock_client.execute.mock.calls[0][0]
			expect(call.sql).toContain('analytics_monthly')
			expect(result).toHaveLength(1)
			expect(result[0].title).toBe('Monthly Post')
		})
	})

	describe('fetch_popular_year', () => {
		it('should query analytics_yearly for current year', async () => {
			const mock_client = {
				execute: vi.fn().mockResolvedValue({
					rows: [
						{
							pathname: '/posts/yearly-post',
							title: 'Yearly Post',
							views: 1000,
							uniques: 500,
						},
					],
				}),
			}

			const result = await fetch_popular_year(mock_client as any)

			expect(mock_client.execute).toHaveBeenCalled()
			const call = mock_client.execute.mock.calls[0][0]
			expect(call.sql).toContain('analytics_yearly')
			expect(result).toHaveLength(1)
			expect(result[0].title).toBe('Yearly Post')
		})
	})

	describe('fetch_popular_posts_from_db', () => {
		it('should fetch and normalize all time periods', async () => {
			const mock_client = {
				execute: vi.fn().mockImplementation(({ sql }) => {
					if (sql.includes('analytics_events')) {
						return {
							rows: [
								{
									pathname: '/posts/daily',
									title: 'Daily Post',
									views: 100,
									uniques: 50,
								},
							],
						}
					}
					if (sql.includes('analytics_monthly')) {
						return {
							rows: [
								{
									pathname: '/posts/monthly',
									title: 'Monthly Post',
									views: 500,
									uniques: 250,
								},
							],
						}
					}
					if (sql.includes('analytics_yearly')) {
						return {
							rows: [
								{
									pathname: '/posts/yearly',
									title: 'Yearly Post',
									views: 1000,
									uniques: 500,
								},
							],
						}
					}
					return { rows: [] }
				}),
			}

			const result = await fetch_popular_posts_from_db(
				mock_client as any,
			)

			expect(result.popular_posts_daily).toHaveLength(1)
			expect(result.popular_posts_daily[0].title).toBe('Daily Post')
			expect(result.popular_posts_monthly).toHaveLength(1)
			expect(result.popular_posts_monthly[0].title).toBe(
				'Monthly Post',
			)
			expect(result.popular_posts_yearly).toHaveLength(1)
			expect(result.popular_posts_yearly[0].title).toBe('Yearly Post')
		})

		it('should handle empty results', async () => {
			const mock_client = {
				execute: vi.fn().mockResolvedValue({ rows: [] }),
			}

			const result = await fetch_popular_posts_from_db(
				mock_client as any,
			)

			expect(result.popular_posts_daily).toEqual([])
			expect(result.popular_posts_monthly).toEqual([])
			expect(result.popular_posts_yearly).toEqual([])
		})
	})
})
