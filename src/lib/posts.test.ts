import { describe, expect, test } from 'vitest'
import { get_posts } from './posts'

describe('get_posts', () => {
  test('returns an object with a "posts" property', async () => {
    const result = await get_posts()
    expect(result).toBeDefined()
    expect(typeof result).toBe('object')
    expect(result).toHaveProperty('posts')
  }, 20000)

  test('each post contains expected properties', async () => {
    const { posts } = await get_posts()
    expect(posts).toBeInstanceOf(Array)
    const array_length = posts.length
    expect(posts).toHaveLength(array_length)
    expect(posts[0]).toHaveProperty('date')
    expect(posts[0]).toHaveProperty('title')
    expect(posts[0]).toHaveProperty('tags')
    expect(posts[0]).toHaveProperty('isPrivate')
    expect(posts[0]).toHaveProperty('readingTime')
    expect(posts[0].readingTime).toHaveProperty('text')
    expect(posts[0].readingTime).toHaveProperty('minutes')
    expect(posts[0].readingTime).toHaveProperty('time')
    expect(posts[0].readingTime).toHaveProperty('words')
    expect(posts[0]).toHaveProperty('preview')
    expect(posts[0]).toHaveProperty('previewHtml')
    expect(posts[0]).toHaveProperty('slug')
  })

  test('posts are sorted by date in descending order', async () => {
    const { posts } = await get_posts()
    expect(posts).toBeInstanceOf(Array)
    const array_length = posts.length
    expect(posts).toHaveLength(array_length)
    for (let i = 0; i < array_length - 1; i++) {
      const current = new Date(posts[i].date).getTime()
      const next = new Date(posts[i + 1].date).getTime()
      expect(current).toBeGreaterThanOrEqual(next)
    }
  })
})
