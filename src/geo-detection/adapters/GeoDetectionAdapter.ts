import { isSupportedCountry, getPrefsForCountry } from '../config'
import type { GeoResult } from '../types'
import type { SupportedLocale } from '../../i18n'
import { isSupportedLocale, DEFAULT_LOCALE } from '../../i18n/config/locales'
import { DEFAULT_REGION } from '../../region/config/regions'
import { requestGpsPosition } from './GpsAdapter'
import { reverseGeocode } from './ReverseGeocodeAdapter'
import { getIpCountry } from './IpGeoAdapter'

/**
 * Default preferences when detection fails entirely
 */
const DEFAULT_RESULT: GeoResult = {
  locale: DEFAULT_LOCALE,
  region: DEFAULT_REGION,
  currency: 'USD',
  source: 'default',
}

/**
 * Get device language from navigator.languages
 * Returns first supported locale found, or null
 */
function getDeviceLanguageLocale(): SupportedLocale | null {
  if (typeof navigator === 'undefined' || !navigator.languages) {
    return null
  }

  for (const lang of navigator.languages) {
    // Extract language code (e.g., 'en-US' -> 'en')
    const langCode = lang.split('-')[0].toLowerCase()
    if (isSupportedLocale(langCode)) {
      return langCode
    }
  }
  return null
}

/**
 * Build result from device language fallback
 * Only sets locale, uses defaults for region/currency
 */
function buildDeviceLanguageResult(locale: SupportedLocale): GeoResult {
  return {
    locale,
    region: DEFAULT_REGION,
    currency: 'USD',
    source: 'device-language',
  }
}

/**
 * Run parallel GPS + IP detection and resolve winner
 * ADR-0014: GPS wins over IP when granted and reverse geocode succeeds
 */
export async function detectGeoPreferences(): Promise<GeoResult> {
  // Start both detection paths in parallel
  const [gpsResult, ipResult] = await Promise.all([runGpsPath(), getIpCountry()])

  // GPS wins if it succeeded
  // Note: runGpsPath already filters unsupported countries, so prefs will always be valid
  // The null-check is defense-in-depth against future changes
  if (gpsResult !== null) {
    const prefs = getPrefsForCountry(gpsResult)
    /* istanbul ignore else -- @preserve defense-in-depth: runGpsPath validates country */
    if (prefs) {
      return { ...prefs, source: 'gps' }
    }
  }

  // IP fallback
  if (ipResult.success) {
    const prefs = getPrefsForCountry(ipResult.countryCode)
    if (prefs) {
      return { ...prefs, source: 'ip' }
    }

    // IP succeeded but country not supported - use device language for locale
    const deviceLocale = getDeviceLanguageLocale()
    if (deviceLocale) {
      return buildDeviceLanguageResult(deviceLocale)
    }
  }

  // Both failed - try device language
  const deviceLocale = getDeviceLanguageLocale()
  if (deviceLocale) {
    return buildDeviceLanguageResult(deviceLocale)
  }

  // Complete failure - return defaults
  return DEFAULT_RESULT
}

/**
 * Run GPS path: request position -> reverse geocode -> country code
 * Returns country code if successful, null otherwise
 */
async function runGpsPath(): Promise<string | null> {
  const gpsResult = await requestGpsPosition()

  if (!gpsResult.success) {
    return null
  }

  const geocodeResult = await reverseGeocode(gpsResult.coords)

  if (!geocodeResult.success) {
    return null
  }

  // Only return if country is supported
  if (!isSupportedCountry(geocodeResult.countryCode)) {
    return null
  }

  return geocodeResult.countryCode
}
