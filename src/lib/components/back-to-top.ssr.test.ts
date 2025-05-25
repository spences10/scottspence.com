import { render } from 'svelte/server'
import { describe, expect, it } from 'vitest'
import BackToTop from './back-to-top.svelte'
describe('BackToTop.svelte SSR', () => {
	it('renders', () => {
		const { body } = render(BackToTop)
		expect(body).toContain('Back to top')
	})
})
