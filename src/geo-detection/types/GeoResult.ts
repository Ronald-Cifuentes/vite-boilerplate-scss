import type { SupportedLocale } from '../../i18n'
import type { SupportedRegion } from '../../region'
import type { SupportedCurrency } from '../../currency'

/**
 * Result of geo detection containing detected preferences
 */
export interface GeoResult {
  readonly locale: SupportedLocale
  readonly region: SupportedRegion
  readonly currency: SupportedCurrency
  readonly source: GeoSource
}

/**
 * Source of geo detection for debugging/logging
 */
export type GeoSource = 'gps' | 'ip' | 'device-language' | 'default'

/**
 * Intermediate result from IP geolocation providers
 */
export interface IpGeoResponse {
  readonly country: string
}

/**
 * Response from BigDataCloud reverse geocoding
 */
export interface ReverseGeocodeResponse {
  readonly countryCode: string
  readonly countryName?: string
}
