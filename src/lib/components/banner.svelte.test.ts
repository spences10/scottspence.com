import { page } from '@vitest/browser/context'
import { describe, expect, it } from 'vitest'
import { render } from 'vitest-browser-svelte'
import type { BannerOptions } from './banner.svelte'
import Banner from './banner.svelte'

describe('Banner', () => {
	it('should render info banner with message', async () => {
		const options: BannerOptions = {
			type: 'info',
			message: 'This is an info message',
		}

		render(Banner, {
			props: {
				options,
			},
		})

		const banner = page.getByRole('banner')
		await expect.element(banner).toBeInTheDocument()
		await expect
			.element(banner)
			.toHaveTextContent('This is an info message')
	})

	it('should render warning banner with message', async () => {
		const options: BannerOptions = {
			type: 'warning',
			message: 'This is a warning message',
		}

		render(Banner, {
			props: {
				options,
			},
		})

		const banner = page.getByRole('banner')
		await expect.element(banner).toBeInTheDocument()
		await expect
			.element(banner)
			.toHaveTextContent('This is a warning message')
	})

	it('should render announcement banner with message', async () => {
		const options: BannerOptions = {
			type: 'announcement',
			message: 'This is a announcement message',
		}

		render(Banner, {
			props: {
				options,
			},
		})

		const banner = page.getByRole('banner')
		await expect.element(banner).toBeInTheDocument()
		await expect
			.element(banner)
			.toHaveTextContent('This is a announcement message')
	})

	it('should render tip banner with message', async () => {
		const options: BannerOptions = {
			type: 'tip',
			message: 'This is a tip message',
		}

		render(Banner, {
			props: {
				options,
			},
		})

		const banner = page.getByRole('banner')
		await expect.element(banner).toBeInTheDocument()
		await expect
			.element(banner)
			.toHaveTextContent('This is a tip message')
	})
})
