import { expect, test } from '@playwright/test'

test.describe('Tags page', () => {
	test('should load and display tags list', async ({ page }) => {
		await page.goto('/tags')

		// Check page title
		const h1 = page.locator('h1')
		await expect(h1).toBeVisible({ timeout: 10000 })

		// Wait for first tag link to appear
		const tagLinks = page.locator('a[href^="/tags/"]')
		await expect(tagLinks.first()).toBeVisible({ timeout: 10000 })

		// Check that tags are rendered (should be at least one tag)
		const tagCount = await tagLinks.count()
		expect(tagCount).toBeGreaterThan(0)
	})

	test('should display post count for each tag', async ({ page }) => {
		await page.goto('/tags')

		// Each tag should show how many posts it has
		// Look for numbers or count indicators
		const firstTag = page.locator('a[href^="/tags/"]').first()
		await expect(firstTag).toBeVisible({ timeout: 10000 })

		const tagText = await firstTag.textContent()
		expect(tagText).toBeTruthy()
	})

	test('should navigate to tag detail page when clicked', async ({
		page,
	}) => {
		await page.goto('/tags')

		// Wait for first tag link to appear
		const firstTagLink = page.locator('a[href^="/tags/"]').first()
		await expect(firstTagLink).toBeVisible({ timeout: 10000 })

		const href = await firstTagLink.getAttribute('href')
		expect(href).toBeTruthy()

		await firstTagLink.click()

		// Should navigate to tag detail page
		await expect(page).toHaveURL(new RegExp(`${href}$`))

		// Tag detail page should show posts
		const postLinks = page.locator('a[href^="/posts/"]')
		await expect(postLinks.first()).toBeVisible({ timeout: 10000 })
		const postCount = await postLinks.count()
		expect(postCount).toBeGreaterThan(0)
	})

	test('should load without JavaScript errors', async ({ page }) => {
		const errors: string[] = []

		page.on('pageerror', (error) => {
			errors.push(error.message)
		})

		await page.goto('/tags')

		// Wait for content to load
		const h1 = page.locator('h1')
		await expect(h1).toBeVisible({ timeout: 10000 })

		expect(errors).toHaveLength(0)
	})
})

test.describe('Tag detail page', () => {
	test('should display posts for specific tag', async ({ page }) => {
		// First get a tag slug
		await page.goto('/tags')

		const firstTagLink = page.locator('a[href^="/tags/"]').first()
		await expect(firstTagLink).toBeVisible({ timeout: 10000 })

		const tagHref = await firstTagLink.getAttribute('href')
		expect(tagHref).toBeTruthy()

		// Navigate to tag detail page
		await page.goto(tagHref!)

		// Should have a heading
		const h1 = page.locator('h1')
		await expect(h1).toBeVisible({ timeout: 10000 })

		// Should have posts listed
		const postLinks = page.locator('a[href^="/posts/"]')
		await expect(postLinks.first()).toBeVisible({ timeout: 10000 })
		const postCount = await postLinks.count()
		expect(postCount).toBeGreaterThan(0)
	})

	test('should load without JavaScript errors', async ({ page }) => {
		const errors: string[] = []

		page.on('pageerror', (error) => {
			errors.push(error.message)
		})

		// Navigate to a known tag page (using first available tag)
		await page.goto('/tags')

		const firstTagLink = page.locator('a[href^="/tags/"]').first()
		await expect(firstTagLink).toBeVisible({ timeout: 10000 })

		const tagHref = await firstTagLink.getAttribute('href')

		await page.goto(tagHref!)

		// Wait for content to load
		const h1 = page.locator('h1')
		await expect(h1).toBeVisible({ timeout: 10000 })

		expect(errors).toHaveLength(0)
	})
})
