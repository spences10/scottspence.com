import { cleanup, render } from '@testing-library/svelte/svelte5'
import { afterEach, describe, expect, it } from 'vitest'
import Banner from './banner.svelte'

interface BannerOptions {
	type: 'info' | 'tip' | 'warning' | 'announcement'
	message: string
}

describe('Banner', () => {
	afterEach(cleanup)
	it('should render info banner with message', () => {
		const options: BannerOptions = {
			type: 'info',
			message: 'This is an info message',
		}

		const { getByText, getByRole } = render(Banner, {
			props: {
				options,
			},
		})

		expect(getByText('This is an info message')).toBeTruthy()
		expect(getByRole('banner')).toBeTruthy()
	})

	it('should render warning banner with message', () => {
		const options: BannerOptions = {
			type: 'warning',
			message: 'This is a warning message',
		}

		const { getByText, getByRole } = render(Banner, {
			props: {
				options,
			},
		})

		expect(getByText('This is a warning message')).toBeTruthy()
		expect(getByRole('banner')).toBeTruthy()
	})

	it('should render announcement banner with message', () => {
		const options: BannerOptions = {
			type: 'announcement',
			message: 'This is a announcement message',
		}

		const { getByText, getByRole } = render(Banner, {
			props: {
				options,
			},
		})

		expect(getByText('This is a announcement message')).toBeTruthy()
		expect(getByRole('banner')).toBeTruthy()
	})

	it('should render tip banner with message', () => {
		const options: BannerOptions = {
			type: 'tip',
			message: 'This is a tip message',
		}

		const { getByText, getByRole } = render(Banner, {
			props: {
				options,
			},
		})

		expect(getByText('This is a tip message')).toBeTruthy()
		expect(getByRole('banner')).toBeTruthy()
	})
})
