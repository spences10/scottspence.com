import { describe, expect, test } from 'vitest'
import { get_post_tags } from './post-tags'

describe('get_post_tags', () => {
  test('returns an object with a "tags" property', async () => {
    const result = await get_post_tags()
    expect(result).toBeDefined()
    expect(typeof result).toBe('object')
    expect(result).toHaveProperty('tags')
  }, 20000)

  test('returns an object with a "posts_by_tag" property', async () => {
    const result = await get_post_tags()
    expect(result).toBeDefined()
    expect(typeof result).toBe('object')
    expect(result).toHaveProperty('posts_by_tag')
  })

  test('each post is added to the correct tag array', async () => {
    const result = await get_post_tags()
    const { posts_by_tag } = result
    expect(posts_by_tag).toBeDefined()
    expect(typeof posts_by_tag).toBe('object')
    expect(posts_by_tag).not.toEqual({})
    Object.keys(posts_by_tag).forEach(tag => {
      posts_by_tag[tag].forEach(post => {
        expect(post.tags).toContain(tag)
      })
    })
  })

  test('ignores posts with "isPrivate" set to true', async () => {
    const result = await get_post_tags()
    const { posts_by_tag } = result
    expect(posts_by_tag).toBeDefined()
    expect(typeof posts_by_tag).toBe('object')
    expect(posts_by_tag).not.toEqual({})
    Object.keys(posts_by_tag).forEach(tag => {
      posts_by_tag[tag].forEach(post => {
        expect(post.isPrivate).toBeFalsy()
      })
    })
  })
})
