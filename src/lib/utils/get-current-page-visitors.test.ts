import { describe, expect, it } from 'vitest'
import { get_current_page_visitors } from './get-current-page-visitors'

describe('get_current_page_visitors', () => {
  const content = [
    { pathname: '/page1', total: 10 },
    { pathname: '/page2', total: 5 },
    { pathname: '/page3', total: 15 },
  ]

  it('should return visitors for existing path', () => {
    const path = '/page1'
    const result = get_current_page_visitors(path, content)

    expect(result).toEqual({ pathname: '/page1', total: 10 })
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
})
