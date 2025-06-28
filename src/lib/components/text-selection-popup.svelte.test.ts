import { page } from '@vitest/browser/context'
import { describe, it, expect } from 'vitest'
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
			render(TextSelectionPopup, { props: defaultProps })
			
			await expect.element(page.getByRole('link')).toBeInTheDocument()
			await expect.element(page.getByText('Share')).toBeInTheDocument()
		})

		it('should not render when visible is false', async () => {
			render(TextSelectionPopup, { 
				props: { ...defaultProps, visible: false } 
			})
			
			const link = page.getByRole('link')
			await expect.element(link).not.toBeInTheDocument()
		})

		it('should not render when selected_text is empty', async () => {
			render(TextSelectionPopup, { 
				props: { ...defaultProps, selected_text: '' } 
			})
			
			const link = page.getByRole('link')
			await expect.element(link).not.toBeInTheDocument()
		})

		it('should not render when selected_text is only whitespace', async () => {
			render(TextSelectionPopup, { 
				props: { ...defaultProps, selected_text: '   \n\t   ' } 
			})
			
			const link = page.getByRole('link')
			await expect.element(link).not.toBeInTheDocument()
		})
	})

	describe('Link Attributes', () => {
		it('should have correct link attributes for external navigation', async () => {
			render(TextSelectionPopup, { props: defaultProps })
			
			const link = page.getByRole('link')
			
			await expect.element(link).toHaveAttribute('rel', 'noreferrer noopener')
			await expect.element(link).toHaveAttribute('target', '_blank')
		})

		it('should have accessible aria-label', async () => {
			render(TextSelectionPopup, { props: defaultProps })
			
			const link = page.getByRole('link')
			
			await expect.element(link).toHaveAttribute('aria-label', 'Share selected text on Bluesky')
		})
	})

	describe('Styling and Classes', () => {
		it('should have correct button styling classes', async () => {
			render(TextSelectionPopup, { props: defaultProps })
			
			const button = page.getByRole('link')
			
			await expect.element(button).toHaveClass(/btn/)
			await expect.element(button).toHaveClass(/btn-sm/)
			await expect.element(button).toHaveClass(/btn-primary/)
			await expect.element(button).toHaveClass(/inline-flex/)
			await expect.element(button).toHaveClass(/items-center/)
			await expect.element(button).toHaveClass(/gap-2/)
		})
	})

	describe('Edge Cases', () => {
		it('should handle selected text that is only newlines and spaces', async () => {
			render(TextSelectionPopup, { 
				props: { ...defaultProps, selected_text: '\n\n   \t\t  \n' } 
			})
			
			await expect.element(page.getByRole('link')).not.toBeInTheDocument()
		})
	})

	describe('Accessibility', () => {
		it('should have proper ARIA attributes', async () => {
			render(TextSelectionPopup, { props: defaultProps })
			
			const link = page.getByRole('link')
			
			await expect.element(link).toHaveAttribute('aria-label', 'Share selected text on Bluesky')
		})

		it('should have readable text content', async () => {
			render(TextSelectionPopup, { props: defaultProps })
			
			await expect.element(page.getByText('Share')).toBeInTheDocument()
		})
	})

	describe('Positioning', () => {
		it('should update position when x and y coordinates change', async () => {
			const { rerender } = render(TextSelectionPopup, { props: defaultProps })
			
			const popup = page.getByRole('link').parentElement?.parentElement
			await expect.element(popup).toHaveStyle('left: 100px; top: 200px;')
			
			await rerender({ ...defaultProps, x: 300, y: 400 })
			await expect.element(popup).toHaveStyle('left: 300px; top: 400px;')
		})

		it('should handle edge positioning coordinates', async () => {
			render(TextSelectionPopup, { 
				props: { ...defaultProps, x: 0, y: 0 } 
			})
			
			const popup = page.getByRole('link').parentElement?.parentElement
			await expect.element(popup).toHaveStyle('left: 0px; top: 0px;')
		})

		it('should handle negative positioning coordinates', async () => {
			render(TextSelectionPopup, { 
				props: { ...defaultProps, x: -10, y: -20 } 
			})
			
			const popup = page.getByRole('link').parentElement?.parentElement
			await expect.element(popup).toHaveStyle('left: -10px; top: -20px;')
		})
	})

	describe('Bluesky Text Generation', () => {
		it('should generate correct bluesky text with default props', async () => {
			render(TextSelectionPopup, { props: defaultProps })
			
			const link = page.getByRole('link')
			const expectedText = `"${defaultProps.selected_text}"\n\nFrom: ${defaultProps.post_title}\n${defaultProps.post_url}\nvia @scottspence.dev`
			const expectedHref = `https://bsky.app/intent/compose?text=${encodeURIComponent(expectedText)}`
			
			await expect.element(link).toHaveAttribute('href', expectedHref)
		})

		it('should handle special characters in selected text', async () => {
			const specialTextProps = {
				...defaultProps,
				selected_text: 'Text with "quotes" & <tags> and émojis 🎉',
			}
			
			render(TextSelectionPopup, { props: specialTextProps })
			
			const link = page.getByRole('link')
			const expectedText = `"${specialTextProps.selected_text}"\n\nFrom: ${specialTextProps.post_title}\n${specialTextProps.post_url}\nvia @scottspence.dev`
			const expectedHref = `https://bsky.app/intent/compose?text=${encodeURIComponent(expectedText)}`
			
			await expect.element(link).toHaveAttribute('href', expectedHref)
		})

		it('should update bluesky text when props change', async () => {
			const { rerender } = render(TextSelectionPopup, { props: defaultProps })
			
			const link = page.getByRole('link')
			const initialExpectedText = `"${defaultProps.selected_text}"\n\nFrom: ${defaultProps.post_title}\n${defaultProps.post_url}\nvia @scottspence.dev`
			const initialExpectedHref = `https://bsky.app/intent/compose?text=${encodeURIComponent(initialExpectedText)}`
			
			await expect.element(link).toHaveAttribute('href', initialExpectedHref)
			
			const newProps = {
				...defaultProps,
				selected_text: 'Updated selected text',
				post_title: 'Updated Post Title',
				post_url: 'https://scottspence.com/posts/updated-post'
			}
			
			await rerender(newProps)
			
			const updatedExpectedText = `"${newProps.selected_text}"\n\nFrom: ${newProps.post_title}\n${newProps.post_url}\nvia @scottspence.dev`
			const updatedExpectedHref = `https://bsky.app/intent/compose?text=${encodeURIComponent(updatedExpectedText)}`
			
			await expect.element(link).toHaveAttribute('href', updatedExpectedHref)
		})
	})

	describe('Reactive Behavior', () => {
		it('should show popup when becoming visible with existing text', async () => {
			const { rerender } = render(TextSelectionPopup, { 
				props: { ...defaultProps, visible: false } 
			})
			
			await expect.element(page.getByRole('link')).not.toBeInTheDocument()
			
			await rerender({ ...defaultProps, visible: true })
			await expect.element(page.getByRole('link')).toBeInTheDocument()
		})

		it('should hide popup when becoming invisible', async () => {
			const { rerender } = render(TextSelectionPopup, { props: defaultProps })
			
			await expect.element(page.getByRole('link')).toBeInTheDocument()
			
			await rerender({ ...defaultProps, visible: false })
			await expect.element(page.getByRole('link')).not.toBeInTheDocument()
		})

		it('should handle rapid position updates', async () => {
			const { rerender } = render(TextSelectionPopup, { props: defaultProps })
			
			const popup = page.getByRole('link').parentElement?.parentElement
			
			await rerender({ ...defaultProps, x: 150, y: 250 })
			await expect.element(popup).toHaveStyle('left: 150px; top: 250px;')
			
			await rerender({ ...defaultProps, x: 200, y: 300 })
			await expect.element(popup).toHaveStyle('left: 200px; top: 300px;')
			
			await rerender({ ...defaultProps, x: 250, y: 350 })
			await expect.element(popup).toHaveStyle('left: 250px; top: 350px;')
		})
	})

})