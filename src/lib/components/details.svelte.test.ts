import { page } from '@vitest/browser/context'
import { createRawSnippet, flushSync } from 'svelte'
import { describe, expect, test } from 'vitest'
import { render } from 'vitest-browser-svelte'
import Details from './details.svelte'

describe('Details Component', () => {
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
			flushSync() // Ensure state updates are applied immediately

			// Wait for transition to complete and content to appear
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
			// Locators automatically wait for DOM updates

			await expect
				.element(page.getByTestId('details-content'))
				.not.toBeInTheDocument()
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
			await expect.element(button).toHaveTextContent('Close')
			await expect
				.element(page.getByTestId('details-content'))
				.toBeInTheDocument()

			// Close
			await button.click()
			flushSync()
			await expect.element(button).toHaveTextContent('Toggle Details')
			await expect
				.element(page.getByTestId('details-content'))
				.not.toBeInTheDocument()

			// Open again
			await button.click()
			flushSync()
			await expect.element(button).toHaveTextContent('Close')
			await expect
				.element(page.getByTestId('details-content'))
				.toBeInTheDocument()
		})
	})

	describe('Content Rendering', () => {
		test('renders snippet content correctly', async () => {
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

		test('handles empty content gracefully', async () => {
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
	})

	describe('Accessibility', () => {
		test('button has correct accessibility attributes', async () => {
			render(Details, {
				button_text: 'Show Details',
			})

			const button = page.getByTestId('details-button')
			await expect.element(button).toHaveAttribute('type', 'button')
		})

		test('content is properly associated with button', async () => {
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
	})
})
