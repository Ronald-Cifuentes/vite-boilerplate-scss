/**
 * Region codes for Intl date/number formatting.
 * Distinct from language: e.g., user may read English but want European date formats.
 */
export type SupportedRegion = 'US' | 'ES' | 'GB' | 'MX'

export interface RegionMetadata {
  readonly code: SupportedRegion
  readonly nativeName: string
  readonly englishName: string
  readonly dateLocale: string
  readonly numberLocale: string
  readonly currency: string
}
