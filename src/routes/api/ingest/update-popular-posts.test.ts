import * as fathom_module from '$lib/fathom'
import * as turso_module from '$lib/turso'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { update_popular_posts } from './update-popular-posts'
import * as utils_module from './utils'

// Mock dependencies
vi.mock('$env/static/public', () => ({
  PUBLIC_FATHOM_ID: 'mock-fathom-id',
}))

vi.mock('$lib/fathom', () => ({
  fetch_fathom_data: vi.fn(),
}))

vi.mock('$lib/turso', () => ({
  turso_client: vi.fn(),
}))

vi.mock('./utils', () => ({
  get_date_range: vi.fn(),
}))

describe('update_popular_posts function', () => {
  let mock_fetch: ReturnType<typeof vi.fn>
  let mock_execute: ReturnType<typeof vi.fn>
  let mock_batch: ReturnType<typeof vi.fn>

  beforeEach(() => {
    vi.resetAllMocks()
    mock_fetch = vi.fn()
    mock_execute = vi.fn()
    mock_batch = vi.fn()
    vi.mocked(turso_module.turso_client).mockReturnValue({
      execute: mock_execute,
      batch: mock_batch,
    } as any)
    vi.mocked(utils_module.get_date_range).mockReturnValue([
      '2023-01-01',
      '2023-12-31',
    ])
    vi.mocked(fathom_module.fetch_fathom_data).mockResolvedValue([
      { pathname: '/post1', pageviews: '100', visits: '50' },
      { pathname: '/post2', pageviews: '200', visits: '100' },
    ] as any)
  })

  it('fetches data for all periods and inserts into Turso DB', async () => {
    const result = await update_popular_posts(mock_fetch as Fetch)

    expect(result).toEqual({ message: 'Popular posts updated' })

    expect(fathom_module.fetch_fathom_data).toHaveBeenCalledTimes(3) // Once for each period
    expect(mock_batch).toHaveBeenCalledTimes(3) // Once for each period

    // Check if fetch_fathom_data was called with correct parameters for each period
    ;['day', 'month', 'year'].forEach((period, index) => {
      expect(fathom_module.fetch_fathom_data).toHaveBeenNthCalledWith(
        index + 1,
        mock_fetch,
        'aggregations',
        expect.objectContaining({
          entity: 'pageview',
          entity_id: 'mock-fathom-id',
          aggregates: 'visits,pageviews',
          field_grouping: 'pathname',
          date_from: '2023-01-01',
          date_to: '2023-12-31',
          sort_by: 'pageviews:desc',
          limit: '100',
        }),
        `fetch_popular_posts_${period}`,
      )
    })

    // Check if batch was called with correct parameters for each period
    ;['day', 'month', 'year'].forEach((period, index) => {
      expect(mock_batch).toHaveBeenNthCalledWith(
        index + 1,
        expect.arrayContaining([
          expect.objectContaining({
            sql: expect.stringContaining('INSERT INTO popular_posts'),
            args: expect.arrayContaining(['/post1', 100, 50, period]),
          }),
          expect.objectContaining({
            sql: expect.stringContaining('INSERT INTO popular_posts'),
            args: expect.arrayContaining([
              '/post2',
              200,
              100,
              period,
            ]),
          }),
        ]),
      )
    })
  })

  it('handles errors when fetching data or inserting into DB', async () => {
    const console_spy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {})
    vi.mocked(fathom_module.fetch_fathom_data).mockRejectedValue(
      new Error('Fathom API error'),
    )

    const result = await update_popular_posts(mock_fetch as Fetch)

    expect(result).toEqual({ message: 'Popular posts updated' })
    expect(console_spy).toHaveBeenCalledTimes(3)
    expect(console_spy).toHaveBeenCalledWith(
      'Error fetching from Fathom or inserting into Turso DB:',
      expect.any(Error),
    )

    console_spy.mockRestore()
  })
})
