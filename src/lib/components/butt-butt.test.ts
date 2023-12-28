import { render } from '@testing-library/svelte'
import { describe, expect, it, vi } from 'vitest'
import ButtButt from './butt-butt.svelte'

globalThis.IntersectionObserver = vi.fn(() => ({
  observe: () => null,
  unobserve: () => null,
  disconnect: () => null,
})) as unknown as typeof globalThis.IntersectionObserver

vi.mock('IntersectionObserver', () => ({
  observe: () => null,
  unobserve: () => null,
  disconnect: () => null,
  mock: 'IntersectionObserver mock property',
}))

describe.skip('ButtButt', () => {
  it('should render', () => {
    const { getByText } = render(ButtButt)
    expect(
      getByText(
        'Looks like you have reached the bottom of this page!'
      )
    ).toBeTruthy()
  })

  it('should not display the butt image initially', () => {
    const { queryByAltText } = render(ButtButt)
    expect(queryByAltText('a cheeky butt')).toBeFalsy()
  })
})
