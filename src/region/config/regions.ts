import type { SupportedRegion, RegionMetadata } from '../types/Region'

export const REGION_STORAGE_KEY = 'app-region' as const
export const DEFAULT_REGION: SupportedRegion = 'US'
export const SUPPORTED_REGIONS: readonly SupportedRegion[] = ['US', 'ES', 'GB', 'MX'] as const

export const REGION_METADATA: Readonly<Record<SupportedRegion, RegionMetadata>> = {
  US: {
    code: 'US',
    nativeName: 'United States',
    englishName: 'United States',
    dateLocale: 'en-US',
    numberLocale: 'en-US',
    currency: 'USD',
  },
  ES: {
    code: 'ES',
    nativeName: 'Espana',
    englishName: 'Spain',
    dateLocale: 'es-ES',
    numberLocale: 'es-ES',
    currency: 'EUR',
  },
  GB: {
    code: 'GB',
    nativeName: 'United Kingdom',
    englishName: 'United Kingdom',
    dateLocale: 'en-GB',
    numberLocale: 'en-GB',
    currency: 'GBP',
  },
  MX: {
    code: 'MX',
    nativeName: 'Mexico',
    englishName: 'Mexico',
    dateLocale: 'es-MX',
    numberLocale: 'es-MX',
    currency: 'MXN',
  },
} as const

export function isValidRegion(value: string): value is SupportedRegion {
  return SUPPORTED_REGIONS.includes(value as SupportedRegion)
}
