// Geo-detection module - lazy chunk entry point
// ADR-0014: This module is dynamically imported only on first visit with no stored prefs

export { detectGeoPreferences } from './adapters'
export type { GpsCoords, GpsResult, ReverseGeocodeResult, IpGeoResult } from './adapters'
export {
  COUNTRY_TO_PREFS,
  SUPPORTED_COUNTRIES,
  isSupportedCountry,
  getPrefsForCountry,
} from './config'
export type { CountryPrefs } from './config'
export { useGeoDetection } from './hooks'
export type { GeoResult, GeoSource } from './types'
