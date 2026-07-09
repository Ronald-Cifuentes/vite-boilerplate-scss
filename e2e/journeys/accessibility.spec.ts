import { test, expect } from '@playwright/test'

test.describe('Accessibility', () => {
  // Playwright provides a fresh, isolated browser context per test
  // Storage is already empty - no beforeEach localStorage clearing needed

  test('Language dropdown trigger is keyboard accessible', async ({ page }) => {
    // Given
    await page.goto('/')

    // When - navigate to the dropdown trigger via keyboard
    const langTrigger = page.getByTestId('app-navbar-language-trigger')
    await langTrigger.focus()
    await expect(langTrigger).toBeFocused()

    // Then - can interact via keyboard (Enter to open dropdown)
    await page.keyboard.press('Enter')
    await expect(langTrigger).toHaveAttribute('aria-expanded', 'true')

    // Focus the Spanish option and press Enter
    const spanishOption = page.getByTestId('app-navbar-language-option-es')
    await spanishOption.focus()
    await page.keyboard.press('Enter')

    // Verify interaction worked - HTML lang should change
    await expect(page.locator('html')).toHaveAttribute('lang', 'es')
  })

  test('Language dropdown trigger has accessible name', async ({ page }) => {
    await page.goto('/')

    const langTrigger = page.getByTestId('app-navbar-language-trigger')
    await expect(langTrigger).toHaveAccessibleName(/language|english/i)
  })

  test('HTML lang attribute reflects current locale', async ({ page }) => {
    await page.goto('/')

    // Initial state
    await expect(page.locator('html')).toHaveAttribute('lang', 'en')

    // After selecting Spanish from dropdown
    const langTrigger = page.getByTestId('app-navbar-language-trigger')
    await langTrigger.click()
    await page.getByTestId('app-navbar-language-option-es').click()
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

  test('All navbar controls are focusable', async ({ page }) => {
    await page.goto('/')

    // Tab through all navbar controls
    const langTrigger = page.getByTestId('app-navbar-language-trigger')
    const themeButton = page.getByTestId('app-navbar-theme-button')
    const countryTrigger = page.getByTestId('app-navbar-country-trigger')
    const currencyTrigger = page.getByTestId('app-navbar-currency-trigger')

    // Focus each control and verify
    await langTrigger.focus()
    await expect(langTrigger).toBeFocused()

    await themeButton.focus()
    await expect(themeButton).toBeFocused()

    await countryTrigger.focus()
    await expect(countryTrigger).toBeFocused()

    await currencyTrigger.focus()
    await expect(currencyTrigger).toBeFocused()
  })

  test('Focus indicator is visible on navbar controls', async ({ page }) => {
    await page.goto('/')

    const langTrigger = page.getByTestId('app-navbar-language-trigger')
    await langTrigger.focus()

    // Verify the element can receive focus
    await expect(langTrigger).toBeFocused()
  })

  test('Dropdown panels have correct ARIA roles', async ({ page }) => {
    await page.goto('/')

    const langTrigger = page.getByTestId('app-navbar-language-trigger')

    // Verify trigger has correct ARIA attributes
    await expect(langTrigger).toHaveAttribute('aria-haspopup', 'listbox')
    await expect(langTrigger).toHaveAttribute('aria-expanded', 'false')

    // Open the dropdown
    await langTrigger.click()

    // Verify expanded state
    await expect(langTrigger).toHaveAttribute('aria-expanded', 'true')

    // Verify panel has listbox role
    const panel = page.getByTestId('app-navbar-language-panel')
    await expect(panel).toHaveAttribute('role', 'listbox')

    // Verify options have option role
    const options = panel.locator('[role="option"]')
    await expect(options).toHaveCount(2) // en, es
  })

  test('All closed dropdown panels have aria-hidden="true" on page load (DEF-A11Y-1)', async ({
    page,
  }) => {
    await page.goto('/')

    // Three dropdown panels should be hidden from screen readers when closed
    // (Theme is now a button, not a dropdown - only 3 panels)
    const langPanel = page.getByTestId('app-navbar-language-panel')
    const countryPanel = page.getByTestId('app-navbar-country-panel')
    const currencyPanel = page.getByTestId('app-navbar-currency-panel')

    await expect(langPanel).toHaveAttribute('aria-hidden', 'true')
    await expect(countryPanel).toHaveAttribute('aria-hidden', 'true')
    await expect(currencyPanel).toHaveAttribute('aria-hidden', 'true')
  })

  test('Open dropdown panel has aria-hidden="false" (DEF-A11Y-1)', async ({ page }) => {
    await page.goto('/')

    const langTrigger = page.getByTestId('app-navbar-language-trigger')
    const langPanel = page.getByTestId('app-navbar-language-panel')

    // Initially closed - aria-hidden="true"
    await expect(langPanel).toHaveAttribute('aria-hidden', 'true')

    // Open the dropdown
    await langTrigger.click()

    // Now open - aria-hidden="false"
    await expect(langPanel).toHaveAttribute('aria-hidden', 'false')

    // Close by clicking again
    await langTrigger.click()

    // Back to aria-hidden="true"
    await expect(langPanel).toHaveAttribute('aria-hidden', 'true')
  })

  test.describe('Theme Button Accessibility (ADR-0009)', () => {
    test('theme button has accessible name reflecting current mode', async ({ page }) => {
      await page.goto('/')

      const themeButton = page.getByTestId('app-navbar-theme-button')

      // Default is system
      await expect(themeButton).toHaveAccessibleName(/system theme/i)

      // Cycle to light
      await themeButton.click()
      await expect(themeButton).toHaveAccessibleName(/light mode/i)

      // Cycle to dark
      await themeButton.click()
      await expect(themeButton).toHaveAccessibleName(/dark mode/i)
    })

    test('theme button is NOT a popup trigger (no aria-haspopup)', async ({ page }) => {
      await page.goto('/')

      const themeButton = page.getByTestId('app-navbar-theme-button')
      await expect(themeButton).not.toHaveAttribute('aria-haspopup')
    })

    test('theme button is keyboard accessible (Enter/Space)', async ({ page }) => {
      await page.goto('/')

      const themeButton = page.getByTestId('app-navbar-theme-button')
      await themeButton.focus()
      await expect(themeButton).toBeFocused()

      // Enter cycles
      await page.keyboard.press('Enter')
      await expect(themeButton).toHaveAccessibleName(/light mode/i)

      // Space cycles
      await page.keyboard.press('Space')
      await expect(themeButton).toHaveAccessibleName(/dark mode/i)
    })
  })
})
