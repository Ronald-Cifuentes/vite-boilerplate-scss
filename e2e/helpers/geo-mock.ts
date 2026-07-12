import { Page, BrowserContext } from '@playwright/test'

// RFC 5737 TEST-NET-1 address — reserved for documentation/testing (SonarQube
// S1313-safe); the mocked geo providers echo a client IP, any value works.
const MOCK_CLIENT_IP = '192.0.2.1'

/**
 * E2E mock helpers for geo detection per ADR-0014 mocking seam
 */

// IP geolocation mocks

/**
 * Mock IP geolocation to return a specific country code
 */
export async function mockIpCountry(page: Page, countryCode: string): Promise<void> {
  // Match exact URLs used by IpGeoAdapter
  await page.route('https://api.country.is/', route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ ip: MOCK_CLIENT_IP, country: countryCode }),
    })
  })
  await page.route('https://get.geojs.io/v1/ip/country.json', route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ country: countryCode, ip: MOCK_CLIENT_IP }),
    })
  })
}

/**
 * Mock IP geolocation to fail (both providers)
 */
export async function mockIpFailure(page: Page): Promise<void> {
  await page.route('https://api.country.is/', route => route.abort())
  await page.route('https://get.geojs.io/v1/ip/country.json', route => route.abort())
}

// Reverse geocode mocks

/**
 * Mock reverse geocoding to return a specific country code
 */
export async function mockReverseGeocode(page: Page, countryCode: string): Promise<void> {
  // Match reverse geocode URL with wildcard for query params
  await page.route('https://api.bigdatacloud.net/data/reverse-geocode-client*', route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ countryCode, countryName: 'Mocked' }),
    })
  })
}

/**
 * Mock reverse geocoding to fail
 */
export async function mockReverseGeocodeFailure(page: Page): Promise<void> {
  await page.route('https://api.bigdatacloud.net/data/reverse-geocode-client*', route =>
    route.abort()
  )
}

// GPS mocks (Playwright context level)

/**
 * Mock GPS to grant permission with specific coordinates
 */
export async function mockGpsGranted(
  context: BrowserContext,
  coords: { lat: number; lng: number }
): Promise<void> {
  await context.setGeolocation({ latitude: coords.lat, longitude: coords.lng })
  await context.grantPermissions(['geolocation'])
}

/**
 * Mock GPS to deny permission
 */
export async function mockGpsDenied(context: BrowserContext): Promise<void> {
  // Clear permissions - browser will deny geolocation
  await context.clearPermissions()
}

/**
 * Setup slow mock for detection (to test non-blocking)
 */
export async function mockSlowDetection(page: Page, delayMs: number = 2000): Promise<void> {
  await page.route('https://api.country.is/', async route => {
    await new Promise(resolve => setTimeout(resolve, delayMs))
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ ip: MOCK_CLIENT_IP, country: 'CO' }),
    })
  })
}

/**
 * Assert no geo detection requests were made (returning user scenario)
 */
export function createGeoRequestTracker(page: Page): {
  requests: string[]
  waitForRequests: () => Promise<void>
} {
  const requests: string[] = []

  page.on('request', request => {
    const url = request.url()
    if (
      url.startsWith('https://api.country.is') ||
      url.startsWith('https://get.geojs.io') ||
      url.startsWith('https://api.bigdatacloud.net')
    ) {
      requests.push(url)
    }
  })

  return {
    requests,
    waitForRequests: () => page.waitForTimeout(500), // Brief wait to catch any async requests
  }
}
