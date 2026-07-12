import { test, expect } from '../helpers/fixtures'

test.describe('Country Selection Journey', () => {
  test.beforeEach(async ({ page }) => {
    // Geo detection is blocked by the fixture (blockGeoDetection: auto).
    // With geo blocked, detection fails and applies NOTHING (ADR-0014 path 3).
    // This leaves currency sync fully functional.

    // Navigate to app - geo will fail, app uses defaults
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const priceValue = page.getByTestId('app-greeting-price-value')
    await expect(priceValue).toContainText('USD')
  })

  test.describe('Given the user is on the home page', () => {
    test('When selecting country, Then visible Intl-formatted date changes', async ({ page }) => {
      const countryTrigger = page.getByTestId('app-navbar-country-trigger')
      const dateDisplay = page.getByTestId('app-greeting-date')

      // Capture initial date format (US format: MM/DD/YYYY or similar)
      const usDateText = await dateDisplay.textContent()
      expect(usDateText).toBeTruthy()

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

    test('When selecting country (without explicit currency selection), Then currency syncs to region default', async ({
      page,
    }) => {
      // Per CONTRACTS v3.2.0: Currency syncs to region default UNLESS user has explicitly
      // selected a currency. Since this is a fresh session with no explicit currency selection,
      // changing region SHOULD change the currency.
      const countryTrigger = page.getByTestId('app-navbar-country-trigger')
      const priceValue = page.getByTestId('app-greeting-price-value')
      const dateDisplay = page.getByTestId('app-greeting-date')

      // Initial state should be USD (default region US -> default currency USD)
      await expect(priceValue).toContainText('USD')

      // Capture initial date format (US format)
      const usDateText = await dateDisplay.textContent()

      await countryTrigger.click()
      await page.getByTestId('app-navbar-country-option-ES').click()
      await expect(countryTrigger).toHaveAccessibleName(/spain/i)

      // Currency SHOULD sync to EUR (ES region's default currency)
      await expect(priceValue).toContainText('EUR')

      // DATE should also change (region affects date formatting)
      const esDateText = await dateDisplay.textContent()
      expect(esDateText).not.toBe(usDateText)
    })

    test('When selecting different countries, Then currency syncs and dates change', async ({
      page,
    }) => {
      // Per CONTRACTS v3.2.0: Region changes sync currency (unless user explicitly selected one).
      // Date formatting also varies by region.
      const countryTrigger = page.getByTestId('app-navbar-country-trigger')
      const priceValue = page.getByTestId('app-greeting-price-value')
      const dateDisplay = page.getByTestId('app-greeting-date')

      // Initial state: US region, USD currency
      await expect(priceValue).toContainText('USD')
      const usDate = await dateDisplay.textContent()

      // Select Spain -> EUR
      await countryTrigger.click()
      await page.getByTestId('app-navbar-country-option-ES').click()
      await expect(priceValue).toContainText('EUR')
      const esDate = await dateDisplay.textContent()

      // Select UK -> GBP
      await countryTrigger.click()
      await page.getByTestId('app-navbar-country-option-GB').click()
      await expect(priceValue).toContainText('GBP')
      const gbDate = await dateDisplay.textContent()

      // Select Mexico -> MXN
      await countryTrigger.click()
      await page.getByTestId('app-navbar-country-option-MX').click()
      await expect(priceValue).toContainText('MXN')
      const mxDate = await dateDisplay.textContent()

      // Select Colombia -> COP
      await countryTrigger.click()
      await page.getByTestId('app-navbar-country-option-CO').click()
      await expect(priceValue).toContainText('COP')
      const coDate = await dateDisplay.textContent()

      // DATE formatting should vary between regions (different Intl locales)
      const dateFormats = [usDate, esDate, gbDate, mxDate, coDate]
      const uniqueDateFormats = new Set(dateFormats)
      // At minimum US/ES should have different date formats (MM/DD/YYYY vs DD/MM/YYYY)
      expect(uniqueDateFormats.size).toBeGreaterThanOrEqual(2)
    })
  })

  test.describe('Given the user selects a country', () => {
    test('When the page is reloaded, Then the chosen country persists', async ({ page }) => {
      const countryTrigger = page.getByTestId('app-navbar-country-trigger')

      await expect(countryTrigger).toHaveAccessibleName(/united states/i)

      await countryTrigger.click()
      await page.getByTestId('app-navbar-country-option-ES').click()
      await expect(countryTrigger).toHaveAccessibleName(/spain/i)

      await page.reload()

      const countryTriggerAfterReload = page.getByTestId('app-navbar-country-trigger')
      await expect(countryTriggerAfterReload).toHaveAccessibleName(/spain/i)
    })

    test('When selecting UK and reloading, Then UK persists', async ({ page }) => {
      const countryTrigger = page.getByTestId('app-navbar-country-trigger')

      await countryTrigger.click()
      await page.getByTestId('app-navbar-country-option-GB').click()
      await expect(countryTrigger).toHaveAccessibleName(/united kingdom/i)

      await page.reload()

      await expect(page.getByTestId('app-navbar-country-trigger')).toHaveAccessibleName(
        /united kingdom/i
      )
    })

    test('When selecting Mexico and reloading, Then Mexico persists', async ({ page }) => {
      const countryTrigger = page.getByTestId('app-navbar-country-trigger')

      await countryTrigger.click()
      await page.getByTestId('app-navbar-country-option-MX').click()
      await expect(countryTrigger).toHaveAccessibleName(/mexico/i)

      await page.reload()

      await expect(page.getByTestId('app-navbar-country-trigger')).toHaveAccessibleName(/mexico/i)
    })
  })

  test.describe('Given accessibility requirements', () => {
    test('When country changes, Then aria-live announcement fires', async ({ page }) => {
      const countryTrigger = page.getByTestId('app-navbar-country-trigger')
      const announcer = page.getByTestId('app-navbar-country-announcer')

      // Initially announcer should be empty or have no announcement
      await expect(announcer).toBeVisible()

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

      await countryTrigger.click()
      await page.getByTestId('app-navbar-country-option-ES').click()

      // Wait for the announcement to appear (condition-based wait)
      await expect(announcer).not.toBeEmpty()

      const announcerText = await announcer.textContent()
      // Check for Spanish region change text (could be "Pais cambiado a" or similar)
      expect(announcerText).toMatch(/cambiado|region|pais|espana|spain/i)
    })
  })

  test.describe('Given Colombia (CO) is a newly added region (task 5 proof)', () => {
    test('CO option is visible in country dropdown', async ({ page }) => {
      const countryTrigger = page.getByTestId('app-navbar-country-trigger')
      await countryTrigger.click()
      const coOption = page.getByTestId('app-navbar-country-option-CO')
      await expect(coOption).toBeVisible()
    })

    test('Selecting CO triggers accessible name containing Colombia', async ({ page }) => {
      const countryTrigger = page.getByTestId('app-navbar-country-trigger')
      await countryTrigger.click()
      await page.getByTestId('app-navbar-country-option-CO').click()
      await expect(countryTrigger).toHaveAccessibleName(/colombia/i)
    })

    test('Selecting CO causes announcer to mention Colombia', async ({ page }) => {
      const countryTrigger = page.getByTestId('app-navbar-country-trigger')
      const announcer = page.getByTestId('app-navbar-country-announcer')
      await countryTrigger.click()
      await page.getByTestId('app-navbar-country-option-CO').click()
      await expect(announcer).not.toBeEmpty()
      const announcerText = await announcer.textContent()
      expect(announcerText).toMatch(/colombia/i)
    })

    test('Selecting CO renders es-CO date format (DD/MM/YYYY)', async ({ page }) => {
      const countryTrigger = page.getByTestId('app-navbar-country-trigger')
      const dateDisplay = page.getByTestId('app-greeting-date')

      // Capture US date format first (MM/DD/YYYY)
      const usDateText = await dateDisplay.textContent()

      await countryTrigger.click()
      await page.getByTestId('app-navbar-country-option-CO').click()

      // es-CO date format differs from en-US (DD/MM/YYYY vs MM/DD/YYYY)
      const coDateText = await dateDisplay.textContent()
      expect(coDateText).not.toBe(usDateText)
    })

    test('Fresh session: selecting CO syncs currency to COP (syncCurrencyToRegion)', async ({
      page,
    }) => {
      // This test proves the CO region correctly syncs to COP currency when user has not
      // explicitly overridden currency (fresh session with cleared localStorage).
      const countryTrigger = page.getByTestId('app-navbar-country-trigger')
      const priceValue = page.getByTestId('app-greeting-price-value')

      // Verify initial currency is USD (default region US -> default currency USD)
      await expect(priceValue).toContainText('USD')

      // Select Colombia - since user hasn't explicitly selected currency, it should sync to COP
      await countryTrigger.click()
      await page.getByTestId('app-navbar-country-option-CO').click()

      // Currency should now be COP (region CO -> COP via syncCurrencyToRegion)
      await expect(priceValue).toContainText('COP')
    })

    test('Colombia persists after reload', async ({ page }) => {
      const countryTrigger = page.getByTestId('app-navbar-country-trigger')

      await countryTrigger.click()
      await page.getByTestId('app-navbar-country-option-CO').click()
      await expect(countryTrigger).toHaveAccessibleName(/colombia/i)

      await page.reload()

      await expect(page.getByTestId('app-navbar-country-trigger')).toHaveAccessibleName(/colombia/i)
    })
  })

  test.describe('Given China (CN) is a newly added region (task 6 proof)', () => {
    test('CN option is visible in country dropdown', async ({ page }) => {
      const countryTrigger = page.getByTestId('app-navbar-country-trigger')
      await countryTrigger.click()
      const cnOption = page.getByTestId('app-navbar-country-option-CN')
      await expect(cnOption).toBeVisible()
    })

    test('Selecting CN triggers accessible name containing China', async ({ page }) => {
      const countryTrigger = page.getByTestId('app-navbar-country-trigger')
      await countryTrigger.click()
      await page.getByTestId('app-navbar-country-option-CN').click()
      await expect(countryTrigger).toHaveAccessibleName(/china/i)
    })

    test('Selecting CN renders zh-CN date format', async ({ page }) => {
      const countryTrigger = page.getByTestId('app-navbar-country-trigger')
      const dateDisplay = page.getByTestId('app-greeting-date')

      const usDateText = await dateDisplay.textContent()

      await countryTrigger.click()
      await page.getByTestId('app-navbar-country-option-CN').click()

      // zh-CN date format differs from en-US
      const cnDateText = await dateDisplay.textContent()
      expect(cnDateText).not.toBe(usDateText)
    })

    test('Fresh session: selecting CN syncs currency to CNY (syncCurrencyToRegion)', async ({
      page,
    }) => {
      const countryTrigger = page.getByTestId('app-navbar-country-trigger')
      const priceValue = page.getByTestId('app-greeting-price-value')

      // Verify initial currency is USD (default region US -> default currency USD)
      await expect(priceValue).toContainText('USD')

      // Select China - should sync to CNY
      await countryTrigger.click()
      await page.getByTestId('app-navbar-country-option-CN').click()

      // Currency should now be CNY (region CN -> CNY via syncCurrencyToRegion)
      await expect(priceValue).toContainText('CNY')
    })

    test('China persists after reload', async ({ page }) => {
      const countryTrigger = page.getByTestId('app-navbar-country-trigger')

      await countryTrigger.click()
      await page.getByTestId('app-navbar-country-option-CN').click()
      await expect(countryTrigger).toHaveAccessibleName(/china/i)

      await page.reload()

      await expect(page.getByTestId('app-navbar-country-trigger')).toHaveAccessibleName(/china/i)
    })
  })

  test.describe('Given Japan (JP) is a newly added region (task 6 proof)', () => {
    test('JP option is visible in country dropdown', async ({ page }) => {
      const countryTrigger = page.getByTestId('app-navbar-country-trigger')
      await countryTrigger.click()
      const jpOption = page.getByTestId('app-navbar-country-option-JP')
      await expect(jpOption).toBeVisible()
    })

    test('Selecting JP triggers accessible name containing Japan', async ({ page }) => {
      const countryTrigger = page.getByTestId('app-navbar-country-trigger')
      await countryTrigger.click()
      await page.getByTestId('app-navbar-country-option-JP').click()
      await expect(countryTrigger).toHaveAccessibleName(/japan/i)
    })

    test('Selecting JP renders ja-JP date format', async ({ page }) => {
      const countryTrigger = page.getByTestId('app-navbar-country-trigger')
      const dateDisplay = page.getByTestId('app-greeting-date')

      const usDateText = await dateDisplay.textContent()

      await countryTrigger.click()
      await page.getByTestId('app-navbar-country-option-JP').click()

      // ja-JP date format differs from en-US
      const jpDateText = await dateDisplay.textContent()
      expect(jpDateText).not.toBe(usDateText)
    })

    test('Fresh session: selecting JP syncs currency to JPY (syncCurrencyToRegion)', async ({
      page,
    }) => {
      const countryTrigger = page.getByTestId('app-navbar-country-trigger')
      const priceValue = page.getByTestId('app-greeting-price-value')

      // Verify initial currency is USD (default region US -> default currency USD)
      await expect(priceValue).toContainText('USD')

      // Select Japan - should sync to JPY
      await countryTrigger.click()
      await page.getByTestId('app-navbar-country-option-JP').click()

      // Currency should now be JPY (region JP -> JPY via syncCurrencyToRegion)
      await expect(priceValue).toContainText('JPY')
    })

    test('Japan persists after reload', async ({ page }) => {
      const countryTrigger = page.getByTestId('app-navbar-country-trigger')

      await countryTrigger.click()
      await page.getByTestId('app-navbar-country-option-JP').click()
      await expect(countryTrigger).toHaveAccessibleName(/japan/i)

      await page.reload()

      await expect(page.getByTestId('app-navbar-country-trigger')).toHaveAccessibleName(/japan/i)
    })
  })
})
