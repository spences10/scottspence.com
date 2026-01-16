import { describe, expect, it } from 'vitest'
import {
	build_engagement_stats,
	calculate_engagement_rate,
	format_engagement_rate,
	MIN_VIEWS_THRESHOLD,
	sort_engagement_stats,
	type EngagementStat,
} from './engagement-stats.helpers'

describe('calculate_engagement_rate', () => {
	it('returns 0 when views is 0', () => {
		expect(calculate_engagement_rate(10, 0)).toBe(0)
	})

	it('calculates correct percentage', () => {
		expect(calculate_engagement_rate(10, 100)).toBe(10)
		expect(calculate_engagement_rate(1, 100)).toBe(1)
		expect(calculate_engagement_rate(50, 100)).toBe(50)
	})

	it('handles decimal results', () => {
		expect(calculate_engagement_rate(1, 3)).toBeCloseTo(33.333, 2)
		expect(calculate_engagement_rate(7, 200)).toBeCloseTo(3.5, 5)
	})
})

describe('format_engagement_rate', () => {
	it('rounds rates >= 10 to whole numbers', () => {
		expect(format_engagement_rate(10)).toBe('10%')
		expect(format_engagement_rate(15.7)).toBe('16%')
		expect(format_engagement_rate(99.9)).toBe('100%')
	})

	it('shows one decimal for rates < 10', () => {
		expect(format_engagement_rate(9.9)).toBe('9.9%')
		expect(format_engagement_rate(1.23)).toBe('1.2%')
		expect(format_engagement_rate(0.5)).toBe('0.5%')
	})
})

describe('sort_engagement_stats', () => {
	const test_pages: EngagementStat[] = [
		{ path: '/a', clicks: 5, human_views: 100, engagement_rate: 5 },
		{ path: '/b', clicks: 20, human_views: 500, engagement_rate: 4 },
		{ path: '/c', clicks: 10, human_views: 50, engagement_rate: 20 },
	]

	it('sorts by clicks descending when mode is clicks', () => {
		const sorted = sort_engagement_stats(test_pages, 'clicks')
		expect(sorted[0].path).toBe('/b') // 20 clicks
		expect(sorted[1].path).toBe('/c') // 10 clicks
		expect(sorted[2].path).toBe('/a') // 5 clicks
	})

	it('sorts by rate descending when mode is rate', () => {
		const sorted = sort_engagement_stats(test_pages, 'rate')
		expect(sorted[0].path).toBe('/c') // 20%
		expect(sorted[1].path).toBe('/a') // 5%
		expect(sorted[2].path).toBe('/b') // 4%
	})

	it('does not mutate original array', () => {
		const original = [...test_pages]
		sort_engagement_stats(test_pages, 'clicks')
		expect(test_pages).toEqual(original)
	})

	it('handles empty array', () => {
		expect(sort_engagement_stats([], 'clicks')).toEqual([])
		expect(sort_engagement_stats([], 'rate')).toEqual([])
	})
})

describe('build_engagement_stats', () => {
	it('builds stats from clicks and views maps', () => {
		const clicks = new Map([
			['/a', 10],
			['/b', 5],
		])
		const views = new Map([
			['/a', 100],
			['/b', 50],
		])

		const result = build_engagement_stats(clicks, views, 'today')

		expect(result.total_clicks).toBe(15)
		expect(result.total_human_views).toBe(150)
		expect(result.overall_engagement_rate).toBe(10)
		expect(result.period_label).toBe('Today')
		expect(result.pages).toHaveLength(2)
	})

	it('filters out pages below minimum views threshold', () => {
		const clicks = new Map([
			['/high', 10],
			['/low', 2],
		])
		const views = new Map([
			['/high', 100],
			['/low', 3], // below MIN_VIEWS_THRESHOLD
		])

		const result = build_engagement_stats(clicks, views, 'today')

		expect(result.pages).toHaveLength(1)
		expect(result.pages[0].path).toBe('/high')
		// Total still includes all data
		expect(result.total_clicks).toBe(12)
		expect(result.total_human_views).toBe(103)
	})

	it('respects custom min_views parameter', () => {
		const clicks = new Map([
			['/a', 5],
			['/b', 3],
		])
		const views = new Map([
			['/a', 20],
			['/b', 15],
		])

		const result_high = build_engagement_stats(
			clicks,
			views,
			'today',
			25,
		)
		expect(result_high.pages).toHaveLength(0)

		const result_low = build_engagement_stats(
			clicks,
			views,
			'today',
			10,
		)
		expect(result_low.pages).toHaveLength(2)
	})

	it('respects max_results parameter', () => {
		const clicks = new Map([
			['/a', 10],
			['/b', 20],
			['/c', 15],
		])
		const views = new Map([
			['/a', 100],
			['/b', 100],
			['/c', 100],
		])

		const result = build_engagement_stats(
			clicks,
			views,
			'today',
			MIN_VIEWS_THRESHOLD,
			2,
		)
		expect(result.pages).toHaveLength(2)
	})

	it('sorts by rate by default', () => {
		const clicks = new Map([
			['/high-rate', 10],
			['/low-rate', 5],
		])
		const views = new Map([
			['/high-rate', 20], // 50% rate
			['/low-rate', 100], // 5% rate
		])

		const result = build_engagement_stats(clicks, views, 'today')
		expect(result.pages[0].path).toBe('/high-rate')
		expect(result.pages[0].engagement_rate).toBe(50)
	})

	it('handles missing views for clicked paths', () => {
		const clicks = new Map([['/clicked', 10]])
		const views = new Map<string, number>() // No views recorded

		const result = build_engagement_stats(clicks, views, 'today')

		expect(result.total_clicks).toBe(10)
		expect(result.total_human_views).toBe(0)
		expect(result.pages).toHaveLength(0) // Filtered out due to 0 views
	})

	it('returns correct period labels', () => {
		const clicks = new Map([['/a', 5]])
		const views = new Map([['/a', 50]])

		expect(
			build_engagement_stats(clicks, views, 'today').period_label,
		).toBe('Today')
		expect(
			build_engagement_stats(clicks, views, 'yesterday').period_label,
		).toBe('Yesterday')
		expect(
			build_engagement_stats(clicks, views, 'week').period_label,
		).toBe('This Week')
		expect(
			build_engagement_stats(clicks, views, 'month').period_label,
		).toBe('This Month')
		expect(
			build_engagement_stats(clicks, views, 'year').period_label,
		).toBe('This Year')
	})

	it('calculates engagement rate correctly for each page', () => {
		const clicks = new Map([['/test', 25]])
		const views = new Map([['/test', 500]])

		const result = build_engagement_stats(clicks, views, 'today')
		const page = result.pages[0]

		expect(page.clicks).toBe(25)
		expect(page.human_views).toBe(500)
		expect(page.engagement_rate).toBe(5)
	})
})
