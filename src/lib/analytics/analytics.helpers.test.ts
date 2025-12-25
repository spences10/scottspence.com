import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
	query_active_on_path,
	query_active_visitors,
	type SqliteClient,
} from './analytics.helpers'

describe('analytics helpers', () => {
	let mock_client: SqliteClient

	beforeEach(() => {
		vi.useFakeTimers()
		vi.setSystemTime(new Date('2025-01-15T12:00:00Z'))
	})

	describe('query_active_visitors', () => {
		it('should return pages and total count', () => {
			mock_client = {
				execute: vi.fn().mockImplementation(({ sql }) => {
					if (sql.includes('GROUP BY')) {
						return {
							rows: [
								{ path: '/posts/test', count: 5 },
								{ path: '/', count: 3 },
							],
						}
					}
					return { rows: [{ count: 8 }] }
				}),
			}

			const result = query_active_visitors(mock_client, { limit: 10 })

			expect(result.pages).toHaveLength(2)
			expect(result.pages[0]).toEqual({
				path: '/posts/test',
				count: 5,
			})
			expect(result.total).toBe(8)
		})

		it('should use correct time window', () => {
			const execute_spy = vi.fn().mockReturnValue({ rows: [] })
			mock_client = { execute: execute_spy }

			query_active_visitors(mock_client, {
				window_ms: 10 * 60 * 1000,
			})

			const expected_cutoff = Date.now() - 10 * 60 * 1000
			expect(execute_spy).toHaveBeenCalledWith(
				expect.objectContaining({
					args: expect.arrayContaining([expected_cutoff]),
				}),
			)
		})

		it('should respect limit parameter', () => {
			const execute_spy = vi.fn().mockReturnValue({ rows: [] })
			mock_client = { execute: execute_spy }

			query_active_visitors(mock_client, { limit: 5 })

			expect(execute_spy).toHaveBeenCalledWith(
				expect.objectContaining({
					args: expect.arrayContaining([5]),
				}),
			)
		})

		it('should return empty result on error', () => {
			mock_client = {
				execute: vi.fn().mockImplementation(() => {
					throw new Error('Database error')
				}),
			}

			const result = query_active_visitors(mock_client)

			expect(result).toEqual({
				pages: [],
				total: 0,
				bots: 0,
				countries: [],
				browsers: [],
				devices: [],
				referrers: [],
			})
		})

		it('should handle empty results', () => {
			mock_client = {
				execute: vi.fn().mockReturnValue({ rows: [] }),
			}

			const result = query_active_visitors(mock_client)

			expect(result.pages).toEqual([])
			expect(result.total).toBe(0)
		})
	})

	describe('query_active_on_path', () => {
		it('should return count for specific path', () => {
			mock_client = {
				execute: vi.fn().mockReturnValue({ rows: [{ count: 3 }] }),
			}

			const result = query_active_on_path(mock_client, '/posts/test')

			expect(result.count).toBe(3)
		})

		it('should pass correct path to query', () => {
			const execute_spy = vi
				.fn()
				.mockReturnValue({ rows: [{ count: 0 }] })
			mock_client = { execute: execute_spy }

			query_active_on_path(mock_client, '/about')

			expect(execute_spy).toHaveBeenCalledWith(
				expect.objectContaining({
					args: expect.arrayContaining(['/about']),
				}),
			)
		})

		it('should use correct time window', () => {
			const execute_spy = vi
				.fn()
				.mockReturnValue({ rows: [{ count: 0 }] })
			mock_client = { execute: execute_spy }

			query_active_on_path(mock_client, '/', {
				window_ms: 15 * 60 * 1000,
			})

			const expected_cutoff = Date.now() - 15 * 60 * 1000
			expect(execute_spy).toHaveBeenCalledWith(
				expect.objectContaining({
					args: expect.arrayContaining([expected_cutoff]),
				}),
			)
		})

		it('should return zero on error', () => {
			mock_client = {
				execute: vi.fn().mockImplementation(() => {
					throw new Error('Database error')
				}),
			}

			const result = query_active_on_path(mock_client, '/posts/test')

			expect(result.count).toBe(0)
		})

		it('should return zero for empty results', () => {
			mock_client = {
				execute: vi.fn().mockReturnValue({ rows: [] }),
			}

			const result = query_active_on_path(mock_client, '/nonexistent')

			expect(result.count).toBe(0)
		})
	})
})
