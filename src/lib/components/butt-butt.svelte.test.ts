import { describe, expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-svelte'
import ButtButt from './butt-butt.svelte'

globalThis.IntersectionObserver = vi.fn(() => ({
	observe: () => null,
	unobserve: () => null,
	disconnect: () => null,
})) as unknown as typeof globalThis.IntersectionObserver

vi.mock('IntersectionObserver', () => ({
	observe: () => null,
	unobserve: () => null,
	disconnect: () => null,
	mock: 'IntersectionObserver mock property',
}))

describe('ButtButt', () => {
	it.skip('should render', () => {
		const { container } = render(ButtButt)
		expect(
			container.textContent?.includes(
				'Looks like you have reached the bottom of this page!',
			),
		).toBeTruthy()
	})

	it.skip('should not display the butt image initially', () => {
		const { container } = render(ButtButt)
		expect(
			container.querySelector('[alt="a cheeky butt"]'),
		).toBeFalsy()
	})
})
