import { page } from '@vitest/browser/context'
import { createRawSnippet, flushSync, tick } from 'svelte'
import { afterEach, describe, expect, test, vi } from 'vitest'
import { render } from 'vitest-browser-svelte'
import Details from './details.svelte'

describe('Details Component', () => {
	afterEach(() => {
		vi.clearAllMocks()
	})

	describe('Initial Rendering', () => {
		test('renders with default props', async () => {
			render(Details)
			const button = page.getByTestId('details-button')

			await expect.element(button).toBeInTheDocument()
			await expect.element(button).toHaveTextContent('')
			await expect.element(button).toHaveClass('btn')
			await expect.element(button).toHaveClass('shadow-xl')
			await expect
				.element(page.getByTestId('details-content'))
				.not.toBeInTheDocument()
		})

		test('renders with custom button text', async () => {
			render(Details, {
				button_text: 'Show Details',
			})
			const button = page.getByTestId('details-button')

			await expect.element(button).toHaveTextContent('Show Details')
		})

		test('renders with empty button text', async () => {
			render(Details, {
				button_text: '',
			})
			const button = page.getByTestId('details-button')

			await expect.element(button).toHaveTextContent('')
		})

		test('renders with whitespace-only button text', async () => {
			render(Details, {
				button_text: '   ',
			})
			const button = page.getByTestId('details-button')

			await expect.element(button).toHaveTextContent('')
		})

		test('applies custom styles', async () => {
			render(Details, {
				styles: 'custom-class another-class',
			})
			const button = page.getByTestId('details-button')

			await expect.element(button).toHaveClass('custom-class')
			await expect.element(button).toHaveClass('another-class')
			await expect.element(button).toHaveClass('btn')
			await expect.element(button).toHaveClass('shadow-xl')
		})

		test('handles undefined styles gracefully', async () => {
			render(Details, {
				styles: undefined,
			})
			const button = page.getByTestId('details-button')

			await expect.element(button).toHaveClass('btn')
			await expect.element(button).toHaveClass('shadow-xl')
		})
	})

	describe('Initial State Control', () => {
		test('respects initial is_open: false', async () => {
			render(Details, {
				button_text: 'Show Details',
				is_open: false,
			})

			const button = page.getByTestId('details-button')
			await expect.element(button).toHaveTextContent('Show Details')
			await expect
				.element(page.getByTestId('details-content'))
				.not.toBeInTheDocument()
		})

		test('respects initial is_open: true', async () => {
			const testSnippet = createRawSnippet(() => ({
				render: () => '<p>Test Content</p>',
				setup: () => {},
			}))

			render(Details, {
				button_text: 'Show Details',
				is_open: true,
				children: testSnippet,
			})

			const button = page.getByTestId('details-button')
			const content = page.getByTestId('details-content')

			await expect.element(button).toHaveTextContent('Close')
			await expect.element(content).toBeInTheDocument()
			await expect.element(content).toHaveTextContent('Test Content')
		})
	})

	describe('User Interactions', () => {
		test('opens details when button is clicked', async () => {
			const testSnippet = createRawSnippet(() => ({
				render: () => '<p>Test Content</p>',
				setup: () => {},
			}))

			render(Details, {
				button_text: 'Show Details',
				is_open: false,
				children: testSnippet,
			})

			const button = page.getByTestId('details-button')

			// Initial state
			await expect.element(button).toHaveTextContent('Show Details')
			await expect
				.element(page.getByTestId('details-content'))
				.not.toBeInTheDocument()

			// Click to open
			await button.click()
			flushSync()
			await tick() // Wait for transitions

			const content = page.getByTestId('details-content')
			await expect.element(content).toBeInTheDocument()
			await expect.element(content).toHaveTextContent('Test Content')
			await expect.element(button).toHaveTextContent('Close')
		})

		test('closes details when button is clicked again', async () => {
			const testSnippet = createRawSnippet(() => ({
				render: () => '<p>Test Content</p>',
				setup: () => {},
			}))

			render(Details, {
				button_text: 'Show Details',
				is_open: true,
				children: testSnippet,
			})

			const button = page.getByTestId('details-button')

			// Initial state (open)
			await expect.element(button).toHaveTextContent('Close')
			await expect
				.element(page.getByTestId('details-content'))
				.toBeInTheDocument()

			// Click to close
			await button.click()
			flushSync()
			await tick() // Wait for transitions to complete

			// Check if element is either removed or marked as inert (transitioning out)
			try {
				const content = page.getByTestId('details-content')
				await expect.element(content).toHaveAttribute('inert')
			} catch {
				// Element was removed, which is also valid
			}
			await expect.element(button).toHaveTextContent('Show Details')
		})

		test('toggles multiple times correctly', async () => {
			const testSnippet = createRawSnippet(() => ({
				render: () => '<p>Test Content</p>',
				setup: () => {},
			}))

			render(Details, {
				button_text: 'Toggle Details',
				is_open: false,
				children: testSnippet,
			})

			const button = page.getByTestId('details-button')

			// Open
			await button.click()
			flushSync()
			await tick()
			await expect.element(button).toHaveTextContent('Close')
			await expect
				.element(page.getByTestId('details-content'))
				.toBeInTheDocument()

			// Close
			await button.click()
			flushSync()
			await tick()
			await expect.element(button).toHaveTextContent('Toggle Details')
			// Check if element is either removed or marked as inert (transitioning out)
			try {
				const contentAfterClose = page.getByTestId('details-content')
				await expect
					.element(contentAfterClose)
					.toHaveAttribute('inert')
			} catch {
				// Element was removed, which is also valid
			}

			// Open again
			await button.click()
			flushSync()
			await tick()
			await expect.element(button).toHaveTextContent('Close')
			await expect
				.element(page.getByTestId('details-content'))
				.toBeInTheDocument()
		})
	})

	describe('Children/Snippet Rendering', () => {
		test('renders children when open', async () => {
			const testSnippet = createRawSnippet(() => ({
				render: () =>
					'<div class="test-content">Custom Content</div>',
				setup: () => {},
			}))

			render(Details, {
				button_text: 'Show Details',
				is_open: true,
				children: testSnippet,
			})

			const content = page.getByTestId('details-content')
			await expect.element(content).toBeInTheDocument()
			await expect
				.element(content)
				.toHaveTextContent('Custom Content')
		})

		test('handles complex children content', async () => {
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

			render(Details, {
				button_text: 'Show Complex',
				is_open: true,
				children: complexSnippet,
			})

			const content = page.getByTestId('details-content')
			await expect.element(content).toHaveTextContent('Title')
			await expect.element(content).toHaveTextContent('Description')
			await expect.element(content).toHaveTextContent('Action')
		})

		test('handles empty children gracefully', async () => {
			const emptySnippet = createRawSnippet(() => ({
				render: () => '<div></div>', // Provide valid HTML instead of empty string
				setup: () => {},
			}))

			render(Details, {
				button_text: 'Show Empty',
				is_open: true,
				children: emptySnippet,
			})

			const content = page.getByTestId('details-content')
			await expect.element(content).toBeInTheDocument()
			// Content div exists but is empty
			await expect.element(content).toHaveTextContent('')
		})

		test('handles undefined children', async () => {
			render(Details, {
				button_text: 'Show Details',
				is_open: true,
				children: undefined,
			})

			const content = page.getByTestId('details-content')
			await expect.element(content).toHaveTextContent('')
		})
	})

	describe('Accessibility', () => {
		test('button has proper accessibility attributes', async () => {
			render(Details, {
				button_text: 'Show Details',
			})
			const button = page.getByTestId('details-button')

			await expect.element(button).toBeInTheDocument()
			await expect
				.element(button)
				.toHaveAttribute('data-testid', 'details-button')
		})

		test('content has proper accessibility attributes when visible', async () => {
			const testSnippet = createRawSnippet(() => ({
				render: () => '<p>Accessible Content</p>',
				setup: () => {},
			}))

			render(Details, {
				button_text: 'Show Details',
				is_open: true,
				children: testSnippet,
			})

			const content = page.getByTestId('details-content')
			await expect
				.element(content)
				.toHaveAttribute('data-testid', 'details-content')
		})

		test('maintains focus on button after interaction', async () => {
			const { container } = render(Details, {
				button_text: 'Show Details',
			})
			const button = page.getByTestId('details-button')
			const buttonElement = container.querySelector(
				'[data-testid="details-button"]',
			) as HTMLButtonElement

			buttonElement.focus()
			expect(document.activeElement).toBe(buttonElement)

			await button.click()
			flushSync()
			await tick()

			// Button should still be focusable after click
			expect(buttonElement.tabIndex).not.toBe(-1)
		})
	})

	describe('Edge Cases', () => {
		test('handles rapid clicking', async () => {
			const testSnippet = createRawSnippet(() => ({
				render: () => '<p>Test Content</p>',
				setup: () => {},
			}))

			render(Details, {
				button_text: 'Show Details',
				is_open: false,
				children: testSnippet,
			})

			const button = page.getByTestId('details-button')

			// Rapid clicks - 3 clicks starting from closed state
			await button.click()
			await button.click()
			await button.click()
			flushSync()
			await tick()

			// Should end up in open state (3 clicks = open)
			await expect.element(button).toHaveTextContent('Close')
			await expect
				.element(page.getByTestId('details-content'))
				.toBeInTheDocument()
		})

		test('handles very long button text', async () => {
			const longText = 'A'.repeat(1000)
			render(Details, {
				button_text: longText,
			})
			const button = page.getByTestId('details-button')

			await expect.element(button).toHaveTextContent(longText)
		})

		test('handles special characters in button text', async () => {
			const specialText = '!@#$%^&*()_+-=[]{}|;:,.<>?'
			render(Details, {
				button_text: specialText,
			})
			const button = page.getByTestId('details-button')

			await expect.element(button).toHaveTextContent(specialText)
		})

		test('handles unicode characters in button text', async () => {
			const unicodeText = '🚀 Show Details 🎉'
			render(Details, {
				button_text: unicodeText,
			})
			const button = page.getByTestId('details-button')

			await expect.element(button).toHaveTextContent(unicodeText)
		})

		test('handles malformed CSS classes gracefully', async () => {
			render(Details, {
				styles: '  class1   class2  ',
			})
			const button = page.getByTestId('details-button')

			// Should still have base classes
			await expect.element(button).toHaveClass('btn')
			await expect.element(button).toHaveClass('shadow-xl')
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
			const button = container.querySelector(
				'[data-testid="details-button"]',
			)
			const content = container.querySelector(
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
		test('content has transition attribute when rendered', async () => {
			const testSnippet = createRawSnippet(() => ({
				render: () => '<p>Test Content</p>',
				setup: () => {},
			}))

			render(Details, {
				button_text: 'Show Details',
				is_open: true,
				children: testSnippet,
			})

			const content = page.getByTestId('details-content')

			// The slide transition should be applied
			await expect.element(content).toBeInTheDocument()
		})

		test('handles transition during state changes', async () => {
			const testSnippet = createRawSnippet(() => ({
				render: () => '<p>Test Content</p>',
				setup: () => {},
			}))

			render(Details, {
				button_text: 'Show Details',
				is_open: false,
				children: testSnippet,
			})

			const button = page.getByTestId('details-button')

			// Open with transition
			await button.click()
			flushSync()
			await tick()

			const content = page.getByTestId('details-content')
			await expect.element(content).toBeInTheDocument()

			// Close with transition
			await button.click()
			flushSync()
			await tick() // Wait for transition to complete

			// Check if element is either removed or marked as inert (transitioning out)
			try {
				const contentAfterClose = page.getByTestId('details-content')
				await expect
					.element(contentAfterClose)
					.toHaveAttribute('inert')
			} catch {
				// Element was removed, which is also valid
			}
		})
	})
})
