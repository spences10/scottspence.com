import { describe, expect, it } from 'vitest'
import {
	format_period_stats,
	get_period_boundaries,
	get_period_label,
} from './period-stats.helpers'

describe('get_period_boundaries', () => {
	// Use a fixed date for testing: 2025-12-30 14:30:00
	const fixed_now = new Date('2025-12-30T14:30:00')

	it('returns today boundaries from midnight to now', () => {
		const { start, end } = get_period_boundaries('today', fixed_now)

		const start_date = new Date(start)
		expect(start_date.getHours()).toBe(0)
		expect(start_date.getMinutes()).toBe(0)
		expect(start_date.getDate()).toBe(30)

		expect(end).toBe(fixed_now.getTime())
	})

	it('returns yesterday boundaries (full day)', () => {
		const { start, end } = get_period_boundaries(
			'yesterday',
			fixed_now,
		)

		const start_date = new Date(start)
		const end_date = new Date(end)

		expect(start_date.getDate()).toBe(29)
		expect(start_date.getHours()).toBe(0)
		expect(end_date.getDate()).toBe(30)
		expect(end_date.getHours()).toBe(0)
	})

	it('returns week boundaries (7 days ago to now)', () => {
		const { start, end } = get_period_boundaries('week', fixed_now)

		const start_date = new Date(start)
		expect(start_date.getDate()).toBe(23) // 30 - 7 = 23
		expect(end).toBe(fixed_now.getTime())
	})

	it('returns month boundaries (30 days ago to now)', () => {
		const { start, end } = get_period_boundaries('month', fixed_now)

		const start_date = new Date(start)
		expect(start_date.getDate()).toBe(30) // 30 - 30 = Nov 30
		expect(start_date.getMonth()).toBe(10) // November (0-indexed)
		expect(end).toBe(fixed_now.getTime())
	})

	it('returns year boundaries (1 year ago to now)', () => {
		const { start, end } = get_period_boundaries('year', fixed_now)

		const start_date = new Date(start)
		expect(start_date.getFullYear()).toBe(2024)
		expect(start_date.getMonth()).toBe(11) // December
		expect(end).toBe(fixed_now.getTime())
	})
})

describe('get_period_label', () => {
	it('returns correct labels', () => {
		expect(get_period_label('today')).toBe('Today')
		expect(get_period_label('yesterday')).toBe('Yesterday')
		expect(get_period_label('week')).toBe('Last 7 days')
		expect(get_period_label('month')).toBe('Last 30 days')
		expect(get_period_label('year')).toBe('Last 12 months')
	})
})

describe('format_period_stats', () => {
	it('formats stats correctly with all data', () => {
		const result = format_period_stats(
			'today',
			'humans',
			{ views: 100, unique_visitors: 50 },
			{ views: 20, visitors: 5 },
			[{ path: '/', views: 50, visitors: 25 }],
			[{ country: 'GB', views: 30, visitors: 20 }],
			[{ browser: 'Chrome', views: 45, visitors: 30 }],
			[{ device_type: 'desktop', views: 60, visitors: 40 }],
			[{ referrer: 'https://google.com', views: 15, visitors: 10 }],
		)

		expect(result.period).toBe('today')
		expect(result.period_label).toBe('Today')
		expect(result.filter_mode).toBe('humans')
		expect(result.views).toBe(100)
		expect(result.unique_visitors).toBe(50)
		expect(result.bot_views).toBe(20)
		expect(result.bot_visitors).toBe(5)
		expect(result.top_pages).toHaveLength(1)
		expect(result.top_pages[0]).toEqual({
			path: '/',
			views: 50,
			visitors: 25,
		})
		expect(result.countries).toHaveLength(1)
		expect(result.countries[0]).toEqual({
			country: 'GB',
			views: 30,
			visitors: 20,
		})
		expect(result.browsers).toHaveLength(1)
		expect(result.devices).toHaveLength(1)
		expect(result.referrers).toHaveLength(1)
		expect(result.referrers[0]).toEqual({
			referrer: 'https://google.com',
			views: 15,
			visitors: 10,
		})
	})

	it('handles empty arrays gracefully', () => {
		const result = format_period_stats(
			'week',
			'all',
			{ views: 0, unique_visitors: 0 },
			{ views: 0, visitors: 0 },
			[],
			[],
			[],
			[],
			[],
		)

		expect(result.views).toBe(0)
		expect(result.unique_visitors).toBe(0)
		expect(result.top_pages).toEqual([])
		expect(result.countries).toEqual([])
		expect(result.browsers).toEqual([])
		expect(result.devices).toEqual([])
		expect(result.referrers).toEqual([])
	})

	it('preserves filter_mode in output', () => {
		const modes = ['humans', 'bots', 'all'] as const
		for (const mode of modes) {
			const result = format_period_stats(
				'today',
				mode,
				{ views: 10, unique_visitors: 5 },
				{ views: 0, visitors: 0 },
				[],
				[],
				[],
				[],
				[],
			)
			expect(result.filter_mode).toBe(mode)
		}
	})

	it('handles multiple entries in each category', () => {
		const result = format_period_stats(
			'month',
			'humans',
			{ views: 500, unique_visitors: 200 },
			{ views: 50, visitors: 10 },
			[
				{ path: '/', views: 200, visitors: 100 },
				{ path: '/posts/test', views: 150, visitors: 75 },
				{ path: '/about', views: 50, visitors: 25 },
			],
			[
				{ country: 'GB', views: 200, visitors: 100 },
				{ country: 'US', views: 150, visitors: 60 },
			],
			[
				{ browser: 'Chrome', views: 300, visitors: 120 },
				{ browser: 'Firefox', views: 100, visitors: 50 },
			],
			[
				{ device_type: 'desktop', views: 350, visitors: 140 },
				{ device_type: 'mobile', views: 150, visitors: 60 },
			],
			[
				{ referrer: 'https://google.com', views: 100, visitors: 50 },
				{ referrer: 'https://twitter.com', views: 50, visitors: 30 },
			],
		)

		expect(result.top_pages).toHaveLength(3)
		expect(result.countries).toHaveLength(2)
		expect(result.browsers).toHaveLength(2)
		expect(result.devices).toHaveLength(2)
		expect(result.referrers).toHaveLength(2)
	})
})
