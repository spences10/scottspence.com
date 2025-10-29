import { describe, expect, it } from 'vitest'
import { group_posts_by_tag } from './group-posts-by-tag'

describe('group_posts_by_tag', () => {
	it('should return correct tags and posts_by_tag', () => {
		const mock_posts = [
			{
				title: 'Post 1',
				tags: 'tag1,tag2',
				is_private: false,
				slug: 'post-1',
			},
			{
				title: 'Post 2',
				tags: 'tag2,tag3',
				is_private: false,
				slug: 'post-2',
			},
			{
				title: 'Post 3',
				tags: 'tag1,tag3',
				is_private: true,
				slug: 'post-3',
			},
			{
				title: 'Post 4',
				tags: 'tag1',
				is_private: false,
				slug: 'post-4',
			},
			{ title: 'Post 5', is_private: false, slug: 'post-5' },
		] as unknown as Post[]

		const result = group_posts_by_tag(mock_posts)

		// Check if tags are correct and sorted
		expect(result.tags).toEqual(['tag1', 'tag2', 'tag3'])

		// Check if posts_by_tag is correct
		expect(result.posts_by_tag.tag1).toHaveLength(2)
		expect(result.posts_by_tag.tag1[0].title).toBe('Post 1')
		expect(result.posts_by_tag.tag1[1].title).toBe('Post 4')

		expect(result.posts_by_tag.tag2).toHaveLength(2)
		expect(result.posts_by_tag.tag3).toHaveLength(1)

		// Check if private posts are excluded
		expect(
			result.posts_by_tag.tag1.find((p) => p.title === 'Post 3'),
		).toBeUndefined()

		// Check if posts without tags are excluded
		Object.values(result.posts_by_tag).forEach((posts) => {
			expect(posts.find((p) => p.title === 'Post 5')).toBeUndefined()
		})
	})

	it('should handle empty post list', () => {
		const result = group_posts_by_tag([])

		expect(result.tags).toEqual([])
		expect(result.posts_by_tag).toEqual({})
	})

	it('should handle posts with no tags', () => {
		const mock_posts = [
			{ title: 'Post 1', is_private: false, slug: 'post-1' },
			{ title: 'Post 2', is_private: false, slug: 'post-2' },
		] as unknown as Post[]

		const result = group_posts_by_tag(mock_posts)

		expect(result.tags).toEqual([])
		expect(result.posts_by_tag).toEqual({})
	})

	it('should group posts by multiple tags correctly', () => {
		const mock_posts = [
			{
				title: 'Multi Tag Post',
				tags: 'react,typescript,testing',
				is_private: false,
				slug: 'multi-tag',
			},
		] as unknown as Post[]

		const result = group_posts_by_tag(mock_posts)

		expect(result.tags).toEqual(['react', 'testing', 'typescript'])
		expect(result.posts_by_tag.react).toHaveLength(1)
		expect(result.posts_by_tag.typescript).toHaveLength(1)
		expect(result.posts_by_tag.testing).toHaveLength(1)

		// Same post should appear in all three tag groups
		expect(result.posts_by_tag.react[0].title).toBe('Multi Tag Post')
		expect(result.posts_by_tag.typescript[0].title).toBe(
			'Multi Tag Post',
		)
		expect(result.posts_by_tag.testing[0].title).toBe(
			'Multi Tag Post',
		)
	})

	it('should filter out all private posts', () => {
		const mock_posts = [
			{
				title: 'Private 1',
				tags: 'tag1',
				is_private: true,
				slug: 'private-1',
			},
			{
				title: 'Private 2',
				tags: 'tag2',
				is_private: true,
				slug: 'private-2',
			},
		] as unknown as Post[]

		const result = group_posts_by_tag(mock_posts)

		expect(result.tags).toEqual([])
		expect(result.posts_by_tag).toEqual({})
	})

	it('should handle posts with empty tag strings', () => {
		const mock_posts = [
			{
				title: 'Post 1',
				tags: '',
				is_private: false,
				slug: 'post-1',
			},
			{
				title: 'Post 2',
				tags: 'valid-tag',
				is_private: false,
				slug: 'post-2',
			},
		] as unknown as Post[]

		const result = group_posts_by_tag(mock_posts)

		// Only the valid tag should appear
		expect(result.tags).toEqual(['valid-tag'])
		expect(result.posts_by_tag['valid-tag']).toHaveLength(1)
	})
})
