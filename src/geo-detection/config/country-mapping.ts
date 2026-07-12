import type { SupportedLocale } from '../../i18n'
import type { SupportedRegion } from '../../region'
import type { SupportedCurrency } from '../../currency'

/**
 * Country-to-preference mapping per ADR-0014
 * Maps ISO 3166-1 alpha-2 country codes to locale/region/currency
 */
export interface CountryPrefs {
  readonly locale: SupportedLocale
  readonly region: SupportedRegion
  readonly currency: SupportedCurrency
}

export const COUNTRY_TO_PREFS: Readonly<Record<string, CountryPrefs>> = {
  CO: { locale: 'es', region: 'CO', currency: 'COP' },
  US: { locale: 'en', region: 'US', currency: 'USD' },
  ES: { locale: 'es', region: 'ES', currency: 'EUR' },
  GB: { locale: 'en', region: 'GB', currency: 'GBP' },
  MX: { locale: 'es', region: 'MX', currency: 'MXN' },
  CN: { locale: 'zh', region: 'CN', currency: 'CNY' },
  JP: { locale: 'ja', region: 'JP', currency: 'JPY' },
} as const

export const SUPPORTED_COUNTRIES = Object.keys(COUNTRY_TO_PREFS)

/**
 * Check if a country code is supported for full detection
 */
export function isSupportedCountry(countryCode: string): boolean {
  return countryCode in COUNTRY_TO_PREFS
}

/**
 * Get preferences for a supported country
 * Returns null if country not supported
 */
export function getPrefsForCountry(countryCode: string): CountryPrefs | null {
  return COUNTRY_TO_PREFS[countryCode] ?? null
}
