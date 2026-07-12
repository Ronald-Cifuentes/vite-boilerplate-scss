export {
  IP_PRIMARY_URL,
  IP_FALLBACK_URL,
  IP_TIMEOUT_MS,
  REVERSE_GEOCODE_URL,
  REVERSE_GEOCODE_TIMEOUT_MS,
  GPS_TIMEOUT_MS,
  GPS_MAXIMUM_AGE_MS,
  GPS_ENABLE_HIGH_ACCURACY,
  COUNTRY_CODE_REGEX,
} from './providers'

export {
  COUNTRY_TO_PREFS,
  SUPPORTED_COUNTRIES,
  isSupportedCountry,
  getPrefsForCountry,
} from './country-mapping'

export type { CountryPrefs } from './country-mapping'
