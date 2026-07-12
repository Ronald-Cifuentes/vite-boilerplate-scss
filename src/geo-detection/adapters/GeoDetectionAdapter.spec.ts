import { detectGeoPreferences } from './GeoDetectionAdapter'
import * as GpsAdapter from './GpsAdapter'
import * as ReverseGeocodeAdapter from './ReverseGeocodeAdapter'
import * as IpGeoAdapter from './IpGeoAdapter'

jest.mock('./GpsAdapter')
jest.mock('./ReverseGeocodeAdapter')
jest.mock('./IpGeoAdapter')

const mockRequestGpsPosition = GpsAdapter.requestGpsPosition as jest.Mock
const mockReverseGeocode = ReverseGeocodeAdapter.reverseGeocode as jest.Mock
const mockGetIpCountry = IpGeoAdapter.getIpCountry as jest.Mock

function setupNavigatorLanguages(languages: string[]): void {
  Object.defineProperty(navigator, 'languages', {
    value: languages,
    configurable: true,
  })
}

describe('GeoDetectionAdapter - GPS wins over IP', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    setupNavigatorLanguages([])
  })

  it('returns GPS result when GPS succeeds with supported country', async () => {
    mockRequestGpsPosition.mockResolvedValue({
      success: true,
      coords: { latitude: 6.25, longitude: -75.58 },
    })
    mockReverseGeocode.mockResolvedValue({
      success: true,
      countryCode: 'CO',
    })
    mockGetIpCountry.mockResolvedValue({
      success: true,
      countryCode: 'US', // Different country via IP
    })

    const result = await detectGeoPreferences()

    expect(result).toEqual({
      locale: 'es',
      region: 'CO',
      currency: 'COP',
      source: 'gps',
    })
  })

  it('VPN scenario: GPS=CO + IP=US -> CO wins', async () => {
    mockRequestGpsPosition.mockResolvedValue({
      success: true,
      coords: { latitude: 6.25, longitude: -75.58 },
    })
    mockReverseGeocode.mockResolvedValue({
      success: true,
      countryCode: 'CO',
    })
    mockGetIpCountry.mockResolvedValue({
      success: true,
      countryCode: 'US',
    })

    const result = await detectGeoPreferences()

    expect(result.region).toBe('CO')
    expect(result.source).toBe('gps')
  })
})

describe('GeoDetectionAdapter - IP fallback when GPS fails', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    setupNavigatorLanguages([])
  })

  it('uses IP result when GPS is denied', async () => {
    mockRequestGpsPosition.mockResolvedValue({
      success: false,
      reason: 'denied',
    })
    mockGetIpCountry.mockResolvedValue({
      success: true,
      countryCode: 'MX',
    })

    const result = await detectGeoPreferences()

    expect(result).toEqual({
      locale: 'es',
      region: 'MX',
      currency: 'MXN',
      source: 'ip',
    })
  })

  it('uses IP result when GPS times out', async () => {
    mockRequestGpsPosition.mockResolvedValue({
      success: false,
      reason: 'timeout',
    })
    mockGetIpCountry.mockResolvedValue({
      success: true,
      countryCode: 'GB',
    })

    const result = await detectGeoPreferences()

    expect(result).toEqual({
      locale: 'en',
      region: 'GB',
      currency: 'GBP',
      source: 'ip',
    })
  })

  it('uses IP result when reverse geocode fails', async () => {
    mockRequestGpsPosition.mockResolvedValue({
      success: true,
      coords: { latitude: 6.25, longitude: -75.58 },
    })
    mockReverseGeocode.mockResolvedValue({
      success: false,
      reason: 'network',
    })
    mockGetIpCountry.mockResolvedValue({
      success: true,
      countryCode: 'ES',
    })

    const result = await detectGeoPreferences()

    expect(result).toEqual({
      locale: 'es',
      region: 'ES',
      currency: 'EUR',
      source: 'ip',
    })
  })
})

describe('GeoDetectionAdapter - device language fallback', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    setupNavigatorLanguages([])
  })

  it('uses device language when both GPS and IP fail', async () => {
    mockRequestGpsPosition.mockResolvedValue({
      success: false,
      reason: 'denied',
    })
    mockGetIpCountry.mockResolvedValue({
      success: false,
      reason: 'network',
    })
    setupNavigatorLanguages(['ja-JP', 'en-US'])

    const result = await detectGeoPreferences()

    expect(result).toEqual({
      locale: 'ja',
      region: 'US',
      currency: 'USD',
      source: 'device-language',
    })
  })

  it('uses device language when IP returns unsupported country', async () => {
    mockRequestGpsPosition.mockResolvedValue({
      success: false,
      reason: 'unavailable',
    })
    mockGetIpCountry.mockResolvedValue({
      success: true,
      countryCode: 'FR', // Unsupported
    })
    setupNavigatorLanguages(['es-ES'])

    const result = await detectGeoPreferences()

    expect(result).toEqual({
      locale: 'es',
      region: 'US',
      currency: 'USD',
      source: 'device-language',
    })
  })

  it('extracts language code from locale string', async () => {
    mockRequestGpsPosition.mockResolvedValue({
      success: false,
      reason: 'denied',
    })
    mockGetIpCountry.mockResolvedValue({
      success: false,
      reason: 'network',
    })
    setupNavigatorLanguages(['zh-CN', 'en'])

    const result = await detectGeoPreferences()

    expect(result.locale).toBe('zh')
  })
})

