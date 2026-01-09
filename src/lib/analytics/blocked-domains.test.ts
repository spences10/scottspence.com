import { sqlite_client } from '$lib/sqlite/client'
import {
	afterEach,
	beforeEach,
	describe,
	expect,
	it,
	vi,
} from 'vitest'
import {
	get_blocked_domains,
	get_blocked_domains_array,
	invalidate_blocked_domains_cache,
	is_blocked_referrer,
} from './blocked-domains'

vi.mock('$lib/sqlite/client', () => ({
	sqlite_client: {
		execute: vi.fn(),
	},
}))

vi.mock('$lib/cache/server-cache', () => ({
	CACHE_DURATIONS: {
		blocked_domains: 5 * 60 * 1000,
	},
}))

describe('blocked-domains', () => {
	beforeEach(() => {
		vi.clearAllMocks()
		// Reset cache by invalidating
		invalidate_blocked_domains_cache()
	})

	afterEach(() => {
		vi.useRealTimers()
	})

	describe('get_blocked_domains', () => {
		it('returns empty set when table does not exist', () => {
			;(sqlite_client.execute as any).mockImplementation(() => {
				throw new Error('no such table')
			})

			const result = get_blocked_domains()

			expect(result).toBeInstanceOf(Set)
			expect(result.size).toBe(0)
		})

		it('returns domains from database', () => {
			;(sqlite_client.execute as any).mockReturnValue({
				rows: [{ domain: 'spam.com' }, { domain: 'bad.site' }],
			})

			const result = get_blocked_domains()

			expect(result.has('spam.com')).toBe(true)
			expect(result.has('bad.site')).toBe(true)
		})

		it('normalises domains to lowercase', () => {
			;(sqlite_client.execute as any).mockReturnValue({
				rows: [{ domain: 'SPAM.COM' }, { domain: 'Bad.Site' }],
			})

			const result = get_blocked_domains()

			expect(result.has('spam.com')).toBe(true)
			expect(result.has('bad.site')).toBe(true)
			expect(result.has('SPAM.COM')).toBe(false)
		})

		it('filters non-string domains', () => {
			;(sqlite_client.execute as any).mockReturnValue({
				rows: [
					{ domain: 'valid.com' },
					{ domain: null },
					{ domain: 123 },
					{ domain: undefined },
				],
			})

			const result = get_blocked_domains()

			expect(result.has('valid.com')).toBe(true)
			expect(result.has('')).toBe(true) // null/undefined become empty string
			expect(result.size).toBe(2)
		})

		it('caches results and does not query again within TTL', () => {
			;(sqlite_client.execute as any).mockReturnValue({
				rows: [{ domain: 'cached.com' }],
			})

			get_blocked_domains()
			get_blocked_domains()
			get_blocked_domains()

			expect(sqlite_client.execute).toHaveBeenCalledTimes(1)
		})

		it('refreshes cache after TTL expires', () => {
			vi.useFakeTimers()
			;(sqlite_client.execute as any).mockReturnValue({
				rows: [{ domain: 'initial.com' }],
			})

			get_blocked_domains()
			expect(sqlite_client.execute).toHaveBeenCalledTimes(1)

			// Advance past TTL
			vi.advanceTimersByTime(6 * 60 * 1000)

			get_blocked_domains()
			expect(sqlite_client.execute).toHaveBeenCalledTimes(2)
		})
	})

	describe('get_blocked_domains_array', () => {
		it('returns array instead of set', () => {
			;(sqlite_client.execute as any).mockReturnValue({
				rows: [{ domain: 'spam.com' }, { domain: 'bad.site' }],
			})

			const result = get_blocked_domains_array()

			expect(Array.isArray(result)).toBe(true)
			expect(result).toContain('spam.com')
			expect(result).toContain('bad.site')
		})
	})

	describe('is_blocked_referrer', () => {
		beforeEach(() => {
			;(sqlite_client.execute as any).mockReturnValue({
				rows: [{ domain: 'spam.com' }, { domain: 'tracking.net' }],
			})
		})

		it('returns false for null referrer', () => {
			expect(is_blocked_referrer(null)).toBe(false)
		})

		it('returns true when referrer contains blocked domain', () => {
			expect(is_blocked_referrer('https://spam.com/page')).toBe(true)
			expect(is_blocked_referrer('https://sub.spam.com')).toBe(true)
		})

		it('matches case-insensitively', () => {
			expect(is_blocked_referrer('https://SPAM.COM/page')).toBe(true)
			expect(is_blocked_referrer('https://Spam.Com')).toBe(true)
		})

		it('returns false for non-blocked referrers', () => {
			expect(is_blocked_referrer('https://google.com')).toBe(false)
			expect(is_blocked_referrer('https://example.com')).toBe(false)
		})

		it('matches substring patterns (intentional)', () => {
			// 'notspam.com' contains 'spam.com' - this IS blocked (substring match)
			expect(is_blocked_referrer('https://notspam.com')).toBe(true)
			// Subdomain matching works
			expect(
				is_blocked_referrer('https://something.tracking.net/path'),
			).toBe(true)
		})
	})

	describe('invalidate_blocked_domains_cache', () => {
		it('forces cache refresh on next call', () => {
			;(sqlite_client.execute as any).mockReturnValue({
				rows: [{ domain: 'initial.com' }],
			})

			get_blocked_domains()
			expect(sqlite_client.execute).toHaveBeenCalledTimes(1)

			// Without invalidation, cache would be used
			get_blocked_domains()
			expect(sqlite_client.execute).toHaveBeenCalledTimes(1)

			// Invalidate and call again
			invalidate_blocked_domains_cache()
			get_blocked_domains()
			expect(sqlite_client.execute).toHaveBeenCalledTimes(2)
		})
	})
})
