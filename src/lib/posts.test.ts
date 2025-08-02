import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { get_posts } from './posts'
import { turso_client } from './turso'

// Mock the turso_client
vi.mock('./turso', () => ({
	turso_client: vi.fn(),
}))

// Mock server cache
vi.mock('$lib/cache/server-cache', () => ({
	BYPASS_DB_READS: { posts: false },
	CACHE_DURATIONS: { posts: 30000 },
	get_from_cache: vi.fn(),
	set_cache: vi.fn(),
}))

beforeEach(() => {
	vi.clearAllMocks()
})

afterEach(() => {
	vi.clearAllMocks()
})

test('get_posts fetches posts from database when cache is empty', async () => {
	const { get_from_cache, set_cache } = await import(
		'$lib/cache/server-cache'
	)

	const mockExecute = vi.fn().mockResolvedValue({
		rows: [
			{ id: 1, title: 'Post 1', date: '2023-06-14' },
			{ id: 2, title: 'Post 2', date: '2023-06-13' },
		],
	})
	;(turso_client as any).mockReturnValue({ execute: mockExecute })
	;(get_from_cache as any).mockReturnValue(null) // No cache

	const result = await get_posts()

	expect(mockExecute).toHaveBeenCalledWith(
		'SELECT * FROM posts ORDER BY date DESC;',
	)
	expect(set_cache).toHaveBeenCalledWith('posts', [
		{ id: 1, title: 'Post 1', date: '2023-06-14' },
		{ id: 2, title: 'Post 2', date: '2023-06-13' },
	])
	expect(result).toEqual({
		posts: [
			{ id: 1, title: 'Post 1', date: '2023-06-14' },
			{ id: 2, title: 'Post 2', date: '2023-06-13' },
		],
	})
})

test('get_posts returns cached posts when cache is valid', async () => {
	const { get_from_cache } = await import('$lib/cache/server-cache')

	const cachedPosts = [
		{ id: 1, title: 'Post 1', date: '2023-06-14' },
		{ id: 2, title: 'Post 2', date: '2023-06-13' },
	]

	const mockExecute = vi.fn()
	;(turso_client as any).mockReturnValue({ execute: mockExecute })
	;(get_from_cache as any).mockReturnValue(cachedPosts)

	const result = await get_posts()

	expect(mockExecute).not.toHaveBeenCalled()
	expect(result).toEqual({
		posts: cachedPosts,
	})
})

test('get_posts fetches new posts when cache is expired', async () => {
	const { get_from_cache, set_cache } = await import(
		'$lib/cache/server-cache'
	)

	const mockExecute = vi.fn().mockResolvedValue({
		rows: [
			{ id: 1, title: 'Post 1', date: '2023-06-14' },
			{ id: 2, title: 'Post 2', date: '2023-06-13' },
		],
	})
	;(turso_client as any).mockReturnValue({ execute: mockExecute })
	;(get_from_cache as any).mockReturnValue(null) // Cache expired

	const result = await get_posts()

	expect(mockExecute).toHaveBeenCalledWith(
		'SELECT * FROM posts ORDER BY date DESC;',
	)
	expect(set_cache).toHaveBeenCalledWith('posts', [
		{ id: 1, title: 'Post 1', date: '2023-06-14' },
		{ id: 2, title: 'Post 2', date: '2023-06-13' },
	])
	expect(result).toEqual({
		posts: [
			{ id: 1, title: 'Post 1', date: '2023-06-14' },
			{ id: 2, title: 'Post 2', date: '2023-06-13' },
		],
	})
})

test('get_posts handles database error', async () => {
	const { get_from_cache } = await import('$lib/cache/server-cache')

	const mockExecute = vi
		.fn()
		.mockRejectedValue(new Error('Database error'))
	;(turso_client as any).mockReturnValue({ execute: mockExecute })
	;(get_from_cache as any).mockReturnValue(null) // No cache

	const consoleWarnSpy = vi
		.spyOn(console, 'warn')
		.mockImplementation(() => {})

	const result = await get_posts()

	expect(consoleWarnSpy).toHaveBeenCalledWith(
		'Database unavailable, returning empty posts:',
		'Database error',
	)
	expect(result).toEqual({ posts: [] })

	consoleWarnSpy.mockRestore()
})
