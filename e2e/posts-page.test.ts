import { expect, test } from '@playwright/test'

test.describe('Posts page', () => {
	test('should load and display posts list', async ({ page }) => {
		await page.goto('/posts')

		// Wait for search input to appear (indicates page has loaded)
		const searchInput = page.getByTestId('search')
		await expect(searchInput).toBeVisible({ timeout: 10000 })

		// Wait for at least one post link to appear
		const postLinks = page.locator('a[href^="/posts/"]')
		await expect(postLinks.first()).toBeVisible({ timeout: 10000 })

		// Check that posts are rendered (should be at least one post)
		const postCount = await postLinks.count()
		expect(postCount).toBeGreaterThan(0)
	})

	test('should display post metadata', async ({ page }) => {
		await page.goto('/posts')

		// First post should have:
		// - Title (in a link)
		// - Date
		// - Reading time or preview text
		const firstPost = page.locator('article').first()
		await expect(firstPost).toBeVisible({ timeout: 10000 })

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

		// Wait for first post link to appear
		const firstPostLink = page.locator('a[href^="/posts/"]').first()
		await expect(firstPostLink).toBeVisible({ timeout: 10000 })

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

		// Wait for content to load
		const searchInput = page.getByTestId('search')
		await expect(searchInput).toBeVisible({ timeout: 10000 })

		// No JS errors should occur
		expect(errors).toHaveLength(0)
	})
})
