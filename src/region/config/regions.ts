import type { SupportedRegion, RegionMetadata } from '../types/Region'

export const REGION_STORAGE_KEY = 'app-region' as const
export const DEFAULT_REGION: SupportedRegion = 'US'
export const SUPPORTED_REGIONS: readonly SupportedRegion[] = [
  'US',
  'ES',
  'GB',
  'MX',
  'CO',
  'CN',
  'JP',
] as const

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
  CO: {
    code: 'CO',
    nativeName: 'Colombia',
    englishName: 'Colombia',
    dateLocale: 'es-CO',
    numberLocale: 'es-CO',
    currency: 'COP',
  },
  CN: {
    code: 'CN',
    nativeName: '中国',
    englishName: 'China',
    dateLocale: 'zh-CN',
    numberLocale: 'zh-CN',
    currency: 'CNY',
  },
  JP: {
    code: 'JP',
    nativeName: '日本',
    englishName: 'Japan',
    dateLocale: 'ja-JP',
    numberLocale: 'ja-JP',
    currency: 'JPY',
  },
} as const

export const isValidRegion = (v: string): v is SupportedRegion =>
  SUPPORTED_REGIONS.includes(v as SupportedRegion)
