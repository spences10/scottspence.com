import { render } from 'svelte/server'
import { describe, expect, test } from 'vitest'
import BackToTop from './back-to-top.svelte'

describe('BackToTop.svelte SSR', () => {
	test('renders correctly on server', () => {
		const { body } = render(BackToTop)

		expect(body).toContain('Back to top')
		expect(body).toContain('data-testid="back-to-top"')
		expect(body).toContain('aria-label="Back to top"')
	})

	test('includes all required CSS classes in SSR', () => {
		const { body } = render(BackToTop)

		expect(body).toContain('btn')
		expect(body).toContain('btn-secondary')
		expect(body).toContain('text-secondary-content')
		expect(body).toContain('rounded-box')
		expect(body).toContain('fixed')
		expect(body).toContain('right-5')
	})

	test('renders with initial hidden state', () => {
		const { body } = render(BackToTop)

		// Should have hide-button class initially
		expect(body).toContain('hide-button')
		expect(body).not.toContain('show-button')
	})

	test('renders as a button element', () => {
		const { body } = render(BackToTop)

		expect(body).toContain('<button')
		expect(body).toContain('</button>')
	})

	test('includes proper accessibility attributes', () => {
		const { body } = render(BackToTop)

		expect(body).toContain('aria-label="Back to top"')
		expect(body).toContain('data-testid="back-to-top"')
	})

	test('does not include client-side only attributes', () => {
		const { body } = render(BackToTop)

		// Should not contain any client-side state that would cause hydration mismatches
		expect(body).not.toContain('undefined')
		expect(body).not.toContain('null')
	})

	test('renders complete HTML structure', () => {
		const { body } = render(BackToTop)

		// Should contain a button element (accounting for Svelte SSR comments)
		expect(body).toContain('<button')
		expect(body).toContain('</button>')
		expect(body).toContain('Back to top')
	})

	test('includes all positioning classes', () => {
		const { body } = render(BackToTop)

		expect(body).toContain('right-5')
		expect(body).toContain('bottom-[-2rem]')
		expect(body).toContain('fixed')
	})
})
