import { expect, test } from '@playwright/test';

test.describe('BackToTop', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
	});

	test('should scroll to the top when the button is clicked', async ({
		page,
	}) => {
		// Home page load alone takes 2-3s, which crowds the 5s default
		test.slow();

		// Scroll down to trigger the back-to-top button to appear
		await page.evaluate(() => {
			window.scrollTo({ top: 500 });
		});

		// Wait for button to become visible (it animates in over 0.3s)
		await page.waitForSelector(
			'[aria-label="Back to top"].show-button',
			{
				state: 'visible',
			},
		);

		await page.click('[aria-label="Back to top"]');

		// Smooth scroll takes a variable time, so poll until it lands
		await expect
			.poll(() => page.evaluate(() => window.scrollY))
			.toBe(0);
	});
});
