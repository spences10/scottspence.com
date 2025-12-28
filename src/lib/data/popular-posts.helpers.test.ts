import { describe, expect, it, vi } from 'vitest'
import {
	build_popular_posts_query,
	fetch_popular_posts_from_db,
	normalize_popular_post,
	normalize_popular_posts,
} from './popular-posts.helpers'

describe('popular-posts.helpers', () => {
	describe('normalize_popular_post', () => {
		it('should normalize a row with all fields', () => {
			const row = {
				id: 1,
				pathname: '/posts/test-post',
				title: 'Test Post',
				pageviews: 100,
				visits: 50,
				date_grouping: 'day',
				last_updated: '2024-01-01',
			}

			const result = normalize_popular_post(row)

			expect(result).toEqual({
				id: '1',
				pathname: '/posts/test-post',
				title: 'Test Post',
				pageviews: 100,
				visits: 50,
				date_grouping: 'day',
				last_updated: '2024-01-01',
			})
		})

		it('should convert string numbers to numbers', () => {
			const row = {
				id: '42',
				pathname: '/posts/test',
				title: 'Test',
				pageviews: '200',
				visits: '100',
				date_grouping: 'month',
				last_updated: '2024-06-01',
			}

			const result = normalize_popular_post(row)

			expect(result.id).toBe('42')
			expect(result.pageviews).toBe(200)
			expect(result.visits).toBe(100)
		})

		it('should handle null/undefined values', () => {
			const row = {
				id: null,
				pathname: undefined,
				title: null,
				pageviews: null,
				visits: undefined,
				date_grouping: null,
				last_updated: undefined,
			}

			const result = normalize_popular_post(row)

			expect(result.id).toBe('null')
			expect(result.pathname).toBe('undefined')
			expect(result.pageviews).toBe(0) // Number(null) = 0
			expect(result.visits).toBeNaN() // Number(undefined) = NaN
		})
	})

	describe('normalize_popular_posts', () => {
		it('should normalize an array of rows', () => {
			const rows = [
				{
					id: 1,
					pathname: '/posts/post-1',
					title: 'Post 1',
					pageviews: 100,
					visits: 50,
					date_grouping: 'day',
					last_updated: '2024-01-01',
				},
				{
					id: 2,
					pathname: '/posts/post-2',
					title: 'Post 2',
					pageviews: 200,
					visits: 100,
					date_grouping: 'day',
					last_updated: '2024-01-02',
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

	describe('build_popular_posts_query', () => {
		it('should build query for day grouping', () => {
			const query = build_popular_posts_query('day')

			expect(query).toContain("WHERE pp.date_grouping = 'day'")
			expect(query).toContain('ORDER BY pp.pageviews DESC')
			expect(query).toContain('LIMIT 20')
		})

		it('should build query for month grouping', () => {
			const query = build_popular_posts_query('month')

			expect(query).toContain("WHERE pp.date_grouping = 'month'")
		})

		it('should build query for year grouping', () => {
			const query = build_popular_posts_query('year')

			expect(query).toContain("WHERE pp.date_grouping = 'year'")
		})

		it('should include JOIN with posts table', () => {
			const query = build_popular_posts_query('day')

			expect(query).toContain('JOIN posts p ON')
		})
	})

	describe('fetch_popular_posts_from_db', () => {
		it('should fetch and normalize all time periods', async () => {
			const mock_client = {
				execute: vi.fn().mockImplementation(({ sql }) => {
					if (sql.includes("'day'")) {
						return {
							rows: [
								{
									id: 1,
									pathname: '/posts/daily',
									title: 'Daily Post',
									pageviews: 100,
									visits: 50,
									date_grouping: 'day',
									last_updated: '2024-01-01',
								},
							],
						}
					}
					if (sql.includes("'month'")) {
						return {
							rows: [
								{
									id: 2,
									pathname: '/posts/monthly',
									title: 'Monthly Post',
									pageviews: 500,
									visits: 250,
									date_grouping: 'month',
									last_updated: '2024-01-01',
								},
							],
						}
					}
					if (sql.includes("'year'")) {
						return {
							rows: [
								{
									id: 3,
									pathname: '/posts/yearly',
									title: 'Yearly Post',
									pageviews: 1000,
									visits: 500,
									date_grouping: 'year',
									last_updated: '2024-01-01',
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
