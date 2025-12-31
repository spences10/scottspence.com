import { get_posts } from '$lib/posts'
import { expect, test, vi } from 'vitest'
import { get_post_tags } from './post-tags'

// Mock the get_posts function
vi.mock('$lib/posts', () => ({
	get_posts: vi.fn(),
}))

test('get_post_tags returns correct tags and posts_by_tag', async () => {
	// Mock the return value of get_posts
	;(get_posts as any).mockResolvedValue({
		posts: [
			{ title: 'Post 1', tags: 'tag1,tag2', is_private: false }, // Changed isPrivate to is_private
			{ title: 'Post 2', tags: 'tag2,tag3', is_private: false },
			{ title: 'Post 3', tags: 'tag1,tag3', is_private: true },
			{ title: 'Post 4', tags: 'tag1', is_private: false },
			{ title: 'Post 5', is_private: false }, // No tags
		],
	})

	const result = await get_post_tags()

	// Check if tags are correct and sorted
	expect(result.tags).toEqual(['tag1', 'tag2', 'tag3'])

	// Check if posts_by_tag is correct
	expect(result.posts_by_tag).toEqual({
		tag1: [
			{ title: 'Post 1', tags: 'tag1,tag2', is_private: false },
			{ title: 'Post 4', tags: 'tag1', is_private: false },
		],
		tag2: [
			{ title: 'Post 1', tags: 'tag1,tag2', is_private: false },
			{ title: 'Post 2', tags: 'tag2,tag3', is_private: false },
		],
		tag3: [{ title: 'Post 2', tags: 'tag2,tag3', is_private: false }],
	})

	// Check if private posts are excluded
	expect(result.posts_by_tag.tag1).not.toContainEqual(
		expect.objectContaining({ title: 'Post 3', is_private: true }),
	)

	// Check if posts without tags are excluded
	Object.values(result.posts_by_tag).forEach((posts) => {
		expect(posts).not.toContainEqual(
			expect.objectContaining({ title: 'Post 5' }),
		)
	})
})

test('get_post_tags handles empty post list', async () => {
	;(get_posts as any).mockResolvedValue({ posts: [] })

	const result = await get_post_tags()

	expect(result.tags).toEqual([])
	expect(result.posts_by_tag).toEqual({})
})
