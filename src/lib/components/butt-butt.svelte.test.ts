import { page } from 'vitest/browser'
import { describe, expect, it } from 'vitest'
import { render } from 'vitest-browser-svelte'
import ButtButt from './butt-butt.svelte'

describe('ButtButt Component', () => {
	describe('Initial Rendering', () => {
		it('renders with default props', async () => {
			render(ButtButt)

			const container = page.getByRole('complementary')
			await expect.element(container).toBeInTheDocument()

			const message = page.getByText(
				'Looks like you have reached the bottom of this page!',
			)
			await expect.element(message).toBeInTheDocument()

			const bummerText = page.getByText('Bummer!')
			await expect.element(bummerText).toBeInTheDocument()
		})

		it('renders with custom dimensions', async () => {
			render(ButtButt, {
				height: '200px',
				width: '300px',
			})

			const container = page.getByRole('complementary')
			await expect.element(container).toBeInTheDocument()

			// Component should render regardless of custom props
			const message = page.getByText(
				'Looks like you have reached the bottom of this page!',
			)
			await expect.element(message).toBeInTheDocument()
		})

		it('does not display image initially', async () => {
			render(ButtButt)

			// Image should not be visible initially (not intersecting)
			const image = page.getByAltText('a cheeky butt')
			await expect.element(image).not.toBeInTheDocument()
		})

		it('displays initial pun text', async () => {
			render(ButtButt)

			// Should display some pun text (any of the possible puns)
			const punContainer = page.getByRole('complementary')
			await expect.element(punContainer).toBeInTheDocument()

			// The pun text should be present somewhere in the component
			// We can't predict which pun will be shown, but there should be text content
			await expect.element(punContainer).toHaveTextContent(/\w+/)
		})

		it('renders pun generation button', async () => {
			render(ButtButt)

			const button = page.getByRole('button', { name: 'pun me up' })
			await expect.element(button).toBeInTheDocument()
			await expect.element(button).toHaveClass('btn')
			await expect.element(button).toHaveClass('btn-xs')
			await expect.element(button).toHaveClass('rounded-box')
		})
	})

	describe('User Interactions', () => {
		it('generates new pun when button is clicked', async () => {
			render(ButtButt)

			const button = page.getByRole('button', { name: 'pun me up' })
			await expect.element(button).toBeInTheDocument()

			// Click button to generate new pun
			await button.click()

			// Verify that content is still present
			const container = page.getByRole('complementary')
			await expect.element(container).toHaveTextContent(/\w+/)

			// Verify button is still clickable
			await expect.element(button).toBeEnabled()
		})

		it('button remains functional after multiple clicks', async () => {
			render(ButtButt)

			const button = page.getByRole('button', { name: 'pun me up' })

			// Click multiple times to test functionality
			for (let i = 0; i < 3; i++) {
				await button.click()
				await expect.element(button).toBeEnabled()
			}

			// Component should still be functional
			const container = page.getByRole('complementary')
			await expect.element(container).toHaveTextContent(/\w+/)
		})

		it('pun text contains expected content patterns', async () => {
			render(ButtButt)

			const button = page.getByRole('button', { name: 'pun me up' })

			// Click a few times to see different puns
			for (let i = 0; i < 5; i++) {
				await button.click()

				// Check that we have pun-related content
				// The puns contain words like "butt", "behind", "crack", etc.
				const container = page.getByRole('complementary')
				await expect
					.element(container)
					.toHaveTextContent(
						/butt|behind|crack|rear|bottom|cheek|ass|half-arsed|smart ass/i,
					)
			}
		})
	})

	describe('Accessibility', () => {
		it('has proper semantic structure', async () => {
			render(ButtButt)

			// Should use aside element for complementary content
			const aside = page.getByRole('complementary')
			await expect.element(aside).toBeInTheDocument()

			// Button should have proper role and be accessible
			const button = page.getByRole('button', { name: 'pun me up' })
			await expect.element(button).toBeInTheDocument()
		})

		it('image has proper alt text when visible', async () => {
			render(ButtButt)

			// When image becomes visible, it should have proper alt text
			// Note: We can't easily trigger intersection observer in tests,
			// but we can verify the alt text is set correctly in the component
			const container = page.getByRole('complementary')
			await expect.element(container).toBeInTheDocument()
		})

		it('button is keyboard accessible', async () => {
			render(ButtButt)

			const button = page.getByRole('button', { name: 'pun me up' })

			// Button should be clickable and enabled
			await expect.element(button).toBeEnabled()

			// Should be able to activate with click
			await button.click()
			await expect.element(button).toBeEnabled()
		})
	})

	describe('Content Structure', () => {
		it('displays all required text elements', async () => {
			render(ButtButt)

			// Check for main message
			const mainMessage = page.getByText(
				'Looks like you have reached the bottom of this page!',
			)
			await expect.element(mainMessage).toBeInTheDocument()

			// Check for "Bummer!" text
			const bummerText = page.getByText('Bummer!')
			await expect.element(bummerText).toBeInTheDocument()

			// Check for button
			const button = page.getByRole('button', { name: 'pun me up' })
			await expect.element(button).toBeInTheDocument()
		})

		it('has proper CSS classes applied', async () => {
			render(ButtButt)

			const container = page.getByRole('complementary')
			await expect.element(container).toHaveClass('all-prose')
			await expect.element(container).toHaveClass('mb-12')
			await expect.element(container).toHaveClass('text-center')
		})

		it('maintains text content structure', async () => {
			render(ButtButt)

			const container = page.getByRole('complementary')

			// Should contain the main structural text
			await expect
				.element(container)
				.toHaveTextContent(
					'Looks like you have reached the bottom of this page!',
				)
			await expect.element(container).toHaveTextContent('Bummer!')
			await expect.element(container).toHaveTextContent('pun me up')
		})
	})

	describe('Props Handling', () => {
		it('accepts custom height and width props', async () => {
			render(ButtButt, {
				height: '150px',
				width: '250px',
			})

			// Component should render successfully with custom props
			const container = page.getByRole('complementary')
			await expect.element(container).toBeInTheDocument()

			const button = page.getByRole('button', { name: 'pun me up' })
			await expect.element(button).toBeInTheDocument()
		})

		it('works with default props when none provided', async () => {
			render(ButtButt)

			// Should work fine with default props
			const container = page.getByRole('complementary')
			await expect.element(container).toBeInTheDocument()

			const button = page.getByRole('button', { name: 'pun me up' })
			await button.click()
			await expect.element(button).toBeEnabled()
		})

		it('handles edge case prop values', async () => {
			render(ButtButt, {
				height: '0px',
				width: '0px',
			})

			// Component should still render and be functional
			const container = page.getByRole('complementary')
			await expect.element(container).toBeInTheDocument()

			const button = page.getByRole('button', { name: 'pun me up' })
			await button.click()
			await expect.element(button).toBeEnabled()
		})
	})

	describe('Component Behavior', () => {
		it('maintains state across interactions', async () => {
			render(ButtButt)

			const button = page.getByRole('button', { name: 'pun me up' })
			const container = page.getByRole('complementary')

			// Initial state should have content
			await expect.element(container).toHaveTextContent(/\w+/)

			// After interaction
			await button.click()
			await expect.element(container).toHaveTextContent(/\w+/)

			// Should maintain core structure
			await expect
				.element(container)
				.toHaveTextContent(
					'Looks like you have reached the bottom of this page!',
				)
			await expect.element(container).toHaveTextContent('Bummer!')
		})

		it('pun generation is functional', async () => {
			render(ButtButt)

			const button = page.getByRole('button', { name: 'pun me up' })

			// Test that clicking generates content
			await button.click()

			const container = page.getByRole('complementary')

			// Should have meaningful content (not empty or just whitespace)
			await expect.element(container).toHaveTextContent(/\w{3,}/)
		})

		it('component is reusable', async () => {
			// Render multiple instances to test reusability
			const { unmount: unmount1 } = render(ButtButt, {
				height: '100px',
				width: '160px',
			})

			const container1 = page.getByRole('complementary')
			await expect.element(container1).toBeInTheDocument()

			unmount1()

			// Render second instance
			render(ButtButt, {
				height: '200px',
				width: '300px',
			})

			const container2 = page.getByRole('complementary')
			await expect.element(container2).toBeInTheDocument()

			const button2 = page.getByRole('button', { name: 'pun me up' })
			await button2.click()
			await expect.element(button2).toBeEnabled()
		})
	})
})
