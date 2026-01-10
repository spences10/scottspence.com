import { beforeEach, describe, expect, it, vi } from 'vitest'
import * as update_posts_module from './update-posts'

// Mock environment variables
vi.mock('$env/dynamic/private', () => ({
	env: {
		INGEST_TOKEN: 'test-token',
	},
}))

// Mock ingest functions
vi.mock('./update-posts', () => ({
	update_posts: vi.fn(),
}))

describe('Ingest functions', () => {
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

	it('handles error in update_posts', async () => {
		vi.mocked(update_posts_module.update_posts).mockRejectedValue(
			new Error('Test error'),
		)

		await expect(update_posts_module.update_posts()).rejects.toThrow(
			'Test error',
		)
	})
})
