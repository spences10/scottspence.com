import { beforeEach, describe, expect, it, vi } from 'vitest'
import { POST } from './+server'
import * as update_popular_posts_module from './update-popular-posts'
import * as update_posts_module from './update-posts'

// Mock environment variables
vi.mock('$env/dynamic/private', () => ({
  env: {
    INGEST_TOKEN: 'test-token',
  },
}))

// Mock task functions
vi.mock('./update-popular-posts', () => ({
  update_popular_posts: vi.fn(),
}))

vi.mock('./update-posts', () => ({
  update_posts: vi.fn(),
}))

describe('POST function in ingest server', () => {
  const mock_fetch = vi.fn()

  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('returns 401 if token is invalid', async () => {
    const request = new Request('http://example.com', {
      method: 'POST',
      body: JSON.stringify({
        token: 'invalid-token',
        task: 'update_posts',
      }),
    })

    const response = await POST({ request, fetch: mock_fetch } as any)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data).toEqual({ message: 'Unauthorized' })
  })

  it('executes update_posts task successfully', async () => {
    vi.mocked(update_posts_module.update_posts).mockResolvedValue({
      success: true,
    } as any)

    const request = new Request('http://example.com', {
      method: 'POST',
      body: JSON.stringify({
        token: 'test-token',
        task: 'update_posts',
      }),
    })

    const response = await POST({ request, fetch: mock_fetch } as any)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toEqual({ success: true })
    expect(update_posts_module.update_posts).toHaveBeenCalled()
    expect(mock_fetch).not.toHaveBeenCalled()
  })

  it('executes update_popular_posts task successfully', async () => {
    vi.mocked(
      update_popular_posts_module.update_popular_posts,
    ).mockResolvedValue({ success: true } as any)

    const request = new Request('http://example.com', {
      method: 'POST',
      body: JSON.stringify({
        token: 'test-token',
        task: 'update_popular_posts',
      }),
    })

    const response = await POST({ request, fetch: mock_fetch } as any)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toEqual({ success: true })
    expect(
      update_popular_posts_module.update_popular_posts,
    ).toHaveBeenCalledWith(mock_fetch)
  })

  it('returns 400 if task does not exist', async () => {
    const request = new Request('http://example.com', {
      method: 'POST',
      body: JSON.stringify({
        token: 'test-token',
        task: 'non_existent_task',
      }),
    })

    const response = await POST({ request, fetch: mock_fetch } as any)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data).toEqual({
      message: 'Specified task does not exist or is not a function',
    })
  })

  it('returns 500 if task execution throws an error', async () => {
    vi.mocked(update_posts_module.update_posts).mockRejectedValue(
      new Error('Test error'),
    )

    const request = new Request('http://example.com', {
      method: 'POST',
      body: JSON.stringify({
        token: 'test-token',
        task: 'update_posts',
      }),
    })

    const response = await POST({ request, fetch: mock_fetch } as any)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data).toEqual({
      message: 'Error processing the request',
      error: 'Test error',
      stack: expect.any(String),
    })
  })
})
