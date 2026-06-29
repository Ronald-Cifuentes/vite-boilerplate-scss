import type { SupportedLocale, LocaleMetadata } from '../types/Locale'

export const LOCALE_STORAGE_KEY = 'app-locale' as const
export const DEFAULT_LOCALE: SupportedLocale = 'en'
export const SUPPORTED_LOCALES: readonly SupportedLocale[] = ['en', 'es'] as const

export const LOCALE_METADATA: Readonly<Record<SupportedLocale, LocaleMetadata>> = {
  en: { code: 'en', nativeName: 'English', englishName: 'English', direction: 'ltr' },
  es: { code: 'es', nativeName: 'Español', englishName: 'Spanish', direction: 'ltr' },
} as const

export function isSupportedLocale(value: string): value is SupportedLocale {
  return SUPPORTED_LOCALES.includes(value as SupportedLocale)
}
