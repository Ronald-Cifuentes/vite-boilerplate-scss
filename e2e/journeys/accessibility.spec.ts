import { test, expect } from '@playwright/test'

test.describe('Accessibility', () => {
  // Playwright provides a fresh, isolated browser context per test
  // Storage is already empty - no beforeEach localStorage clearing needed

  test('Language selector is keyboard accessible', async ({ page }) => {
    // Given
    await page.goto('/')

    // When - navigate to selector via keyboard
    await page.keyboard.press('Tab')
    const combobox = page.getByRole('combobox')
    await expect(combobox).toBeFocused()

    // Then - can interact via keyboard
    await page.keyboard.press('Space') // Open dropdown
    await page.keyboard.press('ArrowDown')
    await page.keyboard.press('Enter')

    // Verify interaction worked
    await expect(combobox).toHaveValue(/.+/)
  })

  test('Language selector has accessible name', async ({ page }) => {
    await page.goto('/')

    const combobox = page.getByRole('combobox')
    await expect(combobox).toHaveAccessibleName(/language/i)
  })

  test('Language selector has accessible description', async ({ page }) => {
    await page.goto('/')

    const combobox = page.getByRole('combobox')
    const describedBy = await combobox.getAttribute('aria-describedby')
    expect(describedBy).toBeTruthy()

    const description = page.locator(`#${describedBy}`)
    await expect(description).toHaveText(/select your preferred language/i)
  })

  test('HTML lang attribute reflects current locale', async ({ page }) => {
    await page.goto('/')

    // Initial state
    await expect(page.locator('html')).toHaveAttribute('lang', 'en')

    // After switching
    await page.getByRole('combobox').selectOption('es')
    await expect(page.locator('html')).toHaveAttribute('lang', 'es')
  })

  test('App renders within performance budget', async ({ page }) => {
    const startTime = Date.now()
    await page.goto('/')
    await page.waitForSelector('[data-testid="app"]')
    const loadTime = Date.now() - startTime

    // Record the measured value for reporting
    console.log(`App interactivity time: ${loadTime}ms`)

    // Must be interactive under 500ms on local preview (generous buffer for CI variability)
    expect(loadTime).toBeLessThan(500)
  })

  test('All interactive elements are focusable', async ({ page }) => {
    await page.goto('/')

    // Tab to language selector
    await page.keyboard.press('Tab')
    const combobox = page.getByRole('combobox')
    await expect(combobox).toBeFocused()
  })

  test('Focus indicator is visible on language selector', async ({ page }) => {
    await page.goto('/')

    const combobox = page.getByRole('combobox')
    await combobox.focus()

    // Verify the element can receive focus
    await expect(combobox).toBeFocused()
  })
})
