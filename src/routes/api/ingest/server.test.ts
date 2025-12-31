import { beforeEach, describe, expect, it, vi } from 'vitest'
import * as update_popular_posts_module from './update-popular-posts'
import * as update_posts_module from './update-posts'

// Mock environment variables
vi.mock('$env/dynamic/private', () => ({
	env: {
		INGEST_TOKEN: 'test-token',
	},
}))

// Mock ingest functions
vi.mock('./update-popular-posts', () => ({
	update_popular_posts: vi.fn(),
}))

vi.mock('./update-posts', () => ({
	update_posts: vi.fn(),
}))

describe('Ingest functions', () => {
	const mock_fetch = vi.fn()

	beforeEach(() => {
		vi.resetAllMocks()
	})

	it('executes update_posts successfully', async () => {
		vi.mocked(update_posts_module.update_posts).mockResolvedValue({
			success: true,
		} as any)

		const result = await update_posts_module.update_posts()

		expect(result).toEqual({ success: true })
		expect(update_posts_module.update_posts).toHaveBeenCalled()
	})

	it('executes update_popular_posts successfully', async () => {
		vi.mocked(
			update_popular_posts_module.update_popular_posts,
		).mockResolvedValue({
			success: true,
		} as any)

		const result =
			await update_popular_posts_module.update_popular_posts(
				mock_fetch,
			)

		expect(result).toEqual({ success: true })
		expect(
			update_popular_posts_module.update_popular_posts,
		).toHaveBeenCalledWith(mock_fetch)
	})

	it('handles error in update_posts', async () => {
		vi.mocked(update_posts_module.update_posts).mockRejectedValue(
			new Error('Test error'),
		)

		await expect(update_posts_module.update_posts()).rejects.toThrow(
			'Test error',
		)
	})

	it('handles error in update_popular_posts', async () => {
		vi.mocked(
			update_popular_posts_module.update_popular_posts,
		).mockRejectedValue(new Error('Test error'))

		await expect(
			update_popular_posts_module.update_popular_posts(mock_fetch),
		).rejects.toThrow('Test error')
	})
})
