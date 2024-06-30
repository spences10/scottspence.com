import * as fathom_module from '$lib/fathom'
import * as turso_module from '$lib/turso'
import * as date_fns_module from 'date-fns'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import * as utils_module from '../ingest/utils'
import { GET } from './+server'

// Mock dependencies
vi.mock('$env/static/public', () => ({
  PUBLIC_FATHOM_ID: 'mock-fathom-id',
}))

vi.mock('$lib/turso', () => ({
  turso_client: vi.fn(),
}))

vi.mock('$lib/fathom', () => ({
  fetch_fathom_data: vi.fn(),
}))

vi.mock('date-fns', () => ({
  differenceInHours: vi.fn(),
  parseISO: vi.fn(),
}))

vi.mock('../ingest/utils', () => ({
  get_date_range: vi.fn(),
}))

describe('GET function in fetch-post-analytics server', () => {
  let mock_execute: ReturnType<typeof vi.fn>
  let mock_batch: ReturnType<typeof vi.fn>
  let mock_fetch: ReturnType<typeof vi.fn>

  beforeEach(() => {
    vi.resetAllMocks()
    mock_execute = vi.fn()
    mock_batch = vi.fn()
    mock_fetch = vi.fn()
    vi.mocked(turso_module.turso_client).mockReturnValue({
      execute: mock_execute,
      batch: mock_batch,
    } as any)
    vi.mocked(date_fns_module.differenceInHours).mockReturnValue(25) // Assume data is stale
    vi.mocked(date_fns_module.parseISO).mockReturnValue(new Date())
    vi.mocked(utils_module.get_date_range).mockReturnValue([
      '2023-01-01',
      '2023-12-31',
    ])
    vi.mocked(fathom_module.fetch_fathom_data).mockResolvedValue([
      {
        pageviews: '100',
        visits: '50',
        uniques: '30',
        avg_duration: '120',
        bounce_rate: '0.5',
      },
    ] as any)
  })

  it('returns 400 if no slug is provided', async () => {
    const url = new URL('http://example.com')
    const response = await GET({ url, fetch: mock_fetch } as any)

    expect(response.status).toBe(400)
    expect(await response.text()).toBe('No slug provided')
  })

  it('fetches new data when data is stale', async () => {
    const url = new URL('http://example.com?slug=test-post')
    mock_execute.mockResolvedValueOnce({
      rows: [{ last_updated: '2023-01-01' }],
    })
    mock_execute.mockResolvedValueOnce({
      rows: [
        { period: 'day', visits: 10 },
        { period: 'month', visits: 100 },
        { period: 'year', visits: 1000 },
      ],
    })

    const response = await GET({ url, fetch: mock_fetch } as any)
    const data = await response.json()

    expect(data).toEqual({
      daily_visits: { period: 'day', visits: 10 },
      monthly_visits: { period: 'month', visits: 100 },
      yearly_visits: { period: 'year', visits: 1000 },
    })

    expect(mock_execute).toHaveBeenCalledTimes(2)
    expect(mock_batch).toHaveBeenCalledTimes(1)
    expect(fathom_module.fetch_fathom_data).toHaveBeenCalledTimes(3) // Once for each period
  })

  it('uses cached data if available and not stale', async () => {
    const url = new URL('http://example.com?slug=test-post')
    vi.mocked(date_fns_module.differenceInHours).mockReturnValue(12) // Assume data is not stale

    mock_execute.mockResolvedValueOnce({
      rows: [{ last_updated: '2023-06-01' }],
    })
    mock_execute.mockResolvedValueOnce({
      rows: [
        { period: 'day', visits: 10 },
        { period: 'month', visits: 100 },
        { period: 'year', visits: 1000 },
      ],
    })

    const response = await GET({ url, fetch: mock_fetch } as any)
    const data = await response.json()

    expect(data).toEqual({
      daily_visits: { period: 'day', visits: 10 },
      monthly_visits: { period: 'month', visits: 100 },
      yearly_visits: { period: 'year', visits: 1000 },
    })

    expect(mock_execute).toHaveBeenCalledTimes(1) // Only called once to check staleness
    expect(mock_batch).not.toHaveBeenCalled()
    expect(fathom_module.fetch_fathom_data).not.toHaveBeenCalled()
  })
})
