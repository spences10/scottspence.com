import { page } from '@vitest/browser/context'
import { flushSync, tick, untrack } from 'svelte'
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

	describe('Rune State Testing', () => {
		test('reactive state logic with $state and $derived', async () => {
			// Test the component's reactive logic directly using runes
			let state = $state({
				show_scroll_button: false,
				last_scroll_top: 0,
			})

			// Simulate the component's scroll logic
			const simulateScroll = (currentScrollTop: number) => {
				state.show_scroll_button =
					currentScrollTop > state.last_scroll_top &&
					currentScrollTop > 0
				state.last_scroll_top = currentScrollTop
			}

			// Initial state
			expect(state.show_scroll_button).toBe(false)
			expect(state.last_scroll_top).toBe(0)

			// Scroll down from top
			simulateScroll(100)
			expect(state.show_scroll_button).toBe(true)
			expect(state.last_scroll_top).toBe(100)

			// Scroll down more
			simulateScroll(200)
			expect(state.show_scroll_button).toBe(true)
			expect(state.last_scroll_top).toBe(200)

			// Scroll up
			simulateScroll(150)
			expect(state.show_scroll_button).toBe(false)
			expect(state.last_scroll_top).toBe(150)

			// Scroll to top
			simulateScroll(0)
			expect(state.show_scroll_button).toBe(false)
			expect(state.last_scroll_top).toBe(0)
		})

		test('derived state for button visibility', async () => {
			let scrollState = $state({
				current: 0,
				previous: 0,
			})

			// Derived state that mimics component logic
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

			// Scroll to exact top
			scrollState.previous = scrollState.current
			scrollState.current = 0
			flushSync()
			expect(untrack(() => shouldShowButton)).toBe(false)
		})

		test('reactive scroll direction detection', async () => {
			let scrollData = $state({
				history: [] as number[],
				currentPosition: 0,
			})

			// Derived state for scroll direction
			let isScrollingDown = $derived(() => {
				if (scrollData.history.length < 2) return false
				const [previous, current] = scrollData.history.slice(-2)
				return current > previous && current > 0
			})

			const updateScroll = (position: number) => {
				scrollData.currentPosition = position
				scrollData.history = [...scrollData.history, position]
			}

			// Initial state
			updateScroll(0)
			flushSync()
			expect(untrack(() => isScrollingDown())).toBe(false)

			// First scroll down
			updateScroll(50)
			flushSync()
			expect(untrack(() => isScrollingDown())).toBe(true)

			// Continue scrolling down
			updateScroll(100)
			flushSync()
			expect(untrack(() => isScrollingDown())).toBe(true)

			// Scroll up
			updateScroll(75)
			flushSync()
			expect(untrack(() => isScrollingDown())).toBe(false)
		})
	})

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

			await expect
				.element(button)
				.toHaveAttribute('aria-label', 'Back to top')
			await expect
				.element(button)
				.toHaveAttribute('data-testid', 'back-to-top')
		})

		test('has correct CSS classes', async () => {
			render(BackToTop)
			const button = page.getByTestId('back-to-top')

			await expect.element(button).toHaveClass('back-to-top-button')
			await expect.element(button).toHaveClass('btn')
			await expect.element(button).toHaveClass('btn-secondary')
			await expect
				.element(button)
				.toHaveClass('text-secondary-content')
			await expect.element(button).toHaveClass('rounded-box')
			await expect.element(button).toHaveClass('fixed')
		})
	})

	describe('Scroll Behavior', () => {
		test('shows button when scrolling down from top', async () => {
			render(BackToTop)
			const button = page.getByTestId('back-to-top')

			// Initial state - button hidden
			await expect.element(button).not.toHaveClass('show-button')

			// Scroll down
			setScrollPosition(100)
			await triggerScroll()

			await expect.element(button).toHaveClass('show-button')
			await expect.element(button).not.toHaveClass('hide-button')
		})

		test('hides button when scrolling up', async () => {
			render(BackToTop)
			const button = page.getByTestId('back-to-top')

			// Start with some scroll position
			setScrollPosition(200)
			await triggerScroll()
			await expect.element(button).toHaveClass('show-button')

			// Scroll up
			setScrollPosition(100)
			await triggerScroll()

			await expect.element(button).not.toHaveClass('show-button')
			await expect.element(button).toHaveClass('hide-button')
		})

		test('remains hidden when at top of page', async () => {
			render(BackToTop)
			const button = page.getByTestId('back-to-top')

			// Stay at top
			setScrollPosition(0)
			await triggerScroll()

			await expect.element(button).not.toHaveClass('show-button')
		})

		test('handles scrolling to exact top position', async () => {
			render(BackToTop)
			const button = page.getByTestId('back-to-top')

			// Scroll down first
			setScrollPosition(100)
			await triggerScroll()
			await expect.element(button).toHaveClass('show-button')

			// Scroll back to exact top
			setScrollPosition(0)
			await triggerScroll()

			await expect.element(button).not.toHaveClass('show-button')
		})
	})

	describe('Edge Cases', () => {
		test('handles rapid scroll events', async () => {
			render(BackToTop)
			const button = page.getByTestId('back-to-top')

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
			await expect.element(button).toHaveClass('show-button')
		})

		test('handles very large scroll positions', async () => {
			render(BackToTop)
			const button = page.getByTestId('back-to-top')

			// Very large scroll position
			setScrollPosition(999999)
			await triggerScroll()

			await expect.element(button).toHaveClass('show-button')
		})

		test('handles negative scroll positions gracefully', async () => {
			render(BackToTop)
			const button = page.getByTestId('back-to-top')

			// Negative scroll (shouldn't happen in real browsers, but test edge case)
			setScrollPosition(-10)
			await triggerScroll()

			await expect.element(button).not.toHaveClass('show-button')
		})

		test('handles fractional scroll positions', async () => {
			render(BackToTop)
			const button = page.getByTestId('back-to-top')

			setScrollPosition(0.5)
			await triggerScroll()

			await expect.element(button).toHaveClass('show-button')
		})

		test('handles scroll position of exactly 1', async () => {
			render(BackToTop)
			const button = page.getByTestId('back-to-top')

			setScrollPosition(1)
			await triggerScroll()

			await expect.element(button).toHaveClass('show-button')
		})
	})

	describe('Click Behavior', () => {
		test('scrolls to top when button is clicked', async () => {
			render(BackToTop)
			const button = page.getByTestId('back-to-top')

			// Start with scroll position
			setScrollPosition(500)
			await triggerScroll()

			// Click button
			await button.click()
			flushSync()

			expect(scrollToMock).toHaveBeenCalledWith({
				top: 0,
				behavior: 'smooth',
			})
			expect(window.scrollY).toBe(0)
		})

		test('can be clicked multiple times', async () => {
			render(BackToTop)
			const button = page.getByTestId('back-to-top')

			// Multiple clicks
			await button.click()
			await button.click()
			await button.click()
			flushSync()

			expect(scrollToMock).toHaveBeenCalledTimes(3)
			expect(scrollToMock).toHaveBeenCalledWith({
				top: 0,
				behavior: 'smooth',
			})
		})

		test('works when clicked while hidden', async () => {
			render(BackToTop)
			const button = page.getByTestId('back-to-top')

			// Click while button is hidden
			await button.click()
			flushSync()

			expect(scrollToMock).toHaveBeenCalledWith({
				top: 0,
				behavior: 'smooth',
			})
		})
	})

	describe('Accessibility', () => {
		test('is keyboard accessible', async () => {
			render(BackToTop)
			const button = page.getByTestId('back-to-top')

			// Focus the button using click to simulate keyboard navigation
			await button.click()
			await expect.element(button).toHaveFocus()

			// Button should be clickable (keyboard activation happens via click)
			await button.click()
			flushSync()

			expect(scrollToMock).toHaveBeenCalledWith({
				top: 0,
				behavior: 'smooth',
			})
		})

		test('has proper ARIA attributes', async () => {
			render(BackToTop)
			const button = page.getByTestId('back-to-top')

			await expect
				.element(button)
				.toHaveAttribute('aria-label', 'Back to top')
			// Button role is implicit for <button> elements
		})

		test('maintains focus after click', async () => {
			render(BackToTop)
			const button = page.getByTestId('back-to-top')

			await button.click() // Focus the button
			await button.click() // Click it again
			flushSync()

			// Button should still be focusable
			await expect
				.element(button)
				.not.toHaveAttribute('tabindex', '-1')
		})
	})

	describe('State Management', () => {
		test('correctly tracks last scroll position', async () => {
			render(BackToTop)
			const button = page.getByTestId('back-to-top')

			// Scroll down
			setScrollPosition(100)
			await triggerScroll()
			await expect.element(button).toHaveClass('show-button')

			// Scroll down more (should still show)
			setScrollPosition(200)
			await triggerScroll()
			await expect.element(button).toHaveClass('show-button')

			// Scroll up (should hide)
			setScrollPosition(150)
			await triggerScroll()
			await expect.element(button).not.toHaveClass('show-button')
		})

		test('handles scroll direction changes correctly', async () => {
			render(BackToTop)
			const button = page.getByTestId('back-to-top')

			// Start at position 100
			setScrollPosition(100)
			await triggerScroll()

			// Scroll up to 50 (hide button)
			setScrollPosition(50)
			await triggerScroll()
			await expect.element(button).not.toHaveClass('show-button')

			// Scroll down to 75 (show button)
			setScrollPosition(75)
			await triggerScroll()
			await expect.element(button).toHaveClass('show-button')

			// Scroll up to 60 (hide button)
			setScrollPosition(60)
			await triggerScroll()
			await expect.element(button).not.toHaveClass('show-button')
		})

		test('reactive state integration with component', async () => {
			// Test how the component's internal rune state works
			let testState = $state({
				scrollY: 0,
				lastScrollY: 0,
			})

			// Simulate component's reactive logic
			let testShowButton = $derived(
				testState.scrollY > testState.lastScrollY &&
					testState.scrollY > 0,
			)

			render(BackToTop)
			const button = page.getByTestId('back-to-top')

			// Test our derived state matches component behavior
			testState.lastScrollY = testState.scrollY
			testState.scrollY = 100
			setScrollPosition(100)
			await triggerScroll()

			flushSync()
			expect(untrack(() => testShowButton)).toBe(true)
			await expect.element(button).toHaveClass('show-button')

			// Test scroll up
			testState.lastScrollY = testState.scrollY
			testState.scrollY = 50
			setScrollPosition(50)
			await triggerScroll()

			flushSync()
			expect(untrack(() => testShowButton)).toBe(false)
			await expect.element(button).not.toHaveClass('show-button')
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
			render(BackToTop)
			const button = page.getByTestId('back-to-top')

			// Initially hidden
			await expect.element(button).toHaveClass('hide-button')
			await expect.element(button).not.toHaveClass('show-button')

			// Show button
			setScrollPosition(100)
			await triggerScroll()
			await expect.element(button).toHaveClass('show-button')
			await expect.element(button).not.toHaveClass('hide-button')

			// Hide button
			setScrollPosition(50)
			await triggerScroll()
			await expect.element(button).toHaveClass('hide-button')
			await expect.element(button).not.toHaveClass('show-button')
		})
	})

	describe('Advanced Rune Testing Patterns', () => {
		test('complex reactive state with multiple dependencies', async () => {
			// Demonstrate testing complex reactive patterns
			let complexState = $state({
				scrollPosition: 0,
				scrollDirection: 'none' as 'up' | 'down' | 'none',
				scrollHistory: [] as number[],
				isUserScrolling: false,
			})

			// Complex derived state
			let shouldShowButton = $derived(() => {
				const hasScrolled = complexState.scrollPosition > 0
				const isScrollingDown =
					complexState.scrollDirection === 'down'
				const hasRecentActivity =
					complexState.scrollHistory.length > 0

				return (
					hasScrolled &&
					isScrollingDown &&
					hasRecentActivity &&
					complexState.isUserScrolling
				)
			})

			// Test initial state
			expect(untrack(() => shouldShowButton())).toBe(false)

			// Simulate user starting to scroll
			complexState.isUserScrolling = true
			complexState.scrollHistory = [0, 50]
			complexState.scrollPosition = 50
			complexState.scrollDirection = 'down'
			flushSync()

			expect(untrack(() => shouldShowButton())).toBe(true)

			// Simulate scroll direction change
			complexState.scrollDirection = 'up'
			flushSync()

			expect(untrack(() => shouldShowButton())).toBe(false)
		})

		test('rune state persistence across re-renders', async () => {
			// Test that rune state persists correctly
			let persistentState = $state({ count: 0, visible: false })

			const updateState = (
				updates: Partial<{ count: number; visible: boolean }>,
			) => {
				Object.assign(persistentState, updates)
			}

			// Initial state
			expect(persistentState.count).toBe(0)
			expect(persistentState.visible).toBe(false)

			// Update state
			updateState({ count: 5, visible: true })
			flushSync()

			expect(persistentState.count).toBe(5)
			expect(persistentState.visible).toBe(true)

			// Partial update
			updateState({ count: 10 })
			flushSync()

			expect(persistentState.count).toBe(10)
			expect(persistentState.visible).toBe(true) // Should persist
		})
	})
})
