import { expect, test } from '@playwright/test'

test('index page has expected h1', async ({ page }) => {
  await page.goto('/')
  const h1TextContent = await page.textContent('h1')
  const cleanedH1TextContent = h1TextContent
    ?.replace(/\s+/g, ' ')
    .trim()
  expect(cleanedH1TextContent).toBe('Scott Spence Hello World!')
})
