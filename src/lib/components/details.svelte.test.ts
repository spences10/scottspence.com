import { describe, expect, test } from 'vitest'
import { render } from 'vitest-browser-svelte'
import Details from './details.svelte'

describe('Details', () => {
	test('renders with default props', async () => {
		const { container } = render(Details)
		const button = container.querySelector(
			'[data-testid="details-button"]',
		)
		expect(button?.textContent?.trim()).toBe('')
		expect(
			container.querySelector('[data-testid="details-content"]'),
		).toBeNull()
	})

	test('renders with custom button text', async () => {
		const { container } = render(Details, {
			props: { buttonText: 'Show Details' },
		})
		const button = container.querySelector(
			'[data-testid="details-button"]',
		)
		expect(button?.textContent?.trim()).toBe('Show Details')
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

		const button = container.querySelector(
			'[data-testid="details-button"]',
		) as HTMLElement
		expect(
			container.querySelector('[data-testid="details-content"]'),
		).toBeNull()

		// Open details
		button.click()
		flushSync()
		const content = container.querySelector(
			'[data-testid="details-content"]',
		)
		expect(content).toBeDefined()
		expect(content?.textContent).toContain('Test Content')
		expect(button.textContent?.trim()).toBe('Close')

		// Close details
		button.click()
		flushSync()
		expect(
			container.querySelector('[data-testid="details-content"]'),
		).toBeNull()
		expect(button.textContent?.trim()).toBe('Show Details')
	})

	test('applies custom styles', async () => {
		const { container } = render(Details, {
			props: { styles: 'custom-class' },
		})
		const button = container.querySelector(
			'[data-testid="details-button"]',
		)
		expect(button?.classList.contains('custom-class')).toBe(true)
	})

	test.skip('renders children when open', async () => {
		render(Details, {
			props: {
				buttonText: 'Show Details',
				// children: () => 'Test Content',
			},
		})

		const button = container.querySelector(
			'[data-testid="details-button"]',
		) as HTMLElement
		button.click()
		flushSync()

		const content = container.querySelector(
			'[data-testid="details-content"]',
		)
		expect(content?.textContent).toContain('Test Content')
	})

	test.skip('respects initial isOpen prop', async () => {
		render(Details, {
			props: {
				buttonText: 'Show Details',
				isOpen: true,
				// children: () => 'Test Content',
			},
		})

		const content = container.querySelector(
			'[data-testid="details-content"]',
		)
		expect(content?.textContent).toContain('Test Content')
		expect(
			container
				.querySelector('[data-testid="details-button"]')
				?.textContent?.trim(),
		).toBe('Close')
	})
})
