import { PUBLIC_FATHOM_ID } from '$env/static/public'
import { fetch_fathom_data } from '$lib/fathom'
import { turso_client } from '$lib/turso/client'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { GET } from './+server'

import type { Client } from '@libsql/client'
import type { MockInstance } from 'vitest'

// Mock dependencies
vi.mock('$env/static/public', () => ({
  PUBLIC_FATHOM_ID: 'mock-fathom-id',
}))

vi.mock('$lib/fathom', () => ({
  fetch_fathom_data: vi.fn(),
}))

vi.mock('$lib/turso/client', () => ({
  turso_client: vi.fn(),
}))

describe('GET function in analytics server', () => {
  const mock_fetch = vi.fn()
  const mock_url = new URL('http://example.com/api/analytics')
  const mock_execute = vi.fn()
  let mocked_turso_client: MockInstance
  let mocked_fetch_fathom_data: MockInstance

  beforeEach(() => {
    vi.resetAllMocks()
    mocked_turso_client = vi.mocked(turso_client)
    mocked_fetch_fathom_data = vi.mocked(fetch_fathom_data)
    mocked_turso_client.mockReturnValue({
      execute: mock_execute,
    } as unknown as Client)
  })

  it('returns empty analytics when post does not exist', async () => {
    mock_url.searchParams.set('pathname', '/posts/non-existent')
    mock_execute.mockResolvedValue({ rows: [] })

    const response = await GET({
      url: mock_url,
      fetch: mock_fetch,
    } as any)
    const data = await response.json()

    expect(data).toEqual({
      analytics: [],
      message: 'Post not in posts table.',
    })
  })

  it('returns analytics data when post exists', async () => {
    mock_url.searchParams.set('pathname', '/posts/existing-post')
    mock_execute.mockResolvedValue({ rows: [{}] })
    mocked_fetch_fathom_data.mockResolvedValue([{ some: 'data' }])

    const response = await GET({
      url: mock_url,
      fetch: mock_fetch,
    } as any)
    const data = await response.json()

    expect(data).toEqual({
      analytics: [{ some: 'data' }],
    })
    expect(response.headers.get('X-Robots-Tag')).toBe(
      'noindex, nofollow',
    )
  })

  it('handles case when no analytics data is available', async () => {
    mock_url.searchParams.set('pathname', '/posts/no-analytics')
    mock_execute.mockResolvedValue({ rows: [{}] })
    mocked_fetch_fathom_data.mockResolvedValue([])

    const response = await GET({
      url: mock_url,
      fetch: mock_fetch,
    } as any)
    const data = await response.json()

    expect(data).toEqual({
      analytics: [],
      message:
        'No analytics data available for the given parameters.',
    })
  })

  it('uses default values when optional parameters are not provided', async () => {
    mock_url.searchParams.set('pathname', '/posts/default-params')
    mock_execute.mockResolvedValue({ rows: [{}] })
    mocked_fetch_fathom_data.mockResolvedValue([{ some: 'data' }])

    await GET({ url: mock_url, fetch: mock_fetch } as any)

    expect(mocked_fetch_fathom_data).toHaveBeenCalledWith(
      expect.anything(),
      'aggregations',
      expect.objectContaining({
        entity: 'pageview',
        entity_id: PUBLIC_FATHOM_ID,
        aggregates:
          'visits,uniques,pageviews,avg_duration,bounce_rate',
        field_grouping: 'pathname',
        filters:
          '[{"property": "pathname","operator": "is","value": "/posts/default-params"}]',
        date_grouping: 'day',
      }),
      'analytics_GET',
    )
  })

  it('uses provided optional parameters', async () => {
    mock_url.searchParams.set('pathname', '/posts/custom-params')
    mock_url.searchParams.set('date_grouping', 'week')
    mock_url.searchParams.set('date_from', '2023-01-01')
    mock_url.searchParams.set('date_to', '2023-12-31')
    mock_url.searchParams.set('sort_by', 'visits')
    mock_execute.mockResolvedValue({ rows: [{}] })
    mocked_fetch_fathom_data.mockResolvedValue([{ some: 'data' }])

    await GET({ url: mock_url, fetch: mock_fetch } as any)

    expect(mocked_fetch_fathom_data).toHaveBeenCalledWith(
      expect.anything(),
      'aggregations',
      expect.objectContaining({
        date_grouping: 'week',
        date_from: '2023-01-01',
        date_to: '2023-12-31',
        sort_by: 'visits',
      }),
      'analytics_GET',
    )
  })
})
