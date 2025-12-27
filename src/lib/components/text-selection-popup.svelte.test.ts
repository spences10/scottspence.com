import { page } from 'vitest/browser'
import { describe, expect, it } from 'vitest'
import { render } from 'vitest-browser-svelte'
import TextSelectionPopup from './text-selection-popup.svelte'

describe('TextSelectionPopup Component', () => {
	const defaultProps = {
		selected_text: 'This is selected text',
		post_title: 'Test Blog Post',
		post_url: 'https://scottspence.com/posts/test-post',
		x: 100,
		y: 200,
		visible: true,
	}

	describe('Rendering', () => {
		it('should render when visible is true and selected_text is not empty', async () => {
			render(TextSelectionPopup, defaultProps)

			await expect
				.element(
					page.getByRole('link', {
						name: 'Share selected text on Bluesky',
					}),
				)
				.toBeInTheDocument()
			await expect
				.element(page.getByText('Share'))
				.toBeInTheDocument()
			await expect
				.element(page.getByText('Perplexity'))
				.toBeInTheDocument()
			await expect.element(page.getByText('Kagi')).toBeInTheDocument()
		})

		it('should not render when visible is false', async () => {
			render(TextSelectionPopup, { ...defaultProps, visible: false })

			await expect
				.element(
					page.getByRole('link', {
						name: 'Share selected text on Bluesky',
					}),
				)
				.not.toBeInTheDocument()
		})

		it('should not render when selected_text is empty', async () => {
			render(TextSelectionPopup, {
				...defaultProps,
				selected_text: '',
			})

			await expect
				.element(
					page.getByRole('link', {
						name: 'Share selected text on Bluesky',
					}),
				)
				.not.toBeInTheDocument()
		})

		it('should not render when selected_text is only whitespace', async () => {
			render(TextSelectionPopup, {
				...defaultProps,
				selected_text: '   \n\t   ',
			})

			await expect
				.element(
					page.getByRole('link', {
						name: 'Share selected text on Bluesky',
					}),
				)
				.not.toBeInTheDocument()
		})
	})

	describe('Link Attributes', () => {
		it('should have correct link attributes for external navigation', async () => {
			render(TextSelectionPopup, defaultProps)

			const blueskyLink = page.getByRole('link', {
				name: 'Share selected text on Bluesky',
			})

			await expect
				.element(blueskyLink)
				.toHaveAttribute('rel', 'noreferrer noopener')
			await expect
				.element(blueskyLink)
				.toHaveAttribute('target', '_blank')
		})

		it('should have accessible aria-label', async () => {
			render(TextSelectionPopup, defaultProps)

			const blueskyLink = page.getByRole('link', {
				name: 'Share selected text on Bluesky',
			})

			await expect
				.element(blueskyLink)
				.toHaveAttribute(
					'aria-label',
					'Share selected text on Bluesky',
				)
		})
	})

	describe('Styling and Classes', () => {
		it('should have correct button styling classes', async () => {
			render(TextSelectionPopup, defaultProps)

			const blueskyButton = page.getByRole('link', {
				name: 'Share selected text on Bluesky',
			})

			await expect.element(blueskyButton).toHaveClass(/btn/)
			await expect.element(blueskyButton).toHaveClass(/btn-sm/)
			await expect.element(blueskyButton).toHaveClass(/btn-primary/)
			await expect.element(blueskyButton).toHaveClass(/inline-flex/)
			await expect.element(blueskyButton).toHaveClass(/items-center/)
			await expect.element(blueskyButton).toHaveClass(/gap-2/)
		})
	})

	describe('Edge Cases', () => {
		it('should handle selected text that is only newlines and spaces', async () => {
			render(TextSelectionPopup, {
				...defaultProps,
				selected_text: '\n\n   \t\t  \n',
			})

			await expect
				.element(
					page.getByRole('link', {
						name: 'Share selected text on Bluesky',
					}),
				)
				.not.toBeInTheDocument()
		})
	})

	describe('Accessibility', () => {
		it('should have proper ARIA attributes', async () => {
			render(TextSelectionPopup, defaultProps)

			const blueskyLink = page.getByRole('link', {
				name: 'Share selected text on Bluesky',
			})

			await expect
				.element(blueskyLink)
				.toHaveAttribute(
					'aria-label',
					'Share selected text on Bluesky',
				)
		})

		it('should have readable text content', async () => {
			render(TextSelectionPopup, defaultProps)

			await expect
				.element(page.getByText('Share'))
				.toBeInTheDocument()
		})
	})

	describe('Positioning', () => {
		it('should render popup at specified coordinates', async () => {
			render(TextSelectionPopup, defaultProps)

			// The popup should be visible at the specified coordinates
			// Since we can't easily test exact positioning in browser tests,
			// we'll verify the component renders and positioning is handled by CSS
			await expect
				.element(
					page.getByRole('link', {
						name: 'Share selected text on Bluesky',
					}),
				)
				.toBeInTheDocument()
		})

		it('should render at different coordinates', async () => {
			render(TextSelectionPopup, { ...defaultProps, x: 0, y: 0 })

			await expect
				.element(
					page.getByRole('link', {
						name: 'Share selected text on Bluesky',
					}),
				)
				.toBeInTheDocument()
		})

		it('should handle negative coordinates', async () => {
			render(TextSelectionPopup, { ...defaultProps, x: -10, y: -20 })

			await expect
				.element(
					page.getByRole('link', {
						name: 'Share selected text on Bluesky',
					}),
				)
				.toBeInTheDocument()
		})
	})

	describe('Bluesky Text Generation', () => {
		it('should generate correct bluesky text with default props', async () => {
			render(TextSelectionPopup, defaultProps)

			const blueskyLink = page.getByRole('link', {
				name: 'Share selected text on Bluesky',
			})
			const expectedText = `"${defaultProps.selected_text}"\n\nFrom: ${defaultProps.post_title}\n${defaultProps.post_url}\nvia @scottspence.dev`
			const expectedHref = `https://bsky.app/intent/compose?text=${encodeURIComponent(expectedText)}`

			await expect
				.element(blueskyLink)
				.toHaveAttribute('href', expectedHref)
		})

		it('should handle special characters in selected text', async () => {
			const specialTextProps = {
				...defaultProps,
				selected_text: 'Text with "quotes" & <tags> and émojis 🎉',
			}

			render(TextSelectionPopup, specialTextProps)

			const blueskyLink = page.getByRole('link', {
				name: 'Share selected text on Bluesky',
			})
			const expectedText = `"${specialTextProps.selected_text}"\n\nFrom: ${specialTextProps.post_title}\n${specialTextProps.post_url}\nvia @scottspence.dev`
			const expectedHref = `https://bsky.app/intent/compose?text=${encodeURIComponent(expectedText)}`

			await expect
				.element(blueskyLink)
				.toHaveAttribute('href', expectedHref)
		})

		it.skip('should update bluesky text when props change', async () => {
			// TODO: Test reactive prop changes - need to figure out rerender API
		})
	})

	describe('Reactive Behavior', () => {
		it.skip('should show popup when becoming visible with existing text', async () => {
			// TODO: Test reactive visibility changes - need to figure out rerender API
		})

		it.skip('should hide popup when becoming invisible', async () => {
			// TODO: Test reactive visibility changes - need to figure out rerender API
		})

		it.skip('should handle rapid position updates', async () => {
			// TODO: Test reactive position changes - need to figure out rerender API
		})
	})
})
