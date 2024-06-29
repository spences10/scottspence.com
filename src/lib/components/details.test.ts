import {
  fireEvent,
  render,
  screen,
} from '@testing-library/svelte/svelte5'
import { describe, expect, test } from 'vitest'
import Details from './details.svelte'

describe('Details', () => {
  test('renders with default props', async () => {
    render(Details)
    const button = screen.getByTestId('details-button')
    expect(button.textContent?.trim()).toBe('')
    expect(screen.queryByTestId('details-content')).toBeNull()
  })

  test('renders with custom button text', async () => {
    render(Details, { props: { buttonText: 'Show Details' } })
    const button = screen.getByTestId('details-button')
    expect(button.textContent?.trim()).toBe('Show Details')
  })

  test.skip('opens and closes details', async () => {
    const { container } = render(Details, {
      props: {
        buttonText: 'Show Details',
        // children: () => 'Test Content',
      },
    })

    console.log('=====================')
    console.log(container.innerHTML)
    console.log('=====================')

    const button = screen.getByTestId('details-button')
    expect(screen.queryByTestId('details-content')).toBeNull()

    // Open details
    await fireEvent.click(button)
    const content = screen.getByTestId('details-content')
    expect(content).toBeDefined()
    expect(content.textContent).toContain('Test Content')
    expect(button.textContent?.trim()).toBe('Close')

    // Close details
    await fireEvent.click(button)
    expect(screen.queryByTestId('details-content')).toBeNull()
    expect(button.textContent?.trim()).toBe('Show Details')
  })

  test('applies custom styles', async () => {
    render(Details, { props: { styles: 'custom-class' } })
    const button = screen.getByTestId('details-button')
    expect(button.classList.contains('custom-class')).toBe(true)
  })

  test.skip('renders children when open', async () => {
    render(Details, {
      props: {
        buttonText: 'Show Details',
        // children: () => 'Test Content',
      },
    })

    const button = screen.getByTestId('details-button')
    await fireEvent.click(button)

    const content = screen.getByTestId('details-content')
    expect(content.textContent).toContain('Test Content')
  })

  test.skip('respects initial isOpen prop', async () => {
    render(Details, {
      props: {
        buttonText: 'Show Details',
        isOpen: true,
        // children: () => 'Test Content',
      },
    })

    const content = screen.getByTestId('details-content')
    expect(content.textContent).toContain('Test Content')
    expect(
      screen.getByTestId('details-button').textContent?.trim(),
    ).toBe('Close')
  })
})
