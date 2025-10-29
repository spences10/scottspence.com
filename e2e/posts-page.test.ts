import { expect, test } from '@playwright/test'

test.describe('Posts page', () => {
	test('should load and display posts list', async ({ page }) => {
		await page.goto('/posts')

		// Wait for content to load
		await page.waitForLoadState('networkidle')

		// Check page title
		const h1 = page.locator('h1')
		await expect(h1).toBeVisible()
		await expect(h1).toContainText(/posts/i)

		// Check that posts are rendered (should be at least one post)
		const postLinks = page.locator('a[href^="/posts/"]')
		const postCount = await postLinks.count()
		expect(postCount).toBeGreaterThan(0)
	})

	test('should display post metadata', async ({ page }) => {
		await page.goto('/posts')
		await page.waitForLoadState('networkidle')

		// First post should have:
		// - Title (in a link)
		// - Date
		// - Reading time or preview text
		const firstPost = page.locator('article').first()
		await expect(firstPost).toBeVisible()

		// Check for post link
		const postLink = firstPost.locator('a[href^="/posts/"]')
		await expect(postLink).toBeVisible()

		// Check for date or time element
		const timeElement = firstPost.locator('time')
		const timeCount = await timeElement.count()
		expect(timeCount).toBeGreaterThan(0)
	})

	test('should navigate to individual post when clicked', async ({
		page,
	}) => {
		await page.goto('/posts')
		await page.waitForLoadState('networkidle')

		// Click the first post link
		const firstPostLink = page.locator('a[href^="/posts/"]').first()
		const href = await firstPostLink.getAttribute('href')
		expect(href).toBeTruthy()

		await firstPostLink.click()

		// Should navigate to post detail page
		await expect(page).toHaveURL(new RegExp(`${href}$`))
	})

	test('should load without JavaScript errors', async ({ page }) => {
		const errors: string[] = []

		page.on('pageerror', (error) => {
			errors.push(error.message)
		})

		await page.goto('/posts')
		await page.waitForLoadState('networkidle')

		// No JS errors should occur
		expect(errors).toHaveLength(0)
	})
})
