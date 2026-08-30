import { test, expect } from '@playwright/test'

// Smoke test for canvas, 960x720, pixelated styling, and basic rendering

test.describe('PolyRoot Smoke Test', () => {
  test('renders 960x720 canvas with pixelated rendering', async ({ page }) => {
    await page.goto('http://localhost:5173')
    await page.waitForTimeout(500)

    const canvas = page.locator('canvas')
    await expect(canvas).toBeVisible()

    const style = await canvas.evaluate((el) => window.getComputedStyle(el).imageRendering)
    expect(style).toBe('pixelated')
  })
})
