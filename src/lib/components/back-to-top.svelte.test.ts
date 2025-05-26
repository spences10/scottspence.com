import { page } from '@vitest/browser/context'
import { flushSync, untrack } from 'svelte'
import { describe, expect, test } from 'vitest'
import { render } from 'vitest-browser-svelte'
import BackToTop from './back-to-top.svelte'

describe('BackToTop Component', () => {
	describe('Initial Rendering', () => {
		test('renders button with correct initial state', async () => {
			render(BackToTop)
			const button = page.getByTestId('back-to-top')

			await expect.element(button).toBeInTheDocument()
			await expect.element(button).toHaveTextContent('Back to top')
			await expect.element(button).toHaveClass('hide-button')
			await expect.element(button).not.toHaveClass('show-button')
		})

		test('has correct accessibility attributes', async () => {
			render(BackToTop)
			const button = page.getByTestId('back-to-top')

			await expect.element(button).toHaveAttribute('type', 'button')
			await expect
				.element(button)
				.toHaveAttribute('aria-label', 'Back to top')
		})

		test('has correct CSS classes', async () => {
			render(BackToTop)
			const button = page.getByTestId('back-to-top')

			await expect.element(button).toHaveClass('btn')
			await expect.element(button).toHaveClass('btn-circle')
			await expect.element(button).toHaveClass('btn-primary')
			await expect.element(button).toHaveClass('fixed')
			await expect.element(button).toHaveClass('bottom-4')
			await expect.element(button).toHaveClass('right-4')
		})
	})

	describe('Scroll Behavior', () => {
		test('shows button when scrolling down', async () => {
			render(BackToTop)
			const button = page.getByTestId('back-to-top')

			// Initially hidden
			await expect.element(button).toHaveClass('hide-button')

			// Simulate scroll down - need to ensure the scroll position is actually set
			Object.defineProperty(window, 'scrollY', {
				value: 100,
				writable: true,
				configurable: true,
			})

			// Dispatch scroll event
			window.dispatchEvent(new Event('scroll'))
			flushSync() // Ensure scroll event is processed

			// Button should become visible when scrolling down
			await expect.element(button).toHaveClass('show-button')
		})

		test('hides button when scrolling up', async () => {
			render(BackToTop)
			const button = page.getByTestId('back-to-top')

			// Scroll down first to show button
			Object.defineProperty(window, 'scrollY', {
				value: 200,
				writable: true,
				configurable: true,
			})
			window.dispatchEvent(new Event('scroll'))
			flushSync()

			await expect.element(button).toHaveClass('show-button')

			// Then scroll up
			Object.defineProperty(window, 'scrollY', {
				value: 100,
				writable: true,
				configurable: true,
			})
			window.dispatchEvent(new Event('scroll'))
			flushSync()

			// Button should be hidden when scrolling up
			await expect.element(button).toHaveClass('hide-button')
		})

		test('hides button when at top of page', async () => {
			render(BackToTop)
			const button = page.getByTestId('back-to-top')

			// Scroll down first
			window.scrollTo(0, 100)
			window.dispatchEvent(new Event('scroll'))

			// Then scroll to top
			window.scrollTo(0, 0)
			window.dispatchEvent(new Event('scroll'))

			await expect.element(button).toHaveClass('hide-button')
		})
	})

	describe('User Interactions', () => {
		test('scrolls to top when clicked', async () => {
			render(BackToTop)
			const button = page.getByTestId('back-to-top')

			// First scroll down to show the button
			Object.defineProperty(window, 'scrollY', {
				value: 500,
				writable: true,
				configurable: true,
			})
			window.dispatchEvent(new Event('scroll'))
			flushSync()

			await expect.element(button).toHaveClass('show-button')

			// Mock scrollTo to track calls
			const originalScrollTo = window.scrollTo
			let scrollToCalled = false
			window.scrollTo = ((
				options?: ScrollToOptions | number,
				y?: number,
			) => {
				if (typeof options === 'number' && options === 0 && y === 0) {
					scrollToCalled = true
				} else if (
					typeof options === 'object' &&
					options?.top === 0
				) {
					scrollToCalled = true
				}
			}) as typeof window.scrollTo

			// Click the button
			await button.click()

			// Check that scrollTo was called with top position
			expect(scrollToCalled).toBe(true)

			// Restore original scrollTo
			window.scrollTo = originalScrollTo
		})
	})

	describe('Rune State Logic', () => {
		test('scroll direction detection logic', async () => {
			// Test the core reactive logic without over-complicating
			let scrollState = $state({
				current: 0,
				previous: 0,
			})

			let shouldShowButton = $derived(
				scrollState.current > scrollState.previous &&
					scrollState.current > 0,
			)

			// Initial state
			expect(untrack(() => shouldShowButton)).toBe(false)

			// Scroll down
			scrollState.previous = scrollState.current
			scrollState.current = 100
			flushSync()
			expect(untrack(() => shouldShowButton)).toBe(true)

			// Scroll up
			scrollState.previous = scrollState.current
			scrollState.current = 50
			flushSync()
			expect(untrack(() => shouldShowButton)).toBe(false)

			// At top
			scrollState.previous = scrollState.current
			scrollState.current = 0
			flushSync()
			expect(untrack(() => shouldShowButton)).toBe(false)
		})
	})
})
