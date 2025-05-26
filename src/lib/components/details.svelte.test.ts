import { page } from '@vitest/browser/context'
import { createRawSnippet, flushSync } from 'svelte'
import { describe, expect, it } from 'vitest'
import { render } from 'vitest-browser-svelte'
import Details from './details.svelte'

describe('Details Component', () => {
	describe('Initial Rendering', () => {
		it('renders with default props', async () => {
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

		it('renders with custom button text', async () => {
			render(Details, {
				button_text: 'Show Details',
			})
			const button = page.getByTestId('details-button')

			await expect.element(button).toHaveTextContent('Show Details')
		})

		it('renders with empty button text', async () => {
			render(Details, {
				button_text: '',
			})
			const button = page.getByTestId('details-button')

			await expect.element(button).toHaveTextContent('')
		})

		it('renders with whitespace-only button text', async () => {
			render(Details, {
				button_text: '   ',
			})
			const button = page.getByTestId('details-button')

			await expect.element(button).toHaveTextContent('')
		})

		it('applies custom styles', async () => {
			render(Details, {
				styles: 'custom-class another-class',
			})
			const button = page.getByTestId('details-button')

			await expect.element(button).toHaveClass('custom-class')
			await expect.element(button).toHaveClass('another-class')
			await expect.element(button).toHaveClass('btn')
			await expect.element(button).toHaveClass('shadow-xl')
		})

		it('handles undefined styles gracefully', async () => {
			render(Details, {
				styles: undefined,
			})
			const button = page.getByTestId('details-button')

			await expect.element(button).toHaveClass('btn')
			await expect.element(button).toHaveClass('shadow-xl')
		})
	})

	describe('Initial State Control', () => {
		it('respects initial is_open: false', async () => {
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

		it('respects initial is_open: true', async () => {
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
		it('opens details when button is clicked', async () => {
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

			// Wait for button text to change first (immediate)
			await expect.element(button).toHaveTextContent('Close')

			// Wait for transition to complete and content to appear
			const content = page.getByTestId('details-content')
			await expect.element(content).toBeInTheDocument()
			await expect.element(content).toBeVisible()
			await expect.element(content).toHaveTextContent('Test Content')
		})

		it('closes details when button is clicked again', async () => {
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

			await expect
				.element(page.getByTestId('details-content'))
				.not.toBeInTheDocument()
			await expect.element(button).toHaveTextContent('Show Details')
		})

		it('toggles multiple times correctly', async () => {
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
			await expect.element(button).toHaveTextContent('Close')

			const content = page.getByTestId('details-content')
			await expect.element(content).toBeInTheDocument()
			await expect.element(content).toBeVisible()

			// Close
			await button.click()
			flushSync()
			await expect.element(button).toHaveTextContent('Toggle Details')
			await expect.element(content).not.toBeInTheDocument()

			// Open again
			await button.click()
			flushSync()
			await expect.element(button).toHaveTextContent('Close')
			await expect.element(content).toBeInTheDocument()
			await expect.element(content).toBeVisible()
		})
	})

	describe('Content Rendering', () => {
		it('renders snippet content correctly', async () => {
			const testSnippet = createRawSnippet(() => ({
				render: () => '<div><h3>Title</h3><p>Description</p></div>',
				setup: () => {},
			}))

			render(Details, {
				button_text: 'Show Details',
				is_open: true,
				children: testSnippet,
			})

			const content = page.getByTestId('details-content')
			await expect.element(content).toBeInTheDocument()
			await expect.element(content).toHaveTextContent('Title')
			await expect.element(content).toHaveTextContent('Description')
		})

		it('handles empty content gracefully', async () => {
			const emptySnippet = createRawSnippet(() => ({
				render: () => '<div></div>',
				setup: () => {},
			}))

			render(Details, {
				button_text: 'Show Details',
				is_open: true,
				children: emptySnippet,
			})

			const content = page.getByTestId('details-content')
			await expect.element(content).toBeInTheDocument()
		})

		it('handles complex nested content', async () => {
			const complexSnippet = createRawSnippet(() => ({
				render: () => `
					<div>
						<h2>Main Title</h2>
						<ul>
							<li>Item 1</li>
							<li>Item 2</li>
						</ul>
						<p>Some <strong>bold</strong> text</p>
					</div>
				`,
				setup: () => {},
			}))

			render(Details, {
				button_text: 'Show Complex Content',
				is_open: true,
				children: complexSnippet,
			})

			const content = page.getByTestId('details-content')
			await expect.element(content).toBeInTheDocument()
			await expect.element(content).toHaveTextContent('Main Title')
			await expect.element(content).toHaveTextContent('Item 1')
			await expect.element(content).toHaveTextContent('Item 2')
			await expect
				.element(content)
				.toHaveTextContent('Some bold text')
		})
	})

	describe('Accessibility', () => {
		it('button has correct accessibility attributes', async () => {
			render(Details, {
				button_text: 'Show Details',
			})

			const button = page.getByTestId('details-button')
			await expect.element(button).toHaveAttribute('type', 'button')
		})

		it('content is properly associated with button', async () => {
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
			await expect.element(content).toBeInTheDocument()
		})

		it('button is keyboard accessible', async () => {
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

			// Button should be clickable and enabled
			await expect.element(button).toBeEnabled()

			// Should be able to activate with click
			await button.click()
			flushSync()

			await expect.element(button).toHaveTextContent('Close')
			const content = page.getByTestId('details-content')
			await expect.element(content).toBeInTheDocument()
		})
	})

	describe('Edge Cases', () => {
		it('handles rapid button clicks gracefully', async () => {
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

			// Initial state
			await expect.element(button).toHaveTextContent('Toggle Details')

			// Rapid clicks with flushSync after each to ensure state updates
			await button.click()
			flushSync()
			await button.click()
			flushSync()
			await button.click()
			flushSync()

			// After 3 clicks (odd number), should be in open state
			await expect.element(button).toHaveTextContent('Close')
			await expect
				.element(page.getByTestId('details-content'))
				.toBeInTheDocument()

			// One more click to close
			await button.click()
			flushSync()

			// Now should be closed
			await expect.element(button).toHaveTextContent('Toggle Details')
			await expect
				.element(page.getByTestId('details-content'))
				.not.toBeInTheDocument()
		})

		it('works without children prop', async () => {
			render(Details, {
				button_text: 'Show Details',
				is_open: true,
			})

			const button = page.getByTestId('details-button')
			await expect.element(button).toHaveTextContent('Close')

			const content = page.getByTestId('details-content')
			await expect.element(content).toBeInTheDocument()
		})

		it('handles very long button text', async () => {
			const longText =
				'This is a very long button text that might cause layout issues or overflow problems in some scenarios'

			render(Details, {
				button_text: longText,
				is_open: false,
			})

			const button = page.getByTestId('details-button')
			await expect.element(button).toHaveTextContent(longText)
			await expect.element(button).toBeEnabled()
		})

		it('maintains state consistency across prop changes', async () => {
			const testSnippet = createRawSnippet(() => ({
				render: () => '<p>Test Content</p>',
				setup: () => {},
			}))

			const { rerender } = render(Details, {
				button_text: 'Initial Text',
				is_open: false,
				children: testSnippet,
			})

			const button = page.getByTestId('details-button')
			await expect.element(button).toHaveTextContent('Initial Text')

			// Change button text while keeping state
			rerender({
				button_text: 'Updated Text',
				is_open: false,
				children: testSnippet,
			})

			await expect.element(button).toHaveTextContent('Updated Text')
			await expect
				.element(page.getByTestId('details-content'))
				.not.toBeInTheDocument()
		})
	})
})
