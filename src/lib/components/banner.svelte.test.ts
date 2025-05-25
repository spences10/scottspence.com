import { describe, expect, it } from 'vitest'
import { render } from 'vitest-browser-svelte'
import Banner from './banner.svelte'

interface BannerOptions {
	type: 'info' | 'tip' | 'warning' | 'announcement'
	message: string
}

describe('Banner', () => {
	it('should render info banner with message', () => {
		const options: BannerOptions = {
			type: 'info',
			message: 'This is an info message',
		}

		const { container } = render(Banner, {
			props: {
				options,
			},
		})

		expect(
			container.textContent?.includes('This is an info message'),
		).toBeTruthy()
		expect(container.querySelector('[role="banner"]')).toBeTruthy()
	})

	it('should render warning banner with message', () => {
		const options: BannerOptions = {
			type: 'warning',
			message: 'This is a warning message',
		}

		const { container } = render(Banner, {
			props: {
				options,
			},
		})

		expect(
			container.textContent?.includes('This is a warning message'),
		).toBeTruthy()
		expect(container.querySelector('[role="banner"]')).toBeTruthy()
	})

	it('should render announcement banner with message', () => {
		const options: BannerOptions = {
			type: 'announcement',
			message: 'This is a announcement message',
		}

		const { container } = render(Banner, {
			props: {
				options,
			},
		})

		expect(
			container.textContent?.includes(
				'This is a announcement message',
			),
		).toBeTruthy()
		expect(container.querySelector('[role="banner"]')).toBeTruthy()
	})

	it('should render tip banner with message', () => {
		const options: BannerOptions = {
			type: 'tip',
			message: 'This is a tip message',
		}

		const { container } = render(Banner, {
			props: {
				options,
			},
		})

		expect(
			container.textContent?.includes('This is a tip message'),
		).toBeTruthy()
		expect(container.querySelector('[role="banner"]')).toBeTruthy()
	})
})
