import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { update_posts } from './update-posts'
import * as turso_module from '$lib/turso'

// Mock the turso_client
vi.mock('$lib/turso', () => ({
  turso_client: vi.fn(),
}))

// Mock import.meta.glob
vi.mock('../../../../posts/**/*.md', () => ({
  '/posts/test-post-1.md': () =>
    Promise.resolve({
      metadata: {
        date: '2023-01-01',
        isPrivate: false,
        preview: 'Test preview 1',
        previewHtml: '<p>Test preview 1</p>',
        readingTime: {
          minutes: 5,
          text: '5 min read',
          time: 300,
          words: 1000,
        },
        tags: ['test', 'javascript'],
        title: 'Test Post 1',
      },
    }),
  '/posts/test-post-2.md': () =>
    Promise.resolve({
      metadata: {
        date: '2023-01-02',
        isPrivate: true,
        preview: 'Test preview 2',
        previewHtml: '<p>Test preview 2</p>',
        readingTime: {
          minutes: 3,
          text: '3 min read',
          time: 180,
          words: 600,
        },
        tags: ['test', 'typescript'],
        title: 'Test Post 2',
      },
    }),
}))

describe('update_posts function', () => {
  let mock_batch: ReturnType<typeof vi.fn>

  beforeEach(() => {
    vi.resetAllMocks()
    mock_batch = vi.fn().mockResolvedValue(undefined)
    vi.mocked(turso_module.turso_client).mockReturnValue({
      batch: mock_batch,
    } as any)

    // Mock the current date
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2023-06-15T12:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it.skip('should update posts successfully', async () => {
    const result = await update_posts()

    expect(result).toEqual({ message: 'Posts updated' })
    expect(mock_batch).toHaveBeenCalledTimes(1)
    expect(mock_batch).toHaveBeenCalledWith([
      expect.objectContaining({
        sql: expect.stringContaining('INSERT INTO posts'),
        args: [
          '2023-01-01T00:00:00.000Z',
          false,
          'Test preview 1',
          '<p>Test preview 1</p>',
          5,
          '5 min read',
          300,
          1000,
          'test-post-1',
          'test,javascript',
          'Test Post 1',
          '2023-06-15T12:00:00.000Z',
        ],
      }),
      expect.objectContaining({
        sql: expect.stringContaining('INSERT INTO posts'),
        args: [
          '2023-01-02T00:00:00.000Z',
          true,
          'Test preview 2',
          '<p>Test preview 2</p>',
          3,
          '3 min read',
          180,
          600,
          'test-post-2',
          'test,typescript',
          'Test Post 2',
          '2023-06-15T12:00:00.000Z',
        ],
      }),
    ])
  })

  it('should handle errors during batch update', async () => {
    const console_error_spy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {})
    mock_batch.mockRejectedValueOnce(new Error('Database error'))

    const result = await update_posts()

    expect(result).toBeUndefined()
    expect(console_error_spy).toHaveBeenCalledWith(
      'Error performing batch insert/update:',
      expect.any(Error),
    )

    console_error_spy.mockRestore()
  })
})
