import { describe, expect, it } from 'vitest'
import {
	aggregate_referrers,
	is_internal_referrer,
	normalise_referrer,
} from './referrer-normalisation'

describe('normalise_referrer', () => {
	it('groups Google variants', () => {
		expect(normalise_referrer('https://www.google.com/')).toBe('Google')
		expect(normalise_referrer('https://www.google.com.hk/')).toBe('Google')
		expect(normalise_referrer('https://www.google.co.uk/')).toBe('Google')
		expect(normalise_referrer('https://www.google.fr/')).toBe('Google')
		expect(
			normalise_referrer(
				'https://www.google.com/search?q=sveltekit',
			),
		).toBe('Google')
		expect(
			normalise_referrer(
				'android-app://com.google.android.googlequicksearchbox/',
			),
		).toBe('Google')
	})

	it('recognises other search engines', () => {
		expect(normalise_referrer('https://www.bing.com/')).toBe('Bing')
		expect(normalise_referrer('https://duckduckgo.com/')).toBe(
			'DuckDuckGo',
		)
		expect(normalise_referrer('https://search.brave.com/')).toBe(
			'Brave Search',
		)
		expect(normalise_referrer('https://kagi.com/')).toBe('Kagi')
	})

	it('returns hostname for AI assistants (no grouping needed)', () => {
		expect(normalise_referrer('https://chatgpt.com/')).toBe('chatgpt.com')
		expect(normalise_referrer('https://gemini.google.com/')).toBe(
			'gemini.google.com',
		)
		expect(normalise_referrer('https://poe.com/')).toBe('poe.com')
	})

	it('returns null for internal domains', () => {
		expect(normalise_referrer('https://scottspence.com/')).toBe(null)
		expect(normalise_referrer('https://www.spences10.dev/')).toBe(null)
		expect(normalise_referrer('https://ss10.me/')).toBe(null)
		expect(normalise_referrer('https://blog.scottspence.me/')).toBe(
			null,
		)
	})

	it('returns null for null/empty', () => {
		expect(normalise_referrer(null)).toBe(null)
		expect(normalise_referrer('')).toBe(null)
	})

	it('returns cleaned hostname for unknown sources', () => {
		expect(normalise_referrer('https://www.reddit.com/')).toBe(
			'reddit.com',
		)
		expect(normalise_referrer('https://news.ycombinator.com/')).toBe(
			'news.ycombinator.com',
		)
		expect(normalise_referrer('https://motion.dev/')).toBe('motion.dev')
	})
})

describe('is_internal_referrer', () => {
	it('identifies internal domains', () => {
		expect(is_internal_referrer('https://scottspence.com/')).toBe(true)
		expect(is_internal_referrer('https://www.scottspence.dev/')).toBe(
			true,
		)
		expect(is_internal_referrer('https://ss10.dev/foo')).toBe(true)
	})

	it('identifies subdomains of internal domains', () => {
		expect(is_internal_referrer('https://blog.scottspence.me/')).toBe(
			true,
		)
		expect(
			is_internal_referrer(
				'https://sveltekit-short-urls.scott.garden/',
			),
		).toBe(true)
	})

	it('rejects external domains', () => {
		expect(is_internal_referrer('https://google.com/')).toBe(false)
		expect(is_internal_referrer('https://github.com/')).toBe(false)
	})
})

describe('aggregate_referrers', () => {
	it('groups referrers by normalised source', () => {
		const raw = [
			{ referrer: 'https://www.google.com/', views: 100, visitors: 50 },
			{
				referrer: 'https://www.google.com.hk/',
				views: 20,
				visitors: 10,
			},
			{ referrer: 'https://duckduckgo.com/', views: 30, visitors: 25 },
		]
		const result = aggregate_referrers(raw)

		expect(result).toHaveLength(2)
		expect(result[0]).toEqual({
			referrer: 'Google',
			views: 120,
			visitors: 60,
		})
		expect(result[1]).toEqual({
			referrer: 'DuckDuckGo',
			views: 30,
			visitors: 25,
		})
	})

	it('filters out internal domains', () => {
		const raw = [
			{ referrer: 'https://www.google.com/', views: 100, visitors: 50 },
			{ referrer: 'https://scottspence.com/', views: 50, visitors: 30 },
		]
		const result = aggregate_referrers(raw)

		expect(result).toHaveLength(1)
		expect(result[0].referrer).toBe('Google')
	})

	it('sorts by visitors descending', () => {
		const raw = [
			{ referrer: 'https://duckduckgo.com/', views: 100, visitors: 10 },
			{ referrer: 'https://bing.com/', views: 50, visitors: 30 },
		]
		const result = aggregate_referrers(raw)

		expect(result[0].referrer).toBe('Bing')
		expect(result[1].referrer).toBe('DuckDuckGo')
	})
})
