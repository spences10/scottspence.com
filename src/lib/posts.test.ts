import { isBefore, subDays } from 'date-fns'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { get_posts } from './posts'
import { turso_client } from './turso'

// Mock the turso_client
vi.mock('./turso', () => ({
	turso_client: vi.fn(),
}))

// Mock date-fns functions
vi.mock('date-fns', async () => {
	const actual = await vi.importActual('date-fns')
	return {
		...actual,
		subDays: vi.fn(),
		isBefore: vi.fn(),
	}
})

beforeEach(() => {
	vi.useFakeTimers()
	vi.setSystemTime(new Date(2023, 5, 15)) // June 15, 2023
})

afterEach(() => {
	vi.useRealTimers()
	vi.clearAllMocks()
})

test('get_posts fetches posts from database when cache is empty', async () => {
	const mockExecute = vi.fn().mockResolvedValue({
		rows: [
			{ id: 1, title: 'Post 1', date: '2023-06-14' },
			{ id: 2, title: 'Post 2', date: '2023-06-13' },
		],
	})
	;(turso_client as any).mockReturnValue({ execute: mockExecute })
	;(subDays as any).mockReturnValue(new Date(2023, 5, 14)) // June 14, 2023
	;(isBefore as any).mockReturnValue(false) // Cache is invalid

	const result = await get_posts()

	expect(mockExecute).toHaveBeenCalledWith(
		'SELECT * FROM posts ORDER BY date DESC;',
	)
	expect(result).toEqual({
		posts: [
			{ id: 1, title: 'Post 1', date: '2023-06-14' },
			{ id: 2, title: 'Post 2', date: '2023-06-13' },
		],
	})
})

test('get_posts returns cached posts when cache is valid', async () => {
	const mockExecute = vi.fn().mockResolvedValue({
		rows: [
			{ id: 1, title: 'Post 1', date: '2023-06-14' },
			{ id: 2, title: 'Post 2', date: '2023-06-13' },
		],
	})
	;(turso_client as any).mockReturnValue({ execute: mockExecute })
	;(subDays as any).mockReturnValue(new Date(2023, 5, 14)) // June 14, 2023
	;(isBefore as any).mockReturnValue(true) // Cache is valid

	// First call to populate cache
	await get_posts()

	// Reset mock to check if it's called again
	mockExecute.mockClear()

	// Second call should use cache
	const result = await get_posts()

	expect(mockExecute).not.toHaveBeenCalled()
	expect(result).toEqual({
		posts: [
			{ id: 1, title: 'Post 1', date: '2023-06-14' },
			{ id: 2, title: 'Post 2', date: '2023-06-13' },
		],
	})
})

test('get_posts fetches new posts when cache is expired', async () => {
	const mockExecute = vi.fn().mockResolvedValue({
		rows: [
			{ id: 1, title: 'Post 1', date: '2023-06-14' },
			{ id: 2, title: 'Post 2', date: '2023-06-13' },
		],
	})
	;(turso_client as any).mockReturnValue({ execute: mockExecute })
	;(subDays as any).mockReturnValue(new Date(2023, 5, 16)) // June 16, 2023
	;(isBefore as any).mockReturnValue(false) // Cache is invalid

	// First call to populate cache
	await get_posts()

	// Reset mock to check if it's called again
	mockExecute.mockClear()

	// Second call should fetch new posts
	const result = await get_posts()

	expect(mockExecute).toHaveBeenCalledWith(
		'SELECT * FROM posts ORDER BY date DESC;',
	)
	expect(result).toEqual({
		posts: [
			{ id: 1, title: 'Post 1', date: '2023-06-14' },
			{ id: 2, title: 'Post 2', date: '2023-06-13' },
		],
	})
})

test('get_posts handles database error', async () => {
	const mockExecute = vi
		.fn()
		.mockRejectedValue(new Error('Database error'))
	;(turso_client as any).mockReturnValue({ execute: mockExecute })
	;(subDays as any).mockReturnValue(new Date(2023, 5, 14)) // June 14, 2023
	;(isBefore as any).mockReturnValue(false) // Cache is invalid

	const consoleErrorSpy = vi
		.spyOn(console, 'error')
		.mockImplementation(() => {})

	const result = await get_posts()

	expect(consoleErrorSpy).toHaveBeenCalledWith(
		'Error fetching posts:',
		expect.any(Error),
	)
	expect(result).toEqual({ posts: [] })

	consoleErrorSpy.mockRestore()
})
