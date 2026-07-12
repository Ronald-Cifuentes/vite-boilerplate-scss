/**
 * Geo-detection provider configuration
 * ADR-0014: curl-verified endpoints for IP geolocation and reverse geocoding
 */

// IP Geolocation Providers
export const IP_PRIMARY_URL = 'https://api.country.is/' as const
export const IP_FALLBACK_URL = 'https://get.geojs.io/v1/ip/country.json' as const
export const IP_TIMEOUT_MS = 3000 as const

// Reverse Geocoding Provider (for GPS path)
export const REVERSE_GEOCODE_URL =
  'https://api.bigdatacloud.net/data/reverse-geocode-client' as const
export const REVERSE_GEOCODE_TIMEOUT_MS = 3000 as const

// GPS Parameters
export const GPS_TIMEOUT_MS = 5000 as const
export const GPS_MAXIMUM_AGE_MS = 600000 as const // 10 minutes - cached position OK
export const GPS_ENABLE_HIGH_ACCURACY = false as const // Country-level is sufficient

// ISO country code validation regex
export const COUNTRY_CODE_REGEX = /^[A-Z]{2}$/
