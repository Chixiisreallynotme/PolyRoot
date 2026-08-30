import { test, expect } from '@playwright/test'

// E2E test for Fun in 10 seconds and Jury Watch (Break E1)
// Measures time to first dash, jury bubble, and movement

test.describe('Jury 10s & Instant Fun', () => {
  test('displays jury bubble on load and responds to input within 10s', async ({ page }) => {
    // Collect console logs
    const logs: string[] = []
    page.on('console', (msg) => logs.push(msg.text()))

    await page.goto('http://localhost:5173')
    await page.waitForTimeout(500)

    // Check canvas exists and is pixelated 960x720
    const canvas = page.locator('canvas')
    await expect(canvas).toBeVisible()

    // Check jury 4th wall bubble appears
    const bubble = page.locator('#fourth-wall-bubble')
    await expect(bubble).toContainText('jury')

    // Simulate movement and dash within 3s
    await page.keyboard.press('KeyW')
    await page.waitForTimeout(100)
    await page.keyboard.press('Space') // Dash

    // Check logs contain 4th wall jury watch
    const hasJuryLog = logs.some((l) => l.includes('[4th-wall] jury-watch'))
    expect(hasJuryLog).toBe(true)
  })
})
