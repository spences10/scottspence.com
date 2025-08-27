import { sqlite_client } from '$lib/sqlite/client'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { get_posts } from './posts'

const mockPosts = [
	{ id: 1, title: 'Post 1', date: '2023-06-14' },
	{ id: 2, title: 'Post 2', date: '2023-06-13' },
]

// Mock the sqlite_client
vi.mock('$lib/sqlite/client', () => ({
	sqlite_client: {
		execute: vi.fn(),
	},
}))

// Mock server cache
vi.mock('$lib/cache/server-cache', () => ({
	BYPASS_DB_READS: { posts: false },
	CACHE_DURATIONS: { posts: 30000 },
	get_from_cache: vi.fn(),
	set_cache: vi.fn(),
}))

beforeEach(() => {
	vi.resetAllMocks()
	// Reset the mock to have default behavior
	;(sqlite_client.execute as any).mockResolvedValue({ rows: [] })
})

afterEach(() => {
	vi.resetAllMocks()
})

test('get_posts fetches posts from database when cache is empty', async () => {
	const { get_from_cache, set_cache } = await import(
		'$lib/cache/server-cache'
	)

	;(sqlite_client.execute as any).mockResolvedValue({
		rows: mockPosts,
	})
	;(get_from_cache as any).mockReturnValue(null) // No cache

	const result = await get_posts()

	expect(sqlite_client.execute).toHaveBeenCalledWith(
		'SELECT * FROM posts ORDER BY date DESC;',
	)
	expect(set_cache).toHaveBeenCalledWith('posts', mockPosts)
	expect(result).toEqual({
		posts: mockPosts,
	})
})

test('get_posts returns cached posts when cache is valid', async () => {
	const { get_from_cache } = await import('$lib/cache/server-cache')

	const cachedPosts = [
		{ id: 1, title: 'Post 1', date: '2023-06-14' },
		{ id: 2, title: 'Post 2', date: '2023-06-13' },
	]

	;(get_from_cache as any).mockReturnValue(cachedPosts)

	const result = await get_posts()

	expect(sqlite_client.execute).not.toHaveBeenCalled()
	expect(result).toEqual({
		posts: cachedPosts,
	})
})

test('get_posts fetches new posts when cache is expired', async () => {
	const { get_from_cache, set_cache } = await import(
		'$lib/cache/server-cache'
	)

	;(sqlite_client.execute as any).mockResolvedValue({
		rows: mockPosts,
	})
	;(get_from_cache as any).mockReturnValue(null) // Cache expired

	const result = await get_posts()

	expect(sqlite_client.execute).toHaveBeenCalledWith(
		'SELECT * FROM posts ORDER BY date DESC;',
	)
	expect(set_cache).toHaveBeenCalledWith('posts', mockPosts)
	expect(result).toEqual({
		posts: mockPosts,
	})
})

test('get_posts handles database error', async () => {
	const { get_from_cache } = await import('$lib/cache/server-cache')

	;(sqlite_client.execute as any).mockRejectedValue(
		new Error('Database error'),
	)
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
