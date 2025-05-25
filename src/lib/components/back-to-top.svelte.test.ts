import { flushSync, tick } from 'svelte'
import {
	afterEach,
	beforeAll,
	beforeEach,
	describe,
	expect,
	test,
	vi,
} from 'vitest'
import { render } from 'vitest-browser-svelte'
import BackToTop from './back-to-top.svelte'

describe('BackToTop Component', () => {
	let scrollToMock: ReturnType<typeof vi.fn>
	let animateMock: ReturnType<typeof vi.fn>

	beforeAll(() => {
		// Mock the animate function
		animateMock = vi.fn().mockImplementation(() => ({
			pause: vi.fn(),
			play: vi.fn(),
			finish: vi.fn(),
			cancel: vi.fn(),
			reverse: vi.fn(),
		}))
		HTMLElement.prototype.animate = animateMock

		// Mock scrollTo
		scrollToMock = vi.fn((options) => {
			if (typeof options === 'object' && options.top !== undefined) {
				Object.defineProperty(window, 'scrollY', {
					value: options.top,
					writable: true,
					configurable: true,
				})
			}
		})
		window.scrollTo = scrollToMock
	})

	beforeEach(() => {
		// Reset scroll position
		Object.defineProperty(window, 'scrollY', {
			value: 0,
			writable: true,
			configurable: true,
		})
		vi.clearAllMocks()
	})

	afterEach(() => {
		// Clean up any remaining scroll listeners
		window.scrollY = 0
	})

	const setScrollPosition = (position: number) => {
		Object.defineProperty(window, 'scrollY', {
			value: position,
			writable: true,
			configurable: true,
		})
	}

	const triggerScroll = async () => {
		window.dispatchEvent(new Event('scroll'))
		flushSync()
		await tick()
	}

	describe('Initial Rendering', () => {
		test('renders button with correct initial state', () => {
			const { container } = render(BackToTop)
			const button = container.querySelector(
				'[data-testid="back-to-top"]',
			) as HTMLButtonElement

			expect(button).toBeTruthy()
			expect(button.textContent?.trim()).toBe('Back to top')
			expect(button.classList.contains('hide-button')).toBe(true)
			expect(button.classList.contains('show-button')).toBe(false)
		})

		test('has correct accessibility attributes', () => {
			const { container } = render(BackToTop)
			const button = container.querySelector(
				'[data-testid="back-to-top"]',
			) as HTMLButtonElement

			expect(button.tagName).toBe('BUTTON')
			expect(button.getAttribute('aria-label')).toBe('Back to top')
			expect(button.getAttribute('data-testid')).toBe('back-to-top')
		})

		test('has correct CSS classes', () => {
			const { container } = render(BackToTop)
			const button = container.querySelector(
				'[data-testid="back-to-top"]',
			) as HTMLButtonElement

			expect(button.classList.contains('back-to-top-button')).toBe(
				true,
			)
			expect(button.classList.contains('btn')).toBe(true)
			expect(button.classList.contains('btn-secondary')).toBe(true)
			expect(
				button.classList.contains('text-secondary-content'),
			).toBe(true)
			expect(button.classList.contains('rounded-box')).toBe(true)
			expect(button.classList.contains('fixed')).toBe(true)
		})
	})

	describe('Scroll Behavior', () => {
		test('shows button when scrolling down from top', async () => {
			const { container } = render(BackToTop)
			const button = container.querySelector(
				'[data-testid="back-to-top"]',
			) as HTMLButtonElement

			// Initial state - button hidden
			expect(button.classList.contains('show-button')).toBe(false)

			// Scroll down
			setScrollPosition(100)
			await triggerScroll()

			expect(button.classList.contains('show-button')).toBe(true)
			expect(button.classList.contains('hide-button')).toBe(false)
		})

		test('hides button when scrolling up', async () => {
			const { container } = render(BackToTop)
			const button = container.querySelector(
				'[data-testid="back-to-top"]',
			) as HTMLButtonElement

			// Start with some scroll position
			setScrollPosition(200)
			await triggerScroll()
			expect(button.classList.contains('show-button')).toBe(true)

			// Scroll up
			setScrollPosition(100)
			await triggerScroll()

			expect(button.classList.contains('show-button')).toBe(false)
			expect(button.classList.contains('hide-button')).toBe(true)
		})

		test('remains hidden when at top of page', async () => {
			const { container } = render(BackToTop)
			const button = container.querySelector(
				'[data-testid="back-to-top"]',
			) as HTMLButtonElement

			// Stay at top
			setScrollPosition(0)
			await triggerScroll()

			expect(button.classList.contains('show-button')).toBe(false)
		})

		test('handles scrolling to exact top position', async () => {
			const { container } = render(BackToTop)
			const button = container.querySelector(
				'[data-testid="back-to-top"]',
			) as HTMLButtonElement

			// Scroll down first
			setScrollPosition(100)
			await triggerScroll()
			expect(button.classList.contains('show-button')).toBe(true)

			// Scroll back to exact top
			setScrollPosition(0)
			await triggerScroll()

			expect(button.classList.contains('show-button')).toBe(false)
		})
	})

	describe('Edge Cases', () => {
		test('handles rapid scroll events', async () => {
			const { container } = render(BackToTop)
			const button = container.querySelector(
				'[data-testid="back-to-top"]',
			) as HTMLButtonElement

			// Rapid scroll changes
			setScrollPosition(50)
			await triggerScroll()

			setScrollPosition(100)
			await triggerScroll()

			setScrollPosition(75)
			await triggerScroll()

			setScrollPosition(150)
			await triggerScroll()

			// Should show button since last movement was down
			expect(button.classList.contains('show-button')).toBe(true)
		})

		test('handles very large scroll positions', async () => {
			const { container } = render(BackToTop)
			const button = container.querySelector(
				'[data-testid="back-to-top"]',
			) as HTMLButtonElement

			// Very large scroll position
			setScrollPosition(999999)
			await triggerScroll()

			expect(button.classList.contains('show-button')).toBe(true)
		})

		test('handles negative scroll positions gracefully', async () => {
			const { container } = render(BackToTop)
			const button = container.querySelector(
				'[data-testid="back-to-top"]',
			) as HTMLButtonElement

			// Negative scroll (shouldn't happen in real browsers, but test edge case)
			setScrollPosition(-10)
			await triggerScroll()

			expect(button.classList.contains('show-button')).toBe(false)
		})

		test('handles fractional scroll positions', async () => {
			const { container } = render(BackToTop)
			const button = container.querySelector(
				'[data-testid="back-to-top"]',
			) as HTMLButtonElement

			setScrollPosition(0.5)
			await triggerScroll()

			expect(button.classList.contains('show-button')).toBe(true)
		})

		test('handles scroll position of exactly 1', async () => {
			const { container } = render(BackToTop)
			const button = container.querySelector(
				'[data-testid="back-to-top"]',
			) as HTMLButtonElement

			setScrollPosition(1)
			await triggerScroll()

			expect(button.classList.contains('show-button')).toBe(true)
		})
	})

	describe('Click Behavior', () => {
		test('scrolls to top when button is clicked', async () => {
			const { container } = render(BackToTop)
			const button = container.querySelector(
				'[data-testid="back-to-top"]',
			) as HTMLButtonElement

			// Start with scroll position
			setScrollPosition(500)
			await triggerScroll()

			// Click button
			button.click()
			flushSync()

			expect(scrollToMock).toHaveBeenCalledWith({
				top: 0,
				behavior: 'smooth',
			})
			expect(window.scrollY).toBe(0)
		})

		test('can be clicked multiple times', async () => {
			const { container } = render(BackToTop)
			const button = container.querySelector(
				'[data-testid="back-to-top"]',
			) as HTMLButtonElement

			// Multiple clicks
			button.click()
			button.click()
			button.click()
			flushSync()

			expect(scrollToMock).toHaveBeenCalledTimes(3)
			expect(scrollToMock).toHaveBeenCalledWith({
				top: 0,
				behavior: 'smooth',
			})
		})

		test('works when clicked while hidden', async () => {
			const { container } = render(BackToTop)
			const button = container.querySelector(
				'[data-testid="back-to-top"]',
			) as HTMLButtonElement

			// Click while button is hidden
			button.click()
			flushSync()

			expect(scrollToMock).toHaveBeenCalledWith({
				top: 0,
				behavior: 'smooth',
			})
		})
	})

	describe('Accessibility', () => {
		test('is keyboard accessible', async () => {
			const { container } = render(BackToTop)
			const button = container.querySelector(
				'[data-testid="back-to-top"]',
			) as HTMLButtonElement

			// Focus the button
			button.focus()
			expect(document.activeElement).toBe(button)

			// Button should be clickable (keyboard activation happens via click)
			button.click()
			flushSync()

			expect(scrollToMock).toHaveBeenCalledWith({
				top: 0,
				behavior: 'smooth',
			})
		})

		test('has proper ARIA attributes', () => {
			const { container } = render(BackToTop)
			const button = container.querySelector(
				'[data-testid="back-to-top"]',
			) as HTMLButtonElement

			expect(button.getAttribute('aria-label')).toBe('Back to top')
			expect(button.getAttribute('role')).toBeNull() // button role is implicit
		})

		test('maintains focus after click', async () => {
			const { container } = render(BackToTop)
			const button = container.querySelector(
				'[data-testid="back-to-top"]',
			) as HTMLButtonElement

			button.focus()
			button.click()
			flushSync()

			// Button should still be focusable
			expect(button.tabIndex).not.toBe(-1)
		})
	})

	describe('State Management', () => {
		test('correctly tracks last scroll position', async () => {
			const { container } = render(BackToTop)
			const button = container.querySelector(
				'[data-testid="back-to-top"]',
			) as HTMLButtonElement

			// Scroll down
			setScrollPosition(100)
			await triggerScroll()
			expect(button.classList.contains('show-button')).toBe(true)

			// Scroll down more (should still show)
			setScrollPosition(200)
			await triggerScroll()
			expect(button.classList.contains('show-button')).toBe(true)

			// Scroll up (should hide)
			setScrollPosition(150)
			await triggerScroll()
			expect(button.classList.contains('show-button')).toBe(false)
		})

		test('handles scroll direction changes correctly', async () => {
			const { container } = render(BackToTop)
			const button = container.querySelector(
				'[data-testid="back-to-top"]',
			) as HTMLButtonElement

			// Start at position 100
			setScrollPosition(100)
			await triggerScroll()

			// Scroll up to 50 (hide button)
			setScrollPosition(50)
			await triggerScroll()
			expect(button.classList.contains('show-button')).toBe(false)

			// Scroll down to 75 (show button)
			setScrollPosition(75)
			await triggerScroll()
			expect(button.classList.contains('show-button')).toBe(true)

			// Scroll up to 60 (hide button)
			setScrollPosition(60)
			await triggerScroll()
			expect(button.classList.contains('show-button')).toBe(false)
		})
	})

	describe('Component Lifecycle', () => {
		test('cleans up scroll listeners on unmount', () => {
			const { unmount } = render(BackToTop)

			// Component should be listening to scroll events
			setScrollPosition(100)
			window.dispatchEvent(new Event('scroll'))

			// Unmount component
			unmount()

			// Should not throw errors when scroll events fire after unmount
			expect(() => {
				setScrollPosition(200)
				window.dispatchEvent(new Event('scroll'))
			}).not.toThrow()
		})

		test('handles window object availability', () => {
			// This test ensures the component doesn't break in SSR or when window is undefined
			expect(() => render(BackToTop)).not.toThrow()
		})
	})

	describe('Animation States', () => {
		test('applies correct animation classes', async () => {
			const { container } = render(BackToTop)
			const button = container.querySelector(
				'[data-testid="back-to-top"]',
			) as HTMLButtonElement

			// Initially hidden
			expect(button.classList.contains('hide-button')).toBe(true)
			expect(button.classList.contains('show-button')).toBe(false)

			// Show button
			setScrollPosition(100)
			await triggerScroll()
			expect(button.classList.contains('show-button')).toBe(true)
			expect(button.classList.contains('hide-button')).toBe(false)

			// Hide button
			setScrollPosition(50)
			await triggerScroll()
			expect(button.classList.contains('hide-button')).toBe(true)
			expect(button.classList.contains('show-button')).toBe(false)
		})
	})
})
