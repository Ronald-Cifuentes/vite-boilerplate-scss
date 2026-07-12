import { test, expect } from '../helpers/fixtures'
import {
  mockIpCountry,
  mockIpFailure,
  mockReverseGeocode,
  mockReverseGeocodeFailure,
  mockGpsGranted,
  mockGpsDenied,
  createGeoRequestTracker,
  mockSlowDetection,
} from '../helpers/geo-mock'

/**
 * Geo Auto-Detection E2E Test Matrix
 * ADR-0014: Tests all detection scenarios with mocked providers
 */

test.describe('Geo Auto-Detection', () => {
  test.describe('IP-based detection (GPS denied)', () => {
    test.beforeEach(async ({ context }) => {
      await mockGpsDenied(context)
    })

    test('first visit, GPS denied, IP=CO -> es/CO/COP applied', async ({ page, context }) => {
      await mockGpsDenied(context)
      await mockIpCountry(page, 'CO')

      await page.goto('/')
      await page.waitForTimeout(1000) // Wait for detection to complete

      const html = await page.locator('html')
      await expect(html).toHaveAttribute('lang', 'es')

      const locale = await page.evaluate(() => localStorage.getItem('app-locale'))
      const region = await page.evaluate(() => localStorage.getItem('app-region'))
      const currency = await page.evaluate(() => localStorage.getItem('app-currency'))

      expect(locale).toBe('es')
      expect(region).toBe('CO')
      expect(currency).toBe('COP')
    })

    // Parameterized test for all 7 supported countries via IP
    const countryTestCases = [
      { country: 'CO', locale: 'es', region: 'CO', currency: 'COP' },
      { country: 'US', locale: 'en', region: 'US', currency: 'USD' },
      { country: 'ES', locale: 'es', region: 'ES', currency: 'EUR' },
      { country: 'GB', locale: 'en', region: 'GB', currency: 'GBP' },
      { country: 'MX', locale: 'es', region: 'MX', currency: 'MXN' },
      { country: 'CN', locale: 'zh', region: 'CN', currency: 'CNY' },
      { country: 'JP', locale: 'ja', region: 'JP', currency: 'JPY' },
    ]

    for (const { country, locale, region, currency } of countryTestCases) {
      test(`IP=${country} -> ${locale}/${region}/${currency}`, async ({ page, context }) => {
        await mockGpsDenied(context)
        await mockIpCountry(page, country)

        await page.goto('/')
        await page.waitForTimeout(1000)

        const storedLocale = await page.evaluate(() => localStorage.getItem('app-locale'))
        const storedRegion = await page.evaluate(() => localStorage.getItem('app-region'))
        const storedCurrency = await page.evaluate(() => localStorage.getItem('app-currency'))

        expect(storedLocale).toBe(locale)
        expect(storedRegion).toBe(region)
        expect(storedCurrency).toBe(currency)
      })
    }
  })

  test.describe('GPS-based detection', () => {
    test('VPN scenario: GPS=Bogota coords + IP=US -> CO wins', async ({ page, context }) => {
      // GPS returns Colombian coordinates
      await mockGpsGranted(context, { lat: 6.25, lng: -75.58 })
      await mockReverseGeocode(page, 'CO')
      // IP returns US (simulating VPN)
      await mockIpCountry(page, 'US')

      await page.goto('/')
      await page.waitForTimeout(1500) // GPS + reverse geocode takes longer

      const region = await page.evaluate(() => localStorage.getItem('app-region'))
      expect(region).toBe('CO') // GPS wins over VPN IP
    })

    test('GPS granted but reverse-geocode fails + IP=MX -> MX', async ({ page, context }) => {
      await mockGpsGranted(context, { lat: 19.43, lng: -99.13 })
      await mockReverseGeocodeFailure(page)
      await mockIpCountry(page, 'MX')

      await page.goto('/')
      await page.waitForTimeout(1500)

      const region = await page.evaluate(() => localStorage.getItem('app-region'))
      expect(region).toBe('MX') // Falls back to IP
    })
  })

  test.describe('Fallback scenarios', () => {
    test('unsupported country (FR) + device language es -> locale es only', async ({
      page,
      context,
    }) => {
      await mockGpsDenied(context)
      await mockIpCountry(page, 'FR') // France not supported

      // Set device language preference
      await page.addInitScript(() => {
        Object.defineProperty(navigator, 'languages', {
          value: ['es-ES', 'en'],
          configurable: true,
        })
      })

      await page.goto('/')
      await page.waitForTimeout(1000)

      const locale = await page.evaluate(() => localStorage.getItem('app-locale'))
      const region = await page.evaluate(() => localStorage.getItem('app-region'))

      expect(locale).toBe('es') // From device language
      // ADR-0014 PATH 2: device-language fallback does NOT persist region
      // Region in-memory is US (default), but not persisted to localStorage
      expect(region).toBeNull()
    })

    test('both providers fail + device language ja -> locale ja', async ({ page, context }) => {
      await mockGpsDenied(context)
      await mockIpFailure(page)

      await page.addInitScript(() => {
        Object.defineProperty(navigator, 'languages', {
          value: ['ja-JP'],
          configurable: true,
        })
      })

      await page.goto('/')
      await page.waitForTimeout(1000)

      const locale = await page.evaluate(() => localStorage.getItem('app-locale'))
      expect(locale).toBe('ja')
    })
  })

  test.describe('Returning user (stored prefs)', () => {
    test('stored prefs present -> NO detection calls fired', async ({ page, context }) => {
      await mockGpsDenied(context)
      const tracker = createGeoRequestTracker(page)

      // Set stored preferences before navigation
      await page.addInitScript(() => {
        localStorage.setItem('app-locale', 'es')
        localStorage.setItem('app-region', 'MX')
        localStorage.setItem('app-currency', 'MXN')
      })

      await page.goto('/')
      await tracker.waitForRequests()

      // No geo detection requests should have been made
      expect(tracker.requests).toHaveLength(0)
    })

    test('user changes country after detection -> persists on reload', async ({
      page,
      context,
    }) => {
      await mockGpsDenied(context)
      await mockIpCountry(page, 'CO')

      await page.goto('/')
      await page.waitForTimeout(1000)

      let region = await page.evaluate(() => localStorage.getItem('app-region'))
      expect(region).toBe('CO')

      // User manually changes to US
      await page.evaluate(() => localStorage.setItem('app-region', 'US'))

      // Reload - should keep user's choice
      await page.reload()
      await page.waitForTimeout(500)

      region = await page.evaluate(() => localStorage.getItem('app-region'))
      expect(region).toBe('US')
    })
  })

  test.describe('Performance', () => {
    test('detection never blocks: greeting interactive before detection resolves', async ({
      page,
      context,
    }) => {
      await mockGpsDenied(context)
      await mockSlowDetection(page, 2000) // 2 second delay

      const startTime = Date.now()
      await page.goto('/')

      // Greeting should be visible immediately (well before 2s)
      await expect(page.getByTestId('app-greeting')).toBeVisible({ timeout: 500 })
      const interactiveTime = Date.now() - startTime

      expect(interactiveTime).toBeLessThan(1000) // Interactive before detection completes
    })
  })

  test.describe('Region-currency sync after fallback (ADR-0014 three-path matrix)', () => {
    test('after failure-path detection, selecting GB syncs currency to GBP', async ({
      page,
      context,
    }) => {
      // Block all geo providers - detection will hit total failure path
      await mockGpsDenied(context)
      await mockIpFailure(page)
      await mockReverseGeocodeFailure(page)

      // Also block device language by setting an unsupported language
      await page.addInitScript(() => {
        Object.defineProperty(navigator, 'languages', {
          value: ['xx-XX'], // Unsupported language
          configurable: true,
        })
      })

      await page.goto('/')
      await page.waitForTimeout(1000) // Wait for detection to complete (and fail)

      // Verify initial state: currency should be USD (default, NOT locked)
      const priceValue = page.getByTestId('app-greeting-price-value')
      await expect(priceValue).toContainText('USD')

      // Now select GB region - currency SHOULD sync to GBP (proves sync survived fallback)
      const countryTrigger = page.getByTestId('app-navbar-country-trigger')
      await countryTrigger.click()
      await page.getByTestId('app-navbar-country-option-GB').click()

      // Currency should now be GBP (synced from region)
      await expect(priceValue).toContainText('GBP')
    })

    test('device-language fallback: selecting MX syncs currency to MXN', async ({
      page,
      context,
    }) => {
      // Block GPS and IP, but provide supported device language
      await mockGpsDenied(context)
      await mockIpFailure(page)

      // Set device language to Spanish (supported)
      await page.addInitScript(() => {
        Object.defineProperty(navigator, 'languages', {
          value: ['es-ES', 'en'],
          configurable: true,
        })
      })

      await page.goto('/')
      await page.waitForTimeout(1000) // Wait for detection

      // Locale should be 'es' from device language, but currency should still be USD
      const html = page.locator('html')
      await expect(html).toHaveAttribute('lang', 'es')

      const priceValue = page.getByTestId('app-greeting-price-value')
      await expect(priceValue).toContainText('USD') // Default, not locked

      // Select MX - currency SHOULD sync to MXN (proves sync not locked)
      const countryTrigger = page.getByTestId('app-navbar-country-trigger')
      await countryTrigger.click()
      await page.getByTestId('app-navbar-country-option-MX').click()

      // Currency should now be MXN
      await expect(priceValue).toContainText('MXN')
    })
  })
})
