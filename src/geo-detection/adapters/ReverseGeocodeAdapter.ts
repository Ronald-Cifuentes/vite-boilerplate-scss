import { REVERSE_GEOCODE_URL, REVERSE_GEOCODE_TIMEOUT_MS, COUNTRY_CODE_REGEX } from '../config'
import type { GpsCoords } from './GpsAdapter'

export type ReverseGeocodeResult =
  | { readonly success: true; readonly countryCode: string }
  | { readonly success: false; readonly reason: 'network' | 'invalid' | 'timeout' }

/**
 * Reverse geocode GPS coordinates to country code via BigDataCloud
 * ADR-0014: fail-closed validation - countryCode must match ^[A-Z]{2}$
 */
export async function reverseGeocode(coords: GpsCoords): Promise<ReverseGeocodeResult> {
  const controller = new AbortController()
  /* istanbul ignore next -- @preserve timeout callback only fires on slow networks */
  const abort = (): void => controller.abort()
  const timeoutId = setTimeout(abort, REVERSE_GEOCODE_TIMEOUT_MS)

  try {
    const url = `${REVERSE_GEOCODE_URL}?latitude=${coords.latitude}&longitude=${coords.longitude}&localityLanguage=en`
    const response = await fetch(url, { signal: controller.signal })

    if (!response.ok) {
      return { success: false, reason: 'network' }
    }

    const data = await response.json()

    // Fail-closed validation: countryCode must be valid ISO alpha-2
    const countryCode = data.countryCode
    if (typeof countryCode !== 'string' || !COUNTRY_CODE_REGEX.test(countryCode)) {
      return { success: false, reason: 'invalid' }
    }

    return { success: true, countryCode }
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      return { success: false, reason: 'timeout' }
    }
    return { success: false, reason: 'network' }
  } finally {
    clearTimeout(timeoutId)
  }
}
