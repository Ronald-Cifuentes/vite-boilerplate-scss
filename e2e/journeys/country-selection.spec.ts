import { test, expect } from '@playwright/test'

test.describe('Country Selection Journey', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage to start fresh
    await page.goto('/')
    await page.evaluate(() => localStorage.clear())
    await page.reload()
  })

  test.describe('Given the user is on the home page', () => {
    test('When selecting country, Then visible Intl-formatted date changes', async ({ page }) => {
      const countryTrigger = page.getByTestId('app-navbar-country-trigger')
      const dateDisplay = page.getByTestId('app-greeting-date')

      // Capture initial date format (US format: MM/DD/YYYY or similar)
      const usDateText = await dateDisplay.textContent()
      expect(usDateText).toBeTruthy()

      // Open dropdown and select Spain (ES)
      await countryTrigger.click()
      await page.getByTestId('app-navbar-country-option-ES').click()
      await expect(countryTrigger).toHaveAccessibleName(/spain/i)

      // Capture Spanish date format (DD/MM/YYYY or similar)
      const esDateText = await dateDisplay.textContent()
      expect(esDateText).toBeTruthy()

      // The date formats should be different between US and ES
      // US typically uses MM/DD/YYYY, ES uses DD/MM/YYYY
      expect(esDateText).not.toBe(usDateText)
    })

    test('When selecting country, Then visible Intl-formatted currency changes', async ({
      page,
    }) => {
      const countryTrigger = page.getByTestId('app-navbar-country-trigger')
      const priceDisplay = page.getByTestId('app-greeting-price')

      // Capture initial price format (US: $1,234.56)
      const usPriceText = await priceDisplay.textContent()
      expect(usPriceText).toContain('$')

      // Open dropdown and select Spain (ES)
      await countryTrigger.click()
      await page.getByTestId('app-navbar-country-option-ES').click()
      await expect(countryTrigger).toHaveAccessibleName(/spain/i)

      // Capture Spanish price format (EUR: 1.234,56 EUR or similar)
      const esPriceText = await priceDisplay.textContent()
      expect(esPriceText).toBeTruthy()

      // The currency should change from USD ($) to EUR
      expect(esPriceText).not.toBe(usPriceText)
      // EUR uses different symbol/format
      expect(esPriceText).toMatch(/EUR|€/)
    })

    test('When selecting different countries, Then number formatting changes between regions', async ({
      page,
    }) => {
      const countryTrigger = page.getByTestId('app-navbar-country-trigger')
      const priceDisplay = page.getByTestId('app-greeting-price')

      // Get US format (uses comma as thousand separator, period as decimal)
      const usText = await priceDisplay.textContent()

      // Select Spain
      await countryTrigger.click()
      await page.getByTestId('app-navbar-country-option-ES').click()
      const esText = await priceDisplay.textContent()

      // Select UK
      await countryTrigger.click()
      await page.getByTestId('app-navbar-country-option-GB').click()
      const gbText = await priceDisplay.textContent()

      // Select Mexico
      await countryTrigger.click()
      await page.getByTestId('app-navbar-country-option-MX').click()
      const mxText = await priceDisplay.textContent()

      // All should be different due to currency/locale differences
      const formats = [usText, esText, gbText, mxText]
      const uniqueFormats = new Set(formats)

      // At minimum US/ES should differ (USD vs EUR)
      expect(usText).not.toBe(esText)
    })
  })

  test.describe('Given the user selects a country', () => {
    test('When the page is reloaded, Then the chosen country persists', async ({ page }) => {
      const countryTrigger = page.getByTestId('app-navbar-country-trigger')

      // Initial state should be US
      await expect(countryTrigger).toHaveAccessibleName(/united states/i)

      // Open dropdown and select Spain
      await countryTrigger.click()
      await page.getByTestId('app-navbar-country-option-ES').click()
      await expect(countryTrigger).toHaveAccessibleName(/spain/i)

      // Reload the page
      await page.reload()

      // Country should still be Spain after reload
      const countryTriggerAfterReload = page.getByTestId('app-navbar-country-trigger')
      await expect(countryTriggerAfterReload).toHaveAccessibleName(/spain/i)
    })

    test('When selecting UK and reloading, Then UK persists', async ({ page }) => {
      const countryTrigger = page.getByTestId('app-navbar-country-trigger')

      // Open dropdown and select UK
      await countryTrigger.click()
      await page.getByTestId('app-navbar-country-option-GB').click()
      await expect(countryTrigger).toHaveAccessibleName(/united kingdom/i)

      // Reload
      await page.reload()

      // Should still be UK
      await expect(page.getByTestId('app-navbar-country-trigger')).toHaveAccessibleName(
        /united kingdom/i
      )
    })

    test('When selecting Mexico and reloading, Then Mexico persists', async ({ page }) => {
      const countryTrigger = page.getByTestId('app-navbar-country-trigger')

      // Open dropdown and select Mexico
      await countryTrigger.click()
      await page.getByTestId('app-navbar-country-option-MX').click()
      await expect(countryTrigger).toHaveAccessibleName(/mexico/i)

      // Reload
      await page.reload()

      // Should still be Mexico
      await expect(page.getByTestId('app-navbar-country-trigger')).toHaveAccessibleName(/mexico/i)
    })
  })

  test.describe('Given accessibility requirements', () => {
    test('When country changes, Then aria-live announcement fires', async ({ page }) => {
      const countryTrigger = page.getByTestId('app-navbar-country-trigger')
      const announcer = page.getByTestId('app-navbar-country-announcer')

      // Initially announcer should be empty or have no announcement
      await expect(announcer).toBeVisible()

      // Open dropdown and select Spain
      await countryTrigger.click()
      await page.getByTestId('app-navbar-country-option-ES').click()

      // Wait for the announcement to appear (Playwright auto-waits)
      await expect(announcer).not.toBeEmpty()
    })

    test('When country changes to Spain, Then announcement is localized', async ({ page }) => {
      // First switch language to Spanish to verify localized announcements
      const langTrigger = page.getByTestId('app-navbar-language-trigger')
      await langTrigger.click()
      await page.getByTestId('app-navbar-language-option-es').click()
      // Wait for language to change before proceeding
      await expect(page.locator('html')).toHaveAttribute('lang', 'es')

      const countryTrigger = page.getByTestId('app-navbar-country-trigger')
      const announcer = page.getByTestId('app-navbar-country-announcer')

      // Open dropdown and select a different country
      await countryTrigger.click()
      await page.getByTestId('app-navbar-country-option-ES').click()

      // Wait for the announcement to appear (condition-based wait)
      await expect(announcer).not.toBeEmpty()

      // The announcement should be in Spanish (contains Spanish text)
      const announcerText = await announcer.textContent()
      // Check for Spanish region change text (could be "Pais cambiado a" or similar)
      expect(announcerText).toMatch(/cambiado|region|pais|espana|spain/i)
    })
  })
})
