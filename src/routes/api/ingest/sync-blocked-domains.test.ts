import { sqlite_client } from '$lib/sqlite/client'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
	sync_blocked_domains,
	validate_sync_blocked_domains,
} from './sync-blocked-domains'

vi.mock('$lib/sqlite/client', () => ({
	sqlite_client: {
		execute: vi.fn(),
	},
}))

vi.mock('$lib/analytics/blocked-domains', () => ({
	invalidate_blocked_domains_cache: vi.fn(),
}))

describe('validate_sync_blocked_domains', () => {
	it('validates valid data with add array', () => {
		const result = validate_sync_blocked_domains({
			add: ['spam.com', 'bad.site'],
		})
		expect(result).toEqual({ add: ['spam.com', 'bad.site'] })
	})

	it('validates valid data with remove array', () => {
		const result = validate_sync_blocked_domains({
			remove: ['false-positive.com'],
		})
		expect(result).toEqual({ remove: ['false-positive.com'] })
	})

	it('validates valid data with both add and remove', () => {
		const result = validate_sync_blocked_domains({
			add: ['spam.com'],
			remove: ['good.site'],
		})
		expect(result).toEqual({
			add: ['spam.com'],
			remove: ['good.site'],
		})
	})

	it('validates empty object', () => {
		const result = validate_sync_blocked_domains({})
		expect(result).toEqual({})
	})

	it('throws on invalid data type', () => {
		expect(() =>
			validate_sync_blocked_domains('not-an-object'),
		).toThrow()
	})

	it('throws on invalid add type', () => {
		expect(() =>
			validate_sync_blocked_domains({ add: 'not-an-array' }),
		).toThrow()
	})

	it('throws on invalid array items', () => {
		expect(() =>
			validate_sync_blocked_domains({ add: [123, 456] }),
		).toThrow()
	})
})

describe('sync_blocked_domains', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	it('adds domains and returns correct count', async () => {
		const execute_mock = vi
			.fn()
			// First call: INSERT for domain1
			.mockReturnValueOnce({ rowsAffected: 1 })
			// Second call: INSERT for domain2
			.mockReturnValueOnce({ rowsAffected: 1 })
			// Third call: SELECT current list
			.mockReturnValueOnce({
				rows: [{ domain: 'domain1.com' }, { domain: 'domain2.com' }],
			})

		;(sqlite_client.execute as any) = execute_mock

		const result = await sync_blocked_domains({
			add: ['domain1.com', 'domain2.com'],
		})

		expect(result.added).toBe(2)
		expect(result.removed).toBe(0)
		expect(result.current).toEqual(['domain1.com', 'domain2.com'])
	})

	it('does not count duplicate adds', async () => {
		const execute_mock = vi
			.fn()
			// INSERT OR IGNORE returns 0 rowsAffected for duplicates
			.mockReturnValueOnce({ rowsAffected: 0 })
			.mockReturnValueOnce({ rows: [{ domain: 'existing.com' }] })

		;(sqlite_client.execute as any) = execute_mock

		const result = await sync_blocked_domains({
			add: ['existing.com'],
		})

		expect(result.added).toBe(0)
	})

	it('removes domains and returns correct count', async () => {
		const execute_mock = vi
			.fn()
			// DELETE returns 1 rowsAffected
			.mockReturnValueOnce({ rowsAffected: 1 })
			// SELECT current list
			.mockReturnValueOnce({ rows: [] })

		;(sqlite_client.execute as any) = execute_mock

		const result = await sync_blocked_domains({
			remove: ['spam.com'],
		})

		expect(result.removed).toBe(1)
		expect(result.added).toBe(0)
	})

	it('does not count non-existent removes', async () => {
		const execute_mock = vi
			.fn()
			// DELETE returns 0 rowsAffected when domain doesn't exist
			.mockReturnValueOnce({ rowsAffected: 0 })
			.mockReturnValueOnce({ rows: [] })

		;(sqlite_client.execute as any) = execute_mock

		const result = await sync_blocked_domains({
			remove: ['nonexistent.com'],
		})

		expect(result.removed).toBe(0)
	})

	it('normalises domains to lowercase and trims whitespace', async () => {
		const execute_mock = vi
			.fn()
			.mockReturnValueOnce({ rowsAffected: 1 })
			.mockReturnValueOnce({ rows: [{ domain: 'spam.com' }] })

		;(sqlite_client.execute as any) = execute_mock

		await sync_blocked_domains({
			add: ['  SPAM.COM  '],
		})

		expect(execute_mock).toHaveBeenCalledWith({
			sql: expect.stringContaining('INSERT'),
			args: ['spam.com'],
		})
	})

	it('skips empty strings after normalisation', async () => {
		const execute_mock = vi.fn().mockReturnValueOnce({ rows: [] })

		;(sqlite_client.execute as any) = execute_mock

		const result = await sync_blocked_domains({
			add: ['   ', ''],
		})

		// Only the final SELECT should be called, no INSERTs
		expect(execute_mock).toHaveBeenCalledTimes(1)
		expect(result.added).toBe(0)
	})

	it('handles both add and remove in single call', async () => {
		const execute_mock = vi
			.fn()
			// INSERT
			.mockReturnValueOnce({ rowsAffected: 1 })
			// DELETE
			.mockReturnValueOnce({ rowsAffected: 1 })
			// SELECT
			.mockReturnValueOnce({ rows: [{ domain: 'new.com' }] })

		;(sqlite_client.execute as any) = execute_mock

		const result = await sync_blocked_domains({
			add: ['new.com'],
			remove: ['old.com'],
		})

		expect(result.added).toBe(1)
		expect(result.removed).toBe(1)
	})

	it('handles database errors gracefully for individual operations', async () => {
		const execute_mock = vi
			.fn()
			// First INSERT throws
			.mockImplementationOnce(() => {
				throw new Error('DB error')
			})
			// Second INSERT succeeds
			.mockReturnValueOnce({ rowsAffected: 1 })
			// SELECT
			.mockReturnValueOnce({ rows: [{ domain: 'good.com' }] })

		;(sqlite_client.execute as any) = execute_mock

		const result = await sync_blocked_domains({
			add: ['bad.com', 'good.com'],
		})

		// Only the successful one is counted
		expect(result.added).toBe(1)
	})

	it('filters non-string values from result', async () => {
		const execute_mock = vi.fn().mockReturnValueOnce({
			rows: [
				{ domain: 'valid.com' },
				{ domain: null },
				{ domain: 123 },
				{ domain: 'also-valid.com' },
			],
		})

		;(sqlite_client.execute as any) = execute_mock

		const result = await sync_blocked_domains({})

		expect(result.current).toEqual(['valid.com', 'also-valid.com'])
	})
})
