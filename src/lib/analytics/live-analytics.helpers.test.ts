import { describe, expect, it } from 'vitest'
import {
	extract_session_metadata,
	format_live_stats_breakdown,
} from './live-analytics.helpers'

describe('extract_session_metadata', () => {
	it('extracts browser and device from Chrome UA', () => {
		const ua =
			'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
		const result = extract_session_metadata(ua, 'GB')

		expect(result.country).toBe('GB')
		expect(result.browser).toBe('Chrome')
		expect(result.device_type).toBe('desktop')
	})

	it('extracts browser and device from mobile Safari UA', () => {
		const ua =
			'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
		const result = extract_session_metadata(ua, 'US')

		expect(result.country).toBe('US')
		expect(result.browser).toBe('Safari')
		expect(result.device_type).toBe('mobile')
	})

	it('handles null user agent', () => {
		const result = extract_session_metadata(null, 'DE')

		expect(result.country).toBe('DE')
		expect(result.browser).toBeUndefined()
		expect(result.device_type).toBeUndefined()
	})

	it('handles null country', () => {
		const ua =
			'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0'
		const result = extract_session_metadata(ua, null)

		expect(result.country).toBeUndefined()
		expect(result.browser).toBe('Chrome')
	})

	it('handles both null', () => {
		const result = extract_session_metadata(null, null)

		expect(result.country).toBeUndefined()
		expect(result.browser).toBeUndefined()
		expect(result.device_type).toBeUndefined()
	})
})

describe('format_live_stats_breakdown', () => {
	it('transforms breakdown into stats page format', () => {
		const breakdown = {
			active_visitors: 5,
			countries: [{ country: 'GB', visitors: 3 }],
			browsers: [{ browser: 'Chrome', visitors: 4 }],
			devices: [{ device_type: 'desktop', visitors: 5 }],
			top_paths: [
				{ path: '/posts/test', views: 10, visitors: 5 },
				{ path: '/', views: 3, visitors: 2 },
			],
		}

		const result = format_live_stats_breakdown(breakdown)

		expect(result.active_visitors).toBe(5)
		expect(result.recent_visitors).toBe(5) // Same as active
		expect(result.active_pages).toEqual([
			{ path: '/posts/test', viewers: 5 },
			{ path: '/', viewers: 2 },
		])
		expect(result.countries).toEqual([{ country: 'GB', visitors: 3 }])
		expect(result.browsers).toEqual([
			{ browser: 'Chrome', visitors: 4 },
		])
		expect(result.devices).toEqual([
			{ device_type: 'desktop', visitors: 5 },
		])
		expect(result.top_paths).toEqual(breakdown.top_paths)
	})

	it('handles empty breakdown', () => {
		const breakdown = {
			active_visitors: 0,
			countries: [],
			browsers: [],
			devices: [],
			top_paths: [],
		}

		const result = format_live_stats_breakdown(breakdown)

		expect(result.active_visitors).toBe(0)
		expect(result.recent_visitors).toBe(0)
		expect(result.active_pages).toEqual([])
		expect(result.countries).toEqual([])
	})
})
