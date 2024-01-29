import { expect, test } from '@playwright/test'

test.describe('BackToTop', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should scroll to the top when the button is clicked', async ({
    page,
  }) => {
    await page.evaluate(() => {
      window.scrollTo({ top: 100 })
    })

    await page.click('[aria-label="Back to top"]')
    await page.waitForTimeout(1000)

    const scrollTop = await page.evaluate(() => window.pageYOffset)
    expect(scrollTop).toBe(0)
  })
})
