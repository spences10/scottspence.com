import {
	afterEach,
	beforeEach,
	describe,
	expect,
	it,
	vi,
} from 'vitest'

// Mock the module to reset state between tests
let active_sessions_module: typeof import('./active-sessions')

describe('active-sessions', () => {
	beforeEach(async () => {
		vi.resetModules()
		active_sessions_module = await import('./active-sessions')
	})

	afterEach(() => {
		vi.restoreAllMocks()
	})

	describe('heartbeat', () => {
		it('records a session with metadata', () => {
			active_sessions_module.heartbeat('user-1', '/posts/test', {
				country: 'GB',
				browser: 'Chrome',
				device_type: 'desktop',
			})

			const sessions = active_sessions_module.get_all_sessions()
			expect(sessions).toHaveLength(1)
			expect(sessions[0]).toMatchObject({
				visitor_hash: 'user-1',
				path: '/posts/test',
				country: 'GB',
				browser: 'Chrome',
				device_type: 'desktop',
			})
		})

		it('preserves metadata when path changes', () => {
			active_sessions_module.heartbeat('user-1', '/posts/first', {
				country: 'GB',
				browser: 'Chrome',
				device_type: 'desktop',
			})

			// Navigate to new page - no metadata sent
			active_sessions_module.heartbeat(
				'user-1',
				'/posts/second',
				undefined,
			)

			const sessions = active_sessions_module.get_all_sessions()
			expect(sessions).toHaveLength(1)
			expect(sessions[0].path).toBe('/posts/second')
			expect(sessions[0].country).toBe('GB') // Preserved
			expect(sessions[0].browser).toBe('Chrome') // Preserved
		})

		it('updates metadata when provided', () => {
			active_sessions_module.heartbeat('user-1', '/posts/test', {
				country: 'GB',
				browser: 'Chrome',
				device_type: 'desktop',
			})

			active_sessions_module.heartbeat('user-1', '/posts/test', {
				country: 'US', // Changed
				browser: 'Firefox', // Changed
				device_type: 'mobile', // Changed
			})

			const sessions = active_sessions_module.get_all_sessions()
			expect(sessions[0].country).toBe('US')
			expect(sessions[0].browser).toBe('Firefox')
			expect(sessions[0].device_type).toBe('mobile')
		})
	})

	describe('get_session_breakdown', () => {
		it('aggregates countries correctly', () => {
			active_sessions_module.heartbeat('user-1', '/', {
				country: 'GB',
			})
			active_sessions_module.heartbeat('user-2', '/', {
				country: 'GB',
			})
			active_sessions_module.heartbeat('user-3', '/', {
				country: 'US',
			})

			const breakdown = active_sessions_module.get_session_breakdown()

			expect(breakdown.countries).toEqual([
				{ country: 'GB', visitors: 2 },
				{ country: 'US', visitors: 1 },
			])
		})

		it('aggregates browsers correctly', () => {
			active_sessions_module.heartbeat('user-1', '/', {
				browser: 'Chrome',
			})
			active_sessions_module.heartbeat('user-2', '/', {
				browser: 'Chrome',
			})
			active_sessions_module.heartbeat('user-3', '/', {
				browser: 'Safari',
			})

			const breakdown = active_sessions_module.get_session_breakdown()

			expect(breakdown.browsers).toEqual([
				{ browser: 'Chrome', visitors: 2 },
				{ browser: 'Safari', visitors: 1 },
			])
		})

		it('aggregates devices correctly', () => {
			active_sessions_module.heartbeat('user-1', '/', {
				device_type: 'desktop',
			})
			active_sessions_module.heartbeat('user-2', '/', {
				device_type: 'mobile',
			})
			active_sessions_module.heartbeat('user-3', '/', {
				device_type: 'mobile',
			})

			const breakdown = active_sessions_module.get_session_breakdown()

			expect(breakdown.devices).toEqual([
				{ device_type: 'mobile', visitors: 2 },
				{ device_type: 'desktop', visitors: 1 },
			])
		})

		it('aggregates paths correctly', () => {
			active_sessions_module.heartbeat('user-1', '/posts/a', {})
			active_sessions_module.heartbeat('user-2', '/posts/a', {})
			active_sessions_module.heartbeat('user-3', '/posts/b', {})

			const breakdown = active_sessions_module.get_session_breakdown()

			expect(breakdown.top_paths).toEqual([
				{ path: '/posts/a', views: 2, visitors: 2 },
				{ path: '/posts/b', views: 1, visitors: 1 },
			])
		})

		it('returns correct active_visitors count', () => {
			active_sessions_module.heartbeat('user-1', '/', {})
			active_sessions_module.heartbeat('user-2', '/', {})
			active_sessions_module.heartbeat('user-3', '/about', {})

			const breakdown = active_sessions_module.get_session_breakdown()

			expect(breakdown.active_visitors).toBe(3)
		})

		it('handles empty sessions', () => {
			const breakdown = active_sessions_module.get_session_breakdown()

			expect(breakdown.active_visitors).toBe(0)
			expect(breakdown.countries).toEqual([])
			expect(breakdown.browsers).toEqual([])
			expect(breakdown.devices).toEqual([])
			expect(breakdown.top_paths).toEqual([])
		})

		it('skips undefined metadata in aggregations', () => {
			active_sessions_module.heartbeat('user-1', '/', {
				country: 'GB',
			})
			active_sessions_module.heartbeat('user-2', '/', {}) // No metadata

			const breakdown = active_sessions_module.get_session_breakdown()

			expect(breakdown.countries).toEqual([
				{ country: 'GB', visitors: 1 },
			])
			expect(breakdown.active_visitors).toBe(2) // Both counted
		})
	})

	describe('remove_session', () => {
		it('removes a session', () => {
			active_sessions_module.heartbeat('user-1', '/', {})
			active_sessions_module.heartbeat('user-2', '/', {})

			active_sessions_module.remove_session('user-1')

			const sessions = active_sessions_module.get_all_sessions()
			expect(sessions).toHaveLength(1)
			expect(sessions[0].visitor_hash).toBe('user-2')
		})
	})

	describe('get_path_viewer_count', () => {
		it('counts viewers on specific path', () => {
			active_sessions_module.heartbeat('user-1', '/posts/a', {})
			active_sessions_module.heartbeat('user-2', '/posts/a', {})
			active_sessions_module.heartbeat('user-3', '/posts/b', {})

			expect(
				active_sessions_module.get_path_viewer_count('/posts/a'),
			).toBe(2)
			expect(
				active_sessions_module.get_path_viewer_count('/posts/b'),
			).toBe(1)
			expect(
				active_sessions_module.get_path_viewer_count('/posts/c'),
			).toBe(0)
		})
	})
})
