import { describe, expect, it } from 'vitest'
import { get_current_page_visitors } from './get-current-page-visitors'

describe('get_current_page_visitors', () => {
  const content = [
    {
      pathname: '/page1',
      total: 10,
      content: [{ id: 1 }, { id: 2 }],
      referrers: [{ id: 3 }, { id: 4 }],
    },
    {
      pathname: '/page2',
      total: 5,
      content: [{ id: 5 }, { id: 6 }],
      referrers: [{ id: 7 }, { id: 8 }],
    },
    {
      pathname: '/page3',
      total: 15,
      content: [{ id: 9 }, { id: 10 }],
      referrers: [{ id: 11 }, { id: 12 }],
    },
  ]

  it('should return visitors for existing path', () => {
    const path = '/page1'
    const result = get_current_page_visitors(path, content)

    expect(result).toEqual({
      pathname: '/page1',
      total: 10,
      content: [{ id: 1 }, { id: 2 }],
      referrers: [{ id: 3 }, { id: 4 }],
    })
  })

  it('should return default visitors for non-existent path', () => {
    const path = '/page4'
    const result = get_current_page_visitors(path, content)

    expect(result).toEqual({
      total: 0,
      content: [],
      referrers: [],
    })
  })

  it('should return default visitors for undefined content', () => {
    const path = '/page1'
    const result = get_current_page_visitors(
      path,
      undefined as unknown as any[]
    )

    expect(result).toEqual({
      total: 0,
      content: [],
      referrers: [],
    })
  })

  it('should return default visitors for null content', () => {
    const path = '/page1'
    const result = get_current_page_visitors(
      path,
      null as unknown as any[]
    )

    expect(result).toEqual({
      total: 0,
      content: [],
      referrers: [],
    })
  })

  it('should return default visitors for non-array content', () => {
    const path = '/page1'
    const result = get_current_page_visitors(path, {
      foo: 'bar',
    } as unknown as any[])

    expect(result).toEqual({
      total: 0,
      content: [],
      referrers: [],
    })
  })
})
