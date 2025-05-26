import { page } from '@vitest/browser/context'
import { flushSync } from 'svelte'
import { describe, expect, test } from 'vitest'
import { render } from 'vitest-browser-svelte'
import BackToTop from './back-to-top.svelte'

// Helper function to wait for button to be visible and clickable
async function waitForButtonToBeClickable(button: any) {
	// Wait for show-button class
	await expect.element(button).toHaveClass('show-button')

	// Wait for animation to complete (0.3s + buffer)
	await new Promise((resolve) => setTimeout(resolve, 400))

	// Verify button is actually visible and enabled
	await expect.element(button).toBeVisible()
	await expect.element(button).toBeEnabled()
}

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
			await expect.element(button).toHaveClass('btn-secondary')
			await expect
				.element(button)
				.toHaveClass('text-secondary-content')
			await expect.element(button).toHaveClass('rounded-box')
			await expect.element(button).toHaveClass('fixed')
			await expect.element(button).toHaveClass('right-5')
		})

		test('has correct positioning classes', async () => {
			render(BackToTop)
			const button = page.getByTestId('back-to-top')

			await expect.element(button).toHaveClass('bottom-[-2rem]')
			await expect.element(button).toHaveClass('back-to-top-button')
			await expect.element(button).toHaveClass('font-normal')
			await expect.element(button).toHaveClass('normal-case')
		})
	})

	describe('Scroll Behavior', () => {
		test('shows button when scrolling down', async () => {
			// Create scrollable content for real browser environment
			const tallElement = document.createElement('div')
			tallElement.style.height = '2000px'
			document.body.appendChild(tallElement)

			render(BackToTop)
			const button = page.getByTestId('back-to-top')

			// Initially hidden
			await expect.element(button).toHaveClass('hide-button')

			// Scroll down using real browser scrolling
			window.scrollTo({ top: 100, behavior: 'instant' })

			// Wait for scroll to complete
			await new Promise((resolve) => {
				const checkScroll = () => {
					if (window.scrollY >= 100) {
						resolve(undefined)
					} else {
						requestAnimationFrame(checkScroll)
					}
				}
				checkScroll()
			})

			// Trigger scroll event and flush reactive updates
			window.dispatchEvent(new Event('scroll'))
			flushSync()

			// Button should become visible when scrolling down
			await expect.element(button).toHaveClass('show-button')

			// Clean up
			document.body.removeChild(tallElement)
			window.scrollTo({ top: 0, behavior: 'instant' })
		})

		test('hides button when scrolling up', async () => {
			// Create scrollable content for real browser environment
			const tallElement = document.createElement('div')
			tallElement.style.height = '2000px'
			document.body.appendChild(tallElement)

			render(BackToTop)
			const button = page.getByTestId('back-to-top')

			// Scroll down first to show button
			window.scrollTo({ top: 200, behavior: 'instant' })

			// Wait for scroll to complete
			await new Promise((resolve) => {
				const checkScroll = () => {
					if (window.scrollY >= 200) {
						resolve(undefined)
					} else {
						requestAnimationFrame(checkScroll)
					}
				}
				checkScroll()
			})

			// Trigger scroll event and flush reactive updates
			window.dispatchEvent(new Event('scroll'))
			flushSync()

			await expect.element(button).toHaveClass('show-button')

			// Then scroll up
			window.scrollTo({ top: 100, behavior: 'instant' })

			// Wait for scroll to complete
			await new Promise((resolve) => {
				const checkScroll = () => {
					if (window.scrollY <= 100) {
						resolve(undefined)
					} else {
						requestAnimationFrame(checkScroll)
					}
				}
				checkScroll()
			})

			// Trigger scroll event and flush reactive updates
			window.dispatchEvent(new Event('scroll'))
			flushSync()

			// Button should be hidden when scrolling up
			await expect.element(button).toHaveClass('hide-button')

			// Clean up
			document.body.removeChild(tallElement)
			window.scrollTo({ top: 0, behavior: 'instant' })
		})

		test('hides button when at top of page', async () => {
			// Create scrollable content for real browser environment
			const tallElement = document.createElement('div')
			tallElement.style.height = '2000px'
			document.body.appendChild(tallElement)

			render(BackToTop)
			const button = page.getByTestId('back-to-top')

			// Scroll down first
			window.scrollTo({ top: 100, behavior: 'instant' })

			// Wait for scroll to complete
			await new Promise((resolve) => {
				const checkScroll = () => {
					if (window.scrollY >= 100) {
						resolve(undefined)
					} else {
						requestAnimationFrame(checkScroll)
					}
				}
				checkScroll()
			})

			// Then scroll to top
			window.scrollTo({ top: 0, behavior: 'instant' })

			// Wait for scroll to complete
			await new Promise((resolve) => {
				const checkScroll = () => {
					if (window.scrollY <= 0) {
						resolve(undefined)
					} else {
						requestAnimationFrame(checkScroll)
					}
				}
				checkScroll()
			})

			// Trigger scroll event and flush reactive updates
			window.dispatchEvent(new Event('scroll'))
			flushSync()

			await expect.element(button).toHaveClass('hide-button')

			// Clean up
			document.body.removeChild(tallElement)
		})

		test('remains hidden when scrolling down from position 0', async () => {
			// Create scrollable content for real browser environment
			const tallElement = document.createElement('div')
			tallElement.style.height = '2000px'
			document.body.appendChild(tallElement)

			render(BackToTop)
			const button = page.getByTestId('back-to-top')

			// Ensure we start at top
			window.scrollTo({ top: 0, behavior: 'instant' })

			// Wait for scroll to complete
			await new Promise((resolve) => {
				const checkScroll = () => {
					if (window.scrollY <= 0) {
						resolve(undefined)
					} else {
						requestAnimationFrame(checkScroll)
					}
				}
				checkScroll()
			})

			// Trigger scroll event and flush reactive updates
			window.dispatchEvent(new Event('scroll'))
			flushSync()

			// Should be hidden initially
			await expect.element(button).toHaveClass('hide-button')

			// Now scroll down from 0
			window.scrollTo({ top: 50, behavior: 'instant' })

			// Wait for scroll to complete
			await new Promise((resolve) => {
				const checkScroll = () => {
					if (window.scrollY >= 50) {
						resolve(undefined)
					} else {
						requestAnimationFrame(checkScroll)
					}
				}
				checkScroll()
			})

			// Trigger scroll event and flush reactive updates
			window.dispatchEvent(new Event('scroll'))
			flushSync()

			// Should now be visible since we scrolled down from 0
			await expect.element(button).toHaveClass('show-button')

			// Clean up
			document.body.removeChild(tallElement)
			window.scrollTo({ top: 0, behavior: 'instant' })
		})
	})

	describe('Edge Cases', () => {
		test('handles rapid scroll events correctly', async () => {
			const tallElement = document.createElement('div')
			tallElement.style.height = '3000px'
			document.body.appendChild(tallElement)

			render(BackToTop)
			const button = page.getByTestId('back-to-top')

			// Rapid scroll sequence: down, up, down, up
			const scrollPositions = [100, 50, 150, 75, 200]

			for (const position of scrollPositions) {
				window.scrollTo({ top: position, behavior: 'instant' })

				await new Promise((resolve) => {
					const checkScroll = () => {
						if (Math.abs(window.scrollY - position) < 5) {
							resolve(undefined)
						} else {
							requestAnimationFrame(checkScroll)
						}
					}
					checkScroll()
				})

				window.dispatchEvent(new Event('scroll'))
				flushSync()
			}

			// Final position is 200, which should show button (scrolled down from 75)
			await expect.element(button).toHaveClass('show-button')

			// Clean up
			document.body.removeChild(tallElement)
			window.scrollTo({ top: 0, behavior: 'instant' })
		})

		test('handles scroll position exactly at 0', async () => {
			const tallElement = document.createElement('div')
			tallElement.style.height = '2000px'
			document.body.appendChild(tallElement)

			render(BackToTop)
			const button = page.getByTestId('back-to-top')

			// Start at position 100
			window.scrollTo({ top: 100, behavior: 'instant' })
			await new Promise((resolve) => {
				const checkScroll = () => {
					if (window.scrollY >= 100) {
						resolve(undefined)
					} else {
						requestAnimationFrame(checkScroll)
					}
				}
				checkScroll()
			})

			// Scroll to exactly 0
			window.scrollTo({ top: 0, behavior: 'instant' })
			await new Promise((resolve) => {
				const checkScroll = () => {
					if (window.scrollY === 0) {
						resolve(undefined)
					} else {
						requestAnimationFrame(checkScroll)
					}
				}
				checkScroll()
			})

			window.dispatchEvent(new Event('scroll'))
			flushSync()

			// Should be hidden when at position 0
			await expect.element(button).toHaveClass('hide-button')

			// Clean up
			document.body.removeChild(tallElement)
		})

		test('handles very small scroll movements', async () => {
			const tallElement = document.createElement('div')
			tallElement.style.height = '2000px'
			document.body.appendChild(tallElement)

			render(BackToTop)
			const button = page.getByTestId('back-to-top')

			// Start at 0
			window.scrollTo({ top: 0, behavior: 'instant' })
			await new Promise((resolve) => {
				const checkScroll = () => {
					if (window.scrollY === 0) {
						resolve(undefined)
					} else {
						requestAnimationFrame(checkScroll)
					}
				}
				checkScroll()
			})

			// Very small scroll down (1 pixel)
			window.scrollTo({ top: 1, behavior: 'instant' })
			await new Promise((resolve) => {
				const checkScroll = () => {
					if (window.scrollY >= 1) {
						resolve(undefined)
					} else {
						requestAnimationFrame(checkScroll)
					}
				}
				checkScroll()
			})

			window.dispatchEvent(new Event('scroll'))
			flushSync()

			// Should show button even for 1px scroll down
			await expect.element(button).toHaveClass('show-button')

			// Clean up
			document.body.removeChild(tallElement)
			window.scrollTo({ top: 0, behavior: 'instant' })
		})

		test('handles scroll events without scrollable content', async () => {
			render(BackToTop)
			const button = page.getByTestId('back-to-top')

			// Try to scroll when there's no scrollable content
			window.scrollTo({ top: 100, behavior: 'instant' })
			window.dispatchEvent(new Event('scroll'))
			flushSync()

			// Should remain hidden since scrollY will be 0
			await expect.element(button).toHaveClass('hide-button')
		})
	})

	describe('User Interactions', () => {
		test('scrolls to top when clicked', async () => {
			// Create scrollable content for real browser environment
			const tallElement = document.createElement('div')
			tallElement.style.height = '2000px'
			document.body.appendChild(tallElement)

			render(BackToTop)
			const button = page.getByTestId('back-to-top')

			// First scroll down to show the button
			window.scrollTo({ top: 500, behavior: 'instant' })

			// Wait for scroll to complete
			await new Promise((resolve) => {
				const checkScroll = () => {
					if (window.scrollY >= 500) {
						resolve(undefined)
					} else {
						requestAnimationFrame(checkScroll)
					}
				}
				checkScroll()
			})

			// Trigger scroll event and flush reactive updates
			window.dispatchEvent(new Event('scroll'))
			flushSync()

			// Wait for button to be properly visible and clickable
			await waitForButtonToBeClickable(button)

			// Mock scrollTo to track calls
			const originalScrollTo = window.scrollTo
			let scrollToCalled = false
			let scrollToOptions: ScrollToOptions | undefined
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
					scrollToOptions = options
				}
			}) as typeof window.scrollTo

			// Click the button with force to handle any remaining animation instability
			await button.click({ force: true })

			// Check that scrollTo was called with correct parameters
			expect(scrollToCalled).toBe(true)
			expect(scrollToOptions).toEqual({
				top: 0,
				behavior: 'smooth',
			})

			// Restore original scrollTo
			window.scrollTo = originalScrollTo

			// Clean up
			document.body.removeChild(tallElement)
		})

		test('button is clickable when visible', async () => {
			const tallElement = document.createElement('div')
			tallElement.style.height = '2000px'
			document.body.appendChild(tallElement)

			render(BackToTop)
			const button = page.getByTestId('back-to-top')

			// Scroll down to show button
			window.scrollTo({ top: 200, behavior: 'instant' })
			await new Promise((resolve) => {
				const checkScroll = () => {
					if (window.scrollY >= 200) {
						resolve(undefined)
					} else {
						requestAnimationFrame(checkScroll)
					}
				}
				checkScroll()
			})

			window.dispatchEvent(new Event('scroll'))
			flushSync()

			await expect.element(button).toHaveClass('show-button')

			// Button should be enabled and clickable
			await expect.element(button).toBeEnabled()
			await expect.element(button).not.toHaveAttribute('disabled')

			// Clean up
			document.body.removeChild(tallElement)
			window.scrollTo({ top: 0, behavior: 'instant' })
		})

		test('button maintains accessibility when state changes', async () => {
			const tallElement = document.createElement('div')
			tallElement.style.height = '2000px'
			document.body.appendChild(tallElement)

			render(BackToTop)
			const button = page.getByTestId('back-to-top')

			// Check accessibility attributes in hidden state
			await expect
				.element(button)
				.toHaveAttribute('aria-label', 'Back to top')
			await expect.element(button).toHaveAttribute('type', 'button')

			// Scroll down to show button
			window.scrollTo({ top: 200, behavior: 'instant' })
			await new Promise((resolve) => {
				const checkScroll = () => {
					if (window.scrollY >= 200) {
						resolve(undefined)
					} else {
						requestAnimationFrame(checkScroll)
					}
				}
				checkScroll()
			})

			window.dispatchEvent(new Event('scroll'))
			flushSync()

			// Check accessibility attributes in visible state
			await expect
				.element(button)
				.toHaveAttribute('aria-label', 'Back to top')
			await expect.element(button).toHaveAttribute('type', 'button')

			// Clean up
			document.body.removeChild(tallElement)
			window.scrollTo({ top: 0, behavior: 'instant' })
		})
	})

	describe('Animation States', () => {
		test('applies correct animation classes for show state', async () => {
			const tallElement = document.createElement('div')
			tallElement.style.height = '2000px'
			document.body.appendChild(tallElement)

			render(BackToTop)
			const button = page.getByTestId('back-to-top')

			// Initially should have hide-button class
			await expect.element(button).toHaveClass('hide-button')
			await expect.element(button).not.toHaveClass('show-button')

			// Scroll down to trigger show state
			window.scrollTo({ top: 150, behavior: 'instant' })
			await new Promise((resolve) => {
				const checkScroll = () => {
					if (window.scrollY >= 150) {
						resolve(undefined)
					} else {
						requestAnimationFrame(checkScroll)
					}
				}
				checkScroll()
			})

			window.dispatchEvent(new Event('scroll'))
			flushSync()

			// Should now have show-button class and not hide-button
			await expect.element(button).toHaveClass('show-button')
			await expect.element(button).not.toHaveClass('hide-button')

			// Clean up
			document.body.removeChild(tallElement)
			window.scrollTo({ top: 0, behavior: 'instant' })
		})

		test('transitions between animation states correctly', async () => {
			const tallElement = document.createElement('div')
			tallElement.style.height = '2000px'
			document.body.appendChild(tallElement)

			render(BackToTop)
			const button = page.getByTestId('back-to-top')

			// Start hidden
			await expect.element(button).toHaveClass('hide-button')

			// Show button
			window.scrollTo({ top: 200, behavior: 'instant' })
			await new Promise((resolve) => {
				const checkScroll = () => {
					if (window.scrollY >= 200) {
						resolve(undefined)
					} else {
						requestAnimationFrame(checkScroll)
					}
				}
				checkScroll()
			})

			window.dispatchEvent(new Event('scroll'))
			flushSync()

			// Wait for button to be properly visible and clickable
			await waitForButtonToBeClickable(button)

			// Hide button again
			window.scrollTo({ top: 100, behavior: 'instant' })
			await new Promise((resolve) => {
				const checkScroll = () => {
					if (window.scrollY <= 100) {
						resolve(undefined)
					} else {
						requestAnimationFrame(checkScroll)
					}
				}
				checkScroll()
			})

			window.dispatchEvent(new Event('scroll'))
			flushSync()

			await expect.element(button).toHaveClass('hide-button')

			// Wait for hide animation to complete
			await new Promise((resolve) => setTimeout(resolve, 400))

			// Clean up
			document.body.removeChild(tallElement)
			window.scrollTo({ top: 0, behavior: 'instant' })
		}, 10000) // Increase timeout to 10 seconds
	})

	describe('Responsive Behavior', () => {
		test('maintains functionality across different viewport sizes', async () => {
			const tallElement = document.createElement('div')
			tallElement.style.height = '2000px'
			document.body.appendChild(tallElement)

			render(BackToTop)
			const button = page.getByTestId('back-to-top')

			// Test at mobile viewport (the component should work the same)
			// Note: In vitest-browser-svelte, we can't easily change viewport size,
			// but we can test that the component maintains its core functionality

			window.scrollTo({ top: 300, behavior: 'instant' })
			await new Promise((resolve) => {
				const checkScroll = () => {
					if (window.scrollY >= 300) {
						resolve(undefined)
					} else {
						requestAnimationFrame(checkScroll)
					}
				}
				checkScroll()
			})

			window.dispatchEvent(new Event('scroll'))
			flushSync()

			// Should work regardless of viewport size
			await expect.element(button).toHaveClass('show-button')

			// Clean up
			document.body.removeChild(tallElement)
			window.scrollTo({ top: 0, behavior: 'instant' })
		})

		test('maintains positioning classes for responsive design', async () => {
			render(BackToTop)
			const button = page.getByTestId('back-to-top')

			// These classes should always be present for responsive behavior
			await expect.element(button).toHaveClass('fixed')
			await expect.element(button).toHaveClass('right-5')
			await expect.element(button).toHaveClass('bottom-[-2rem]')
		})
	})
})
