import { expect, test } from '@playwright/test'

test.describe('BackToTop', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/')
	})

	test('should scroll to the top when the button is clicked', async ({
		page,
	}) => {
		// Scroll down to trigger the back-to-top button to appear
		await page.evaluate(() => {
			window.scrollTo({ top: 500 })
		})

		// Wait for button to become visible (it animates in over 0.3s)
		await page.waitForSelector(
			'[aria-label="Back to top"].show-button',
			{
				state: 'visible',
			},
		)

		await page.click('[aria-label="Back to top"]')
		await page.waitForTimeout(1000)

		const scrollTop = await page.evaluate(() => window.pageYOffset)
		expect(scrollTop).toBe(0)
	})
})
