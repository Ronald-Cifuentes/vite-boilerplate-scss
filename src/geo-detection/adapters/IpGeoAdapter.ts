import { IP_PRIMARY_URL, IP_FALLBACK_URL, IP_TIMEOUT_MS, COUNTRY_CODE_REGEX } from '../config'

export type IpGeoResult =
  | { readonly success: true; readonly countryCode: string }
  | { readonly success: false; readonly reason: 'network' | 'invalid' | 'timeout' }

/**
 * Fetch country code from a single IP geolocation provider
 */
async function fetchFromProvider(url: string): Promise<IpGeoResult> {
  const controller = new AbortController()
  /* istanbul ignore next -- @preserve timeout callback only fires on slow networks */
  const abort = (): void => controller.abort()
  const timeoutId = setTimeout(abort, IP_TIMEOUT_MS)

  try {
    const response = await fetch(url, { signal: controller.signal })

    if (!response.ok) {
      return { success: false, reason: 'network' }
    }

    const data = await response.json()

    // Both providers return `country` field with ISO alpha-2 code
    const countryCode = data.country
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

/**
 * Get country code via IP geolocation with fallback
 * ADR-0014: api.country.is primary, get.geojs.io fallback
 */
export async function getIpCountry(): Promise<IpGeoResult> {
  // Try primary provider first
  const primaryResult = await fetchFromProvider(IP_PRIMARY_URL)
  if (primaryResult.success) {
    return primaryResult
  }

  // Fallback to secondary provider
  return fetchFromProvider(IP_FALLBACK_URL)
}
