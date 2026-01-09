import { sqlite_client } from '$lib/sqlite/client'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
	sync_blocked_domains,
	validate_sync_blocked_domains,
} from './sync-blocked-domains'

vi.mock('$lib/sqlite/client', () => ({
	sqlite_client: {
		execute: vi.fn(),
		prepare: vi.fn(),
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

	const setup_mocks = (
		insert_results: { changes: number }[],
		delete_results: { changes: number }[],
		select_result: { rows: { domain: unknown }[] },
	) => {
		let insert_call = 0
		let delete_call = 0

		const insert_run = vi.fn(() => insert_results[insert_call++])
		const delete_run = vi.fn(() => delete_results[delete_call++])

		;(sqlite_client.prepare as any).mockImplementation(
			(sql: string) => {
				if (sql.includes('INSERT')) return { run: insert_run }
				if (sql.includes('DELETE')) return { run: delete_run }
				throw new Error(`Unexpected SQL: ${sql}`)
			},
		)
		;(sqlite_client.execute as any).mockReturnValue(select_result)

		return { insert_run, delete_run }
	}

	it('adds domains and returns correct count', async () => {
		setup_mocks([{ changes: 1 }, { changes: 1 }], [], {
			rows: [{ domain: 'domain1.com' }, { domain: 'domain2.com' }],
		})

		const result = await sync_blocked_domains({
			add: ['domain1.com', 'domain2.com'],
		})

		expect(result.added).toBe(2)
		expect(result.removed).toBe(0)
		expect(result.current).toEqual(['domain1.com', 'domain2.com'])
	})

	it('does not count duplicate adds', async () => {
		setup_mocks(
			[{ changes: 0 }], // INSERT OR IGNORE returns 0 for duplicates
			[],
			{ rows: [{ domain: 'existing.com' }] },
		)

		const result = await sync_blocked_domains({
			add: ['existing.com'],
		})

		expect(result.added).toBe(0)
	})

	it('removes domains and returns correct count', async () => {
		setup_mocks([], [{ changes: 1 }], { rows: [] })

		const result = await sync_blocked_domains({
			remove: ['spam.com'],
		})

		expect(result.removed).toBe(1)
		expect(result.added).toBe(0)
	})

	it('does not count non-existent removes', async () => {
		setup_mocks([], [{ changes: 0 }], { rows: [] })

		const result = await sync_blocked_domains({
			remove: ['nonexistent.com'],
		})

		expect(result.removed).toBe(0)
	})

	it('normalises domains to lowercase and trims whitespace', async () => {
		const { insert_run } = setup_mocks([{ changes: 1 }], [], {
			rows: [{ domain: 'spam.com' }],
		})

		await sync_blocked_domains({
			add: ['  SPAM.COM  '],
		})

		expect(insert_run).toHaveBeenCalledWith('spam.com')
	})

	it('skips empty strings after normalisation', async () => {
		const { insert_run } = setup_mocks([], [], { rows: [] })

		const result = await sync_blocked_domains({
			add: ['   ', ''],
		})

		// No INSERTs should be called
		expect(insert_run).not.toHaveBeenCalled()
		expect(result.added).toBe(0)
	})

	it('handles both add and remove in single call', async () => {
		setup_mocks([{ changes: 1 }], [{ changes: 1 }], {
			rows: [{ domain: 'new.com' }],
		})

		const result = await sync_blocked_domains({
			add: ['new.com'],
			remove: ['old.com'],
		})

		expect(result.added).toBe(1)
		expect(result.removed).toBe(1)
	})

	it('handles database errors gracefully for individual operations', async () => {
		let call_count = 0
		const insert_run = vi.fn(() => {
			call_count++
			if (call_count === 1) throw new Error('DB error')
			return { changes: 1 }
		})

		;(sqlite_client.prepare as any).mockImplementation(() => ({
			run: insert_run,
		}))
		;(sqlite_client.execute as any).mockReturnValue({
			rows: [{ domain: 'good.com' }],
		})

		const result = await sync_blocked_domains({
			add: ['bad.com', 'good.com'],
		})

		// Only the successful one is counted
		expect(result.added).toBe(1)
	})

	it('filters non-string values from result', async () => {
		setup_mocks([], [], {
			rows: [
				{ domain: 'valid.com' },
				{ domain: null },
				{ domain: 123 },
				{ domain: 'also-valid.com' },
			],
		})

		const result = await sync_blocked_domains({})

		expect(result.current).toEqual(['valid.com', 'also-valid.com'])
	})
})
