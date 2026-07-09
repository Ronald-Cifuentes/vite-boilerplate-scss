import { test, expect } from '@playwright/test'

test.describe('Locale Persistence Journey', () => {
  test.beforeEach(async ({ context }) => {
    // Playwright provides a fresh, isolated browser context per test
    // Storage is already empty - no need to clear localStorage
    await context.clearCookies()
  })

  test('Given a user switches language, When they reload, Then preference is restored', async ({
    page,
  }) => {
    // Given - user visits and switches language
    await page.goto('/')
    const langTrigger = page.getByTestId('app-navbar-language-trigger')
    await langTrigger.click()
    await page.getByTestId('app-navbar-language-option-es').click()
    await expect(page.getByTestId('app-greeting-title')).toHaveText('Hola')

    // When - user reloads the page
    await page.reload()

    // Then - preference is restored
    await expect(page.getByTestId('app-greeting-title')).toHaveText('Hola')
    await expect(page.locator('html')).toHaveAttribute('lang', 'es')
  })

  test('Given a user has persisted Spanish preference, When they navigate to app, Then Spanish is used', async ({
    page,
    context,
  }) => {
    // Given - pre-seed localStorage before first navigation using addInitScript
    await context.addInitScript(() => {
      localStorage.setItem('app-locale', 'es')
    })

    // When - navigate to app with pre-seeded preference
    await page.goto('/')

    // Then - Spanish is used from the start
    await expect(page.getByTestId('app-greeting-title')).toHaveText('Hola')
  })

  test('Given a user with English preference, When they switch to Spanish and close/reopen, Then Spanish persists', async ({
    page,
  }) => {
    // Given - start fresh
    await page.goto('/')
    await expect(page.getByTestId('app-greeting-title')).toHaveText('Hello')

    // When - switch to Spanish via dropdown
    const langTrigger = page.getByTestId('app-navbar-language-trigger')
    await langTrigger.click()
    await page.getByTestId('app-navbar-language-option-es').click()

    // Verify localStorage was updated
    const storedLocale = await page.evaluate(() => localStorage.getItem('app-locale'))
    expect(storedLocale).toBe('es')

    // Simulate close/reopen by navigating away and back
    await page.goto('about:blank')
    await page.goto('/')

    // Then - Spanish persists
    await expect(page.getByTestId('app-greeting-title')).toHaveText('Hola')
  })
})
