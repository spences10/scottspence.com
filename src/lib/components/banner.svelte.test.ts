import { page } from 'vitest/browser'
import { flushSync, untrack } from 'svelte'
import { describe, expect, it } from 'vitest'
import { render } from 'vitest-browser-svelte'
import type { BannerOptions } from './banner.svelte'
import Banner from './banner.svelte'

describe('Banner Component', () => {
	describe('Initial Rendering', () => {
		it('should render info banner with message', async () => {
			const options: BannerOptions = {
				type: 'info',
				message: 'This is an info message',
			}

			render(Banner, { options })

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

			render(Banner, { options })

			const banner = page.getByRole('banner')
			await expect.element(banner).toBeInTheDocument()
			await expect
				.element(banner)
				.toHaveTextContent('This is a warning message')
		})

		it('should render announcement banner with message', async () => {
			const options: BannerOptions = {
				type: 'announcement',
				message: 'This is an announcement message',
			}

			render(Banner, { options })

			const banner = page.getByRole('banner')
			await expect.element(banner).toBeInTheDocument()
			await expect
				.element(banner)
				.toHaveTextContent('This is an announcement message')
		})

		it('should render tip banner with message', async () => {
			const options: BannerOptions = {
				type: 'tip',
				message: 'This is a tip message',
			}

			render(Banner, { options })

			const banner = page.getByRole('banner')
			await expect.element(banner).toBeInTheDocument()
			await expect
				.element(banner)
				.toHaveTextContent('This is a tip message')
		})

		it('should render with default props when no options provided', async () => {
			render(Banner, {})

			const banner = page.getByRole('banner')
			await expect.element(banner).toBeInTheDocument()
			await expect.element(banner).toHaveTextContent('') // empty message
			await expect.element(banner).toHaveClass('bg-info') // default type
		})
	})

	describe('CSS Classes and Styling', () => {
		const variants = [
			{
				type: 'info',
				expectedBg: 'bg-info',
				expectedText: '!text-info-content',
			},
			{
				type: 'warning',
				expectedBg: 'bg-warning',
				expectedText: '!text-warning-content',
			},
			{
				type: 'announcement',
				expectedBg: 'bg-success',
				expectedText: '!text-success-content',
			},
			{
				type: 'tip',
				expectedBg: 'bg-info',
				expectedText: '!text-info-content',
			}, // tip uses info colors
		] as const

		variants.forEach(({ type, expectedBg, expectedText }) => {
			it(`should apply correct CSS classes for ${type} banner`, async () => {
				render(Banner, {
					options: { type, message: 'Test' },
				})

				const banner = page.getByRole('banner')
				await expect.element(banner).toHaveClass(expectedBg)
				await expect.element(banner).toHaveClass(expectedText)
				await expect.element(banner).toHaveClass('px-12')
				await expect.element(banner).toHaveClass('py-4')
				await expect.element(banner).toHaveClass('rounded-box')
				await expect.element(banner).toHaveClass('shadow-lg')
				await expect.element(banner).toHaveClass('all-prose')
			})
		})
	})

	describe('HTML Content Rendering', () => {
		it('should render HTML content in message', async () => {
			render(Banner, {
				options: {
					type: 'info',
					message:
						'This is <strong>bold</strong> text with <a href="#">link</a>',
				},
			})

			const banner = page.getByRole('banner')
			const strongElement = page.getByText('bold')
			const linkElement = page.getByRole('link')

			await expect.element(strongElement).toBeInTheDocument()
			await expect.element(strongElement).toHaveTextContent('bold')
			await expect.element(linkElement).toBeInTheDocument()
			await expect.element(linkElement).toHaveAttribute('href', '#')
		})

		it('should handle plain text messages', async () => {
			render(Banner, {
				options: {
					type: 'info',
					message: 'Plain text message',
				},
			})

			const banner = page.getByRole('banner')
			await expect
				.element(banner)
				.toHaveTextContent('Plain text message')
		})

		it('should handle empty message gracefully', async () => {
			render(Banner, {
				options: { type: 'warning', message: '' },
			})

			const banner = page.getByRole('banner')
			await expect.element(banner).toBeInTheDocument()
			await expect.element(banner).toHaveClass('bg-warning')
			await expect.element(banner).toHaveTextContent('')
		})
	})

	describe('Accessibility', () => {
		it('should have proper ARIA role', async () => {
			render(Banner, {
				options: { type: 'info', message: 'Test' },
			})

			const banner = page.getByRole('banner')
			await expect.element(banner).toHaveAttribute('role', 'banner')
		})

		it('should have proper prose classes for content accessibility', async () => {
			render(Banner, {
				options: {
					type: 'info',
					message: 'Test with <a href="#">link</a>',
				},
			})

			const banner = page.getByRole('banner')
			await expect.element(banner).toHaveClass('all-prose')
			await expect
				.element(banner)
				.toHaveClass('prose-a:text-info-content')

			const link = page.getByRole('link')
			await expect.element(link).toBeInTheDocument()
		})
	})

	describe('Rune State Logic', () => {
		it('should test banner type state transitions', async () => {
			let bannerState = $state({
				currentType: 'info' as BannerOptions['type'],
				previousType: null as BannerOptions['type'] | null,
			})

			// Derived state for tracking changes
			let hasTypeChanged = $derived(
				bannerState.currentType !== bannerState.previousType,
			)

			// Test initial state
			expect(untrack(() => hasTypeChanged)).toBe(true) // null !== 'info'

			// Simulate type change
			bannerState.previousType = bannerState.currentType
			bannerState.currentType = 'warning'
			flushSync()

			expect(untrack(() => hasTypeChanged)).toBe(true)
		})

		it('should test message content validation', async () => {
			let messageState = $state({
				content: 'Original message',
			})

			// Derived state for message analysis
			let messageLength = $derived(messageState.content.length)
			let containsHTML = $derived(
				/<[^>]*>/.test(messageState.content),
			)
			let isEmpty = $derived(messageState.content.trim().length === 0)

			// Test initial state
			expect(untrack(() => messageLength)).toBe(16)
			expect(untrack(() => containsHTML)).toBe(false)
			expect(untrack(() => isEmpty)).toBe(false)

			// Update with HTML content
			messageState.content = 'Message with <strong>HTML</strong>'
			flushSync()

			expect(untrack(() => messageLength)).toBe(34)
			expect(untrack(() => containsHTML)).toBe(true)
			expect(untrack(() => isEmpty)).toBe(false)

			// Test empty message
			messageState.content = ''
			flushSync()

			expect(untrack(() => isEmpty)).toBe(true)
		})
	})
})
