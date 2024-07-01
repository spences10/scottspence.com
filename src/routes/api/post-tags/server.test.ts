import * as post_tags_module from '$lib/post-tags'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { GET } from './+server'

vi.mock('$lib/post-tags', () => ({
  get_post_tags: vi.fn(),
}))

describe('POST-TAGS GET endpoint', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('should return tags and posts_by_tag on successful fetch', async () => {
    const mock_tags = ['tag1', 'tag2']
    const mock_posts_by_tag = {
      tag1: [{ slug: 'post1', title: 'Post 1' }],
      tag2: [{ slug: 'post2', title: 'Post 2' }],
    }

    vi.mocked(post_tags_module.get_post_tags).mockResolvedValue({
      tags: mock_tags,
      posts_by_tag: mock_posts_by_tag as any,
    })

    const response = await GET({ fetch: {} } as any)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toEqual({
      tags: mock_tags,
      posts_by_tag: mock_posts_by_tag,
    })
  })

  it('should return 500 error on fetch failure', async () => {
    vi.mocked(post_tags_module.get_post_tags).mockRejectedValue(
      new Error('Fetch failed'),
    )

    const console_spy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {})

    const response = await GET({ fetch: {} } as any)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data).toEqual({ error: 'Failed to fetch post tags' })
    expect(console_spy).toHaveBeenCalledWith(
      'Error fetching post tags:',
      expect.any(Error),
    )

    console_spy.mockRestore()
  })
})
