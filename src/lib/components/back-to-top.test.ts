import { cleanup, fireEvent, render } from '@testing-library/svelte'
import { tick } from 'svelte'
import {
  afterEach,
  beforeAll,
  describe,
  expect,
  it,
  vi,
} from 'vitest'
import BackToTop from './back-to-top.svelte'

function renderBackToTop(offset = 0) {
  cleanup()
  const component = render(BackToTop)
  Object.defineProperty(window, 'scrollY', {
    value: offset,
    writable: true,
  })
  return component
}

describe('BackToTop', () => {
  afterEach(() => {
    window.scrollY = 0
  })

  beforeAll(() => {
    // Mock the animate function
    HTMLElement.prototype.animate = vi.fn().mockImplementation(() => {
      return {
        pause: vi.fn(),
        play: vi.fn(),
        finish: vi.fn(),
        cancel: vi.fn(),
        reverse: vi.fn(),
        // Add any other methods or properties used by the animations
      }
    })
  })

  it('should not render the button initially', () => {
    const { queryByLabelText } = renderBackToTop()
    expect(queryByLabelText('Back to top')).toBeFalsy()
  })

  it('should render the button when scrolling down', async () => {
    const { queryByTestId } = renderBackToTop(100)
    fireEvent.scroll(window)
    await new Promise(resolve => setTimeout(resolve, 400))

    const button = queryByTestId('back-to-top')
    expect(button).toBeTruthy()
  })

  it.skip('should not render the button when scrolling up after scrolling down', async () => {
    const { queryAllByLabelText } = renderBackToTop(1000)

    fireEvent.scroll(window)
    await tick()

    window.scrollY = 50
    fireEvent.scroll(window)
    await tick()

    const buttons = queryAllByLabelText('Back to top')
    expect(buttons.length).toBe(0)
  })

  it('should scroll to the top when the button is clicked', async () => {
    const { queryByLabelText } = renderBackToTop(1000)
    fireEvent.scroll(window)
    await new Promise(resolve => setTimeout(resolve, 0))

    const scrollToMock = vi.fn(options => {
      window.scrollY = options.top
    })
    window.scrollTo = scrollToMock

    const button = queryByLabelText('Back to top')
    await fireEvent.click(button as HTMLElement)

    expect(window.scrollY).toBe(0)
    expect(scrollToMock).toHaveBeenCalledWith({
      top: 0,
      behavior: 'smooth',
    })
  })
})
