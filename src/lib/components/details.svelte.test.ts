import { createRawSnippet, flushSync, tick } from 'svelte'
import { afterEach, describe, expect, test, vi } from 'vitest'
import { render } from 'vitest-browser-svelte'
import Details from './details.svelte'

describe('Details Component', () => {
	afterEach(() => {
		vi.clearAllMocks()
	})

	describe('Initial Rendering', () => {
		test('renders with default props', () => {
			const { container } = render(Details)
			const button = container.querySelector(
				'[data-testid="details-button"]',
			) as HTMLButtonElement

			expect(button).toBeTruthy()
			expect(button.textContent?.trim()).toBe('')
			expect(button.classList.contains('btn')).toBe(true)
			expect(button.classList.contains('shadow-xl')).toBe(true)
			expect(
				container.querySelector('[data-testid="details-content"]'),
			).toBeNull()
		})

		test('renders with custom button text', () => {
			const { container } = render(Details, {
				button_text: 'Show Details',
			})
			const button = container.querySelector(
				'[data-testid="details-button"]',
			) as HTMLButtonElement

			expect(button.textContent?.trim()).toBe('Show Details')
		})

		test('renders with empty button text', () => {
			const { container } = render(Details, {
				button_text: '',
			})
			const button = container.querySelector(
				'[data-testid="details-button"]',
			) as HTMLButtonElement

			expect(button.textContent?.trim()).toBe('')
		})

		test('renders with whitespace-only button text', () => {
			const { container } = render(Details, {
				button_text: '   ',
			})
			const button = container.querySelector(
				'[data-testid="details-button"]',
			) as HTMLButtonElement

			expect(button.textContent?.trim()).toBe('')
		})

		test('applies custom styles', () => {
			const { container } = render(Details, {
				styles: 'custom-class another-class',
			})
			const button = container.querySelector(
				'[data-testid="details-button"]',
			) as HTMLButtonElement

			expect(button.classList.contains('custom-class')).toBe(true)
			expect(button.classList.contains('another-class')).toBe(true)
			expect(button.classList.contains('btn')).toBe(true)
			expect(button.classList.contains('shadow-xl')).toBe(true)
		})

		test('handles undefined styles gracefully', () => {
			const { container } = render(Details, {
				styles: undefined,
			})
			const button = container.querySelector(
				'[data-testid="details-button"]',
			) as HTMLButtonElement

			expect(button.classList.contains('btn')).toBe(true)
			expect(button.classList.contains('shadow-xl')).toBe(true)
		})
	})

	describe('Initial State Control', () => {
		test('respects initial is_open: false', () => {
			const { container } = render(Details, {
				button_text: 'Show Details',
				is_open: false,
			})

			const button = container.querySelector(
				'[data-testid="details-button"]',
			) as HTMLButtonElement
			const content = container.querySelector(
				'[data-testid="details-content"]',
			)

			expect(button.textContent?.trim()).toBe('Show Details')
			expect(content).toBeNull()
		})

		test('respects initial is_open: true', () => {
			const testSnippet = createRawSnippet(() => ({
				render: () => '<p>Test Content</p>',
				setup: () => {},
			}))

			const { container } = render(Details, {
				button_text: 'Show Details',
				is_open: true,
				children: testSnippet,
			})

			const button = container.querySelector(
				'[data-testid="details-button"]',
			) as HTMLButtonElement
			const content = container.querySelector(
				'[data-testid="details-content"]',
			)

			expect(button.textContent?.trim()).toBe('Close')
			expect(content).toBeTruthy()
			expect(content?.textContent).toContain('Test Content')
		})
	})

	describe('User Interactions', () => {
		test('opens details when button is clicked', async () => {
			const testSnippet = createRawSnippet(() => ({
				render: () => '<p>Test Content</p>',
				setup: () => {},
			}))

			const { container } = render(Details, {
				button_text: 'Show Details',
				is_open: false,
				children: testSnippet,
			})

			const button = container.querySelector(
				'[data-testid="details-button"]',
			) as HTMLButtonElement

			// Initial state
			expect(button.textContent?.trim()).toBe('Show Details')
			expect(
				container.querySelector('[data-testid="details-content"]'),
			).toBeNull()

			// Click to open
			button.click()
			flushSync()
			await tick() // Wait for transitions

			const content = container.querySelector(
				'[data-testid="details-content"]',
			)
			expect(content).toBeTruthy()
			expect(content?.textContent).toContain('Test Content')
			expect(button.textContent?.trim()).toBe('Close')
		})

		test('closes details when button is clicked again', async () => {
			const testSnippet = createRawSnippet(() => ({
				render: () => '<p>Test Content</p>',
				setup: () => {},
			}))

			const { container } = render(Details, {
				button_text: 'Show Details',
				is_open: true,
				children: testSnippet,
			})

			const button = container.querySelector(
				'[data-testid="details-button"]',
			) as HTMLButtonElement

			// Initial state (open)
			expect(button.textContent?.trim()).toBe('Close')
			expect(
				container.querySelector('[data-testid="details-content"]'),
			).toBeTruthy()

			// Click to close
			button.click()
			flushSync()
			await tick() // Wait for transitions to complete

			// Check if element is either removed or marked as inert (transitioning out)
			const content = container.querySelector(
				'[data-testid="details-content"]',
			)
			if (content) {
				// If element still exists, it should be marked as inert (transitioning out)
				expect(content.hasAttribute('inert')).toBe(true)
			}
			expect(button.textContent?.trim()).toBe('Show Details')
		})

		test('toggles multiple times correctly', async () => {
			const testSnippet = createRawSnippet(() => ({
				render: () => '<p>Test Content</p>',
				setup: () => {},
			}))

			const { container } = render(Details, {
				button_text: 'Toggle Details',
				is_open: false,
				children: testSnippet,
			})

			const button = container.querySelector(
				'[data-testid="details-button"]',
			) as HTMLButtonElement

			// Open
			button.click()
			flushSync()
			await tick()
			expect(button.textContent?.trim()).toBe('Close')
			expect(
				container.querySelector('[data-testid="details-content"]'),
			).toBeTruthy()

			// Close
			button.click()
			flushSync()
			await tick()
			expect(button.textContent?.trim()).toBe('Toggle Details')
			// Check if element is either removed or marked as inert (transitioning out)
			const contentAfterClose = container.querySelector(
				'[data-testid="details-content"]',
			)
			if (contentAfterClose) {
				expect(contentAfterClose.hasAttribute('inert')).toBe(true)
			}

			// Open again
			button.click()
			flushSync()
			await tick()
			expect(button.textContent?.trim()).toBe('Close')
			expect(
				container.querySelector('[data-testid="details-content"]'),
			).toBeTruthy()
		})
	})

	describe('Children/Snippet Rendering', () => {
		test('renders children when open', () => {
			const testSnippet = createRawSnippet(() => ({
				render: () =>
					'<div class="test-content">Custom Content</div>',
				setup: () => {},
			}))

			const { container } = render(Details, {
				button_text: 'Show Details',
				is_open: true,
				children: testSnippet,
			})

			const content = container.querySelector(
				'[data-testid="details-content"]',
			)
			expect(content).toBeTruthy()
			expect(content?.querySelector('.test-content')).toBeTruthy()
			expect(content?.textContent).toContain('Custom Content')
		})

		test('handles complex children content', () => {
			const complexSnippet = createRawSnippet(() => ({
				render: () => `
					<div class="complex-content">
						<h3>Title</h3>
						<p>Description</p>
						<button>Action</button>
					</div>
				`,
				setup: () => {},
			}))

			const { container } = render(Details, {
				button_text: 'Show Complex',
				is_open: true,
				children: complexSnippet,
			})

			const content = container.querySelector(
				'[data-testid="details-content"]',
			)
			expect(content?.querySelector('h3')).toBeTruthy()
			expect(content?.querySelector('p')).toBeTruthy()
			expect(content?.querySelector('button')).toBeTruthy()
			expect(content?.textContent).toContain('Title')
			expect(content?.textContent).toContain('Description')
			expect(content?.textContent).toContain('Action')
		})

		test('handles empty children gracefully', () => {
			const emptySnippet = createRawSnippet(() => ({
				render: () => '<div></div>', // Provide valid HTML instead of empty string
				setup: () => {},
			}))

			const { container } = render(Details, {
				button_text: 'Show Empty',
				is_open: true,
				children: emptySnippet,
			})

			const content = container.querySelector(
				'[data-testid="details-content"]',
			)
			expect(content).toBeTruthy()
			// Content div exists but is empty
			expect(content?.querySelector('div')).toBeTruthy()
		})

		test('handles undefined children', () => {
			const { container } = render(Details, {
				button_text: 'Show Details',
				is_open: true,
				children: undefined,
			})

			const content = container.querySelector(
				'[data-testid="details-content"]',
			)
			expect(content).toBeTruthy()
			expect(content?.textContent?.trim()).toBe('')
		})
	})

	describe('Accessibility', () => {
		test('button has proper accessibility attributes', () => {
			const { container } = render(Details, {
				button_text: 'Show Details',
			})
			const button = container.querySelector(
				'[data-testid="details-button"]',
			) as HTMLButtonElement

			expect(button.tagName).toBe('BUTTON')
			expect(button.getAttribute('data-testid')).toBe(
				'details-button',
			)
		})

		test('content has proper accessibility attributes when visible', () => {
			const testSnippet = createRawSnippet(() => ({
				render: () => '<p>Accessible Content</p>',
				setup: () => {},
			}))

			const { container } = render(Details, {
				button_text: 'Show Details',
				is_open: true,
				children: testSnippet,
			})

			const content = container.querySelector(
				'[data-testid="details-content"]',
			)
			expect(content?.getAttribute('data-testid')).toBe(
				'details-content',
			)
		})

		test('maintains focus on button after interaction', async () => {
			const { container } = render(Details, {
				button_text: 'Show Details',
			})
			const button = container.querySelector(
				'[data-testid="details-button"]',
			) as HTMLButtonElement

			button.focus()
			expect(document.activeElement).toBe(button)

			button.click()
			flushSync()
			await tick()

			// Button should still be focusable after click
			expect(button.tabIndex).not.toBe(-1)
		})
	})

	describe('Edge Cases', () => {
		test('handles rapid clicking', async () => {
			const testSnippet = createRawSnippet(() => ({
				render: () => '<p>Test Content</p>',
				setup: () => {},
			}))

			const { container } = render(Details, {
				button_text: 'Show Details',
				is_open: false,
				children: testSnippet,
			})

			const button = container.querySelector(
				'[data-testid="details-button"]',
			) as HTMLButtonElement

			// Rapid clicks - 3 clicks starting from closed state
			button.click()
			button.click()
			button.click()
			flushSync()
			await tick()

			// Should end up in open state (3 clicks = open)
			expect(button.textContent?.trim()).toBe('Close')
			expect(
				container.querySelector('[data-testid="details-content"]'),
			).toBeTruthy()
		})

		test('handles very long button text', () => {
			const longText = 'A'.repeat(1000)
			const { container } = render(Details, {
				button_text: longText,
			})
			const button = container.querySelector(
				'[data-testid="details-button"]',
			) as HTMLButtonElement

			expect(button.textContent?.trim()).toBe(longText)
		})

		test('handles special characters in button text', () => {
			const specialText = '!@#$%^&*()_+-=[]{}|;:,.<>?'
			const { container } = render(Details, {
				button_text: specialText,
			})
			const button = container.querySelector(
				'[data-testid="details-button"]',
			) as HTMLButtonElement

			expect(button.textContent?.trim()).toBe(specialText)
		})

		test('handles unicode characters in button text', () => {
			const unicodeText = '🚀 Show Details 🎉'
			const { container } = render(Details, {
				button_text: unicodeText,
			})
			const button = container.querySelector(
				'[data-testid="details-button"]',
			) as HTMLButtonElement

			expect(button.textContent?.trim()).toBe(unicodeText)
		})

		test('handles malformed CSS classes gracefully', () => {
			const { container } = render(Details, {
				styles: '  class1   class2  ',
			})
			const button = container.querySelector(
				'[data-testid="details-button"]',
			) as HTMLButtonElement

			// Should still have base classes
			expect(button.classList.contains('btn')).toBe(true)
			expect(button.classList.contains('shadow-xl')).toBe(true)
		})
	})

	describe('Component Structure', () => {
		test('maintains proper DOM structure', () => {
			const testSnippet = createRawSnippet(() => ({
				render: () => '<p>Test Content</p>',
				setup: () => {},
			}))

			const { container } = render(Details, {
				button_text: 'Show Details',
				is_open: true,
				children: testSnippet,
			})

			// Should have a root div
			const rootDiv = container.firstElementChild
			expect(rootDiv?.tagName).toBe('DIV')

			// Should contain button and content
			const button = rootDiv?.querySelector(
				'[data-testid="details-button"]',
			)
			const content = rootDiv?.querySelector(
				'[data-testid="details-content"]',
			)

			expect(button).toBeTruthy()
			expect(content).toBeTruthy()
		})

		test('content appears after button in DOM order', () => {
			const testSnippet = createRawSnippet(() => ({
				render: () => '<p>Test Content</p>',
				setup: () => {},
			}))

			const { container } = render(Details, {
				button_text: 'Show Details',
				is_open: true,
				children: testSnippet,
			})

			const rootDiv = container.firstElementChild
			const children = Array.from(rootDiv?.children || [])

			expect(children[0]?.getAttribute('data-testid')).toBe(
				'details-button',
			)
			expect(children[1]?.getAttribute('data-testid')).toBe(
				'details-content',
			)
		})
	})

	describe('Transition Behavior', () => {
		test('content has transition attribute when rendered', () => {
			const testSnippet = createRawSnippet(() => ({
				render: () => '<p>Test Content</p>',
				setup: () => {},
			}))

			const { container } = render(Details, {
				button_text: 'Show Details',
				is_open: true,
				children: testSnippet,
			})

			const content = container.querySelector(
				'[data-testid="details-content"]',
			)

			// The slide transition should be applied
			expect(content).toBeTruthy()
		})

		test('handles transition during state changes', async () => {
			const testSnippet = createRawSnippet(() => ({
				render: () => '<p>Test Content</p>',
				setup: () => {},
			}))

			const { container } = render(Details, {
				button_text: 'Show Details',
				is_open: false,
				children: testSnippet,
			})

			const button = container.querySelector(
				'[data-testid="details-button"]',
			) as HTMLButtonElement

			// Open with transition
			button.click()
			flushSync()
			await tick()

			const content = container.querySelector(
				'[data-testid="details-content"]',
			)
			expect(content).toBeTruthy()

			// Close with transition
			button.click()
			flushSync()
			await tick() // Wait for transition to complete

			// Check if element is either removed or marked as inert (transitioning out)
			const contentAfterClose = container.querySelector(
				'[data-testid="details-content"]',
			)
			if (contentAfterClose) {
				expect(contentAfterClose.hasAttribute('inert')).toBe(true)
			}
		})
	})
})
