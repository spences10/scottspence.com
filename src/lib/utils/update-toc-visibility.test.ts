import { describe, expect, it } from 'vitest'
import { update_toc_visibility } from './update-toc-visibility'

describe('update_toc_visibility', () => {
  it('should return true when window.scrollY is less than end_of_copy.offsetTop + offset', () => {
    global.window.scrollY = 100
    const end_of_copy = { offsetTop: 200 }
    const offset = 100

    const result = update_toc_visibility(
      end_of_copy as HTMLElement,
      offset
    )

    expect(result).toBe(true)
  })

  it('should return false when window.scrollY is greater than or equal to end_of_copy.offsetTop + offset', () => {
    global.window.scrollY = 300
    const end_of_copy = { offsetTop: 200 }
    const offset = 0

    const result = update_toc_visibility(
      end_of_copy as HTMLElement,
      offset
    )

    expect(result).toBe(false)
  })
})