describe('GeoDetectionAdapter - default fallback', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    setupNavigatorLanguages([])
  })

  it('returns defaults when all detection fails', async () => {
    mockRequestGpsPosition.mockResolvedValue({
      success: false,
      reason: 'denied',
    })
    mockGetIpCountry.mockResolvedValue({
      success: false,
      reason: 'network',
    })
    setupNavigatorLanguages(['fr-FR']) // Unsupported language

    const result = await detectGeoPreferences()

    expect(result).toEqual({
      locale: 'en',
      region: 'US',
      currency: 'USD',
      source: 'default',
    })
  })

  it('returns defaults when navigator.languages is empty', async () => {
    mockRequestGpsPosition.mockResolvedValue({
      success: false,
      reason: 'denied',
    })
    mockGetIpCountry.mockResolvedValue({
      success: false,
      reason: 'network',
    })
    setupNavigatorLanguages([])

    const result = await detectGeoPreferences()

    expect(result.source).toBe('default')
  })

  it('returns defaults when navigator is undefined', async () => {
    mockRequestGpsPosition.mockResolvedValue({
      success: false,
      reason: 'denied',
    })
    mockGetIpCountry.mockResolvedValue({
      success: false,
      reason: 'network',
    })
    // Temporarily make navigator.languages undefined
    const originalLanguages = navigator.languages
    Object.defineProperty(navigator, 'languages', {
      value: undefined,
      configurable: true,
    })

    const result = await detectGeoPreferences()

    expect(result.source).toBe('default')

    // Restore
    Object.defineProperty(navigator, 'languages', {
      value: originalLanguages,
      configurable: true,
    })
  })
})

describe('GeoDetectionAdapter - GPS with unsupported country', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    setupNavigatorLanguages([])
  })

  it('falls back to IP when GPS returns unsupported country', async () => {
    mockRequestGpsPosition.mockResolvedValue({
      success: true,
      coords: { latitude: 48.8566, longitude: 2.3522 }, // Paris
    })
    mockReverseGeocode.mockResolvedValue({
      success: true,
      countryCode: 'FR', // France not supported
    })
    mockGetIpCountry.mockResolvedValue({
      success: true,
      countryCode: 'ES', // Spain is supported
    })

    const result = await detectGeoPreferences()

    expect(result).toEqual({
      locale: 'es',
      region: 'ES',
      currency: 'EUR',
      source: 'ip',
    })
  })

  it('falls back to device language when GPS unsupported AND IP unsupported', async () => {
    // GPS returns unsupported country (France)
    mockRequestGpsPosition.mockResolvedValue({
      success: true,
      coords: { latitude: 48.8566, longitude: 2.3522 },
    })
    mockReverseGeocode.mockResolvedValue({
      success: true,
      countryCode: 'FR', // Not supported
    })
    // IP also returns unsupported country
    mockGetIpCountry.mockResolvedValue({
      success: true,
      countryCode: 'DE', // Germany not supported
    })
    // Device language is Spanish
    setupNavigatorLanguages(['es-MX'])

    const result = await detectGeoPreferences()

    expect(result).toEqual({
      locale: 'es',
      region: 'US',
      currency: 'USD',
      source: 'device-language',
    })
  })

  it('falls back to defaults when GPS unsupported AND IP unsupported AND no device language', async () => {
    // GPS returns unsupported country
    mockRequestGpsPosition.mockResolvedValue({
      success: true,
      coords: { latitude: 48.8566, longitude: 2.3522 },
    })
    mockReverseGeocode.mockResolvedValue({
      success: true,
      countryCode: 'FR',
    })
    // IP also returns unsupported country
    mockGetIpCountry.mockResolvedValue({
      success: true,
      countryCode: 'DE',
    })
    // No device languages available
    setupNavigatorLanguages([])

    const result = await detectGeoPreferences()

    expect(result).toEqual({
      locale: 'en',
      region: 'US',
      currency: 'USD',
      source: 'default',
    })
  })
})

describe('GeoDetectionAdapter - all supported countries via IP', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    setupNavigatorLanguages([])
    mockRequestGpsPosition.mockResolvedValue({
      success: false,
      reason: 'denied',
    })
  })

  it.each([
    { country: 'CO', locale: 'es', region: 'CO', currency: 'COP' },
    { country: 'US', locale: 'en', region: 'US', currency: 'USD' },
    { country: 'ES', locale: 'es', region: 'ES', currency: 'EUR' },
    { country: 'GB', locale: 'en', region: 'GB', currency: 'GBP' },
    { country: 'MX', locale: 'es', region: 'MX', currency: 'MXN' },
    { country: 'CN', locale: 'zh', region: 'CN', currency: 'CNY' },
    { country: 'JP', locale: 'ja', region: 'JP', currency: 'JPY' },
  ])(
    'maps $country to $locale/$region/$currency',
    async ({ country, locale, region, currency }) => {
      mockGetIpCountry.mockResolvedValue({
        success: true,
        countryCode: country,
      })

      const result = await detectGeoPreferences()

      expect(result).toEqual({
        locale,
        region,
        currency,
        source: 'ip',
      })
    }
  )
})
