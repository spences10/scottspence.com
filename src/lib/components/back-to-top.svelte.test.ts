import { tick } from 'svelte'
import {
	afterEach,
	beforeAll,
	describe,
	expect,
	it,
	vi,
} from 'vitest'
import { render } from 'vitest-browser-svelte'
import BackToTop from './back-to-top.svelte'

function renderBackToTop(offset = 0) {
	const component = render(BackToTop)
	Object.defineProperty(window, 'scrollY', {
		value: offset,
		writable: true,
	})
	return component
}

describe('BackToTop', () => {
	afterEach(() => {
		window.scrollY = 0
	})

	beforeAll(() => {
		// Mock the animate function
		HTMLElement.prototype.animate = vi.fn().mockImplementation(() => {
			return {
				pause: vi.fn(),
				play: vi.fn(),
				finish: vi.fn(),
				cancel: vi.fn(),
				reverse: vi.fn(),
				// Add any other methods or properties used by the animations
			}
		})
	})

	it('should not render the button initially', () => {
		const { container } = renderBackToTop()
		const button = container.querySelector(
			'[data-testid="back-to-top"]',
		)
		expect(button).toBeTruthy()
		expect(button?.classList.contains('show-button')).toBeFalsy()
	})

	it('should render the button when scrolling down', async () => {
		const { container } = renderBackToTop(100)
		window.dispatchEvent(new Event('scroll'))
		await new Promise((resolve) => setTimeout(resolve, 400))

		const button = container.querySelector(
			'[data-testid="back-to-top"]',
		)
		expect(button).toBeTruthy()
	})

	it('should not render the button when scrolling up after scrolling down', async () => {
		const { container } = renderBackToTop(1000)

		window.dispatchEvent(new Event('scroll'))
		await tick()

		window.scrollY = 50
		window.dispatchEvent(new Event('scroll'))
		await tick()

		const button = container.querySelector(
			'[data-testid="back-to-top"]',
		)
		expect(button?.classList.contains('show-button')).toBeFalsy()
	})

	it('should scroll to the top when the button is clicked', async () => {
		const { container } = renderBackToTop(1000)
		window.dispatchEvent(new Event('scroll'))
		await new Promise((resolve) => setTimeout(resolve, 0))

		const scrollToMock = vi.fn((options) => {
			window.scrollY = options.top
		})
		window.scrollTo = scrollToMock

		const button = container.querySelector(
			'[aria-label="Back to top"]',
		) as HTMLElement
		button.click()

		expect(window.scrollY).toBe(0)
		expect(scrollToMock).toHaveBeenCalledWith({
			top: 0,
			behavior: 'smooth',
		})
	})
})
