import * as posts_module from '$lib/posts'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { GET } from './+server'

vi.mock('$lib/posts', () => ({
	get_posts: vi.fn(),
}))

describe('POSTS GET endpoint', () => {
	beforeEach(() => {
		vi.resetAllMocks()
	})

	it('should return posts on successful fetch', async () => {
		const mock_posts = [
			{ slug: 'post1', title: 'Post 1', content: 'Content 1' },
			{ slug: 'post2', title: 'Post 2', content: 'Content 2' },
		]

		vi.mocked(posts_module.get_posts).mockResolvedValue({
			posts: mock_posts as any,
		})

		const response = await GET({ fetch: {} } as any)
		const data = await response.json()

		expect(response.status).toBe(200)
		expect(data).toEqual(mock_posts)
	})

	it('should return 500 error on fetch failure', async () => {
		vi.mocked(posts_module.get_posts).mockRejectedValue(
			new Error('Fetch failed'),
		)

		const console_spy = vi
			.spyOn(console, 'error')
			.mockImplementation(() => {})

		const response = await GET({ fetch: {} } as any)
		const data = await response.json()

		expect(response.status).toBe(500)
		expect(data).toEqual({ error: 'Failed to fetch posts' })
		expect(console_spy).toHaveBeenCalledWith(
			'Error fetching posts:',
			expect.any(Error),
		)

		console_spy.mockRestore()
	})
})
