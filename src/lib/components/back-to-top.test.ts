import { fireEvent, render } from '@testing-library/svelte'
import { describe, expect, it, vi } from 'vitest'
import BackToTop from './back-to-top.svelte'

describe('BackToTop', () => {
  it('should not render the button initially', () => {
    const { queryByLabelText } = render(BackToTop)
    expect(queryByLabelText('Back to top')).toBeFalsy()
  })

  it('should render the button when scrolling down', async () => {
    const { queryAllByLabelText } = render(BackToTop)
    window.pageYOffset = 100
    fireEvent.scroll(window)
    await new Promise(resolve => setTimeout(resolve, 100))

    const buttons = queryAllByLabelText('Back to top')
    expect(buttons.length).toBeGreaterThanOrEqual(1)
  })

  it('should not render the button when scrolling up', async () => {
    const { queryAllByLabelText } = render(BackToTop)

    // Scroll down
    window.pageYOffset = 100
    fireEvent.scroll(window)
    await new Promise(resolve => setTimeout(resolve, 0))

    // Check if the button is rendered when scrolling down
    let buttons = queryAllByLabelText('Back to top')
    expect(buttons.length).toBeGreaterThanOrEqual(1)

    // Scroll up
    window.pageYOffset = 50
    fireEvent.scroll(window)
    await new Promise(resolve => setTimeout(resolve, 0)) // let Svelte update the DOM

    // Check if the button is not rendered when scrolling up
    buttons = queryAllByLabelText('Back to top')
    expect(buttons.).toBe(0)
  })

  it.skip('should scroll to the top when the button is clicked', async () => {
    const { queryByLabelText } = render(BackToTop)
    window.pageYOffset = 100
    fireEvent.scroll(window)
    await new Promise(resolve => setTimeout(resolve, 0)) // let Svelte update the DOM

    const scrollToSpy = vi.spyOn(window, 'scrollTo')
    const button = queryByLabelText('Back to top')
    await fireEvent.click(button)

    expect(scrollToSpy).toHaveBeenCalledWith({
      top: 0,
      behavior: 'smooth',
    })
  })
})
