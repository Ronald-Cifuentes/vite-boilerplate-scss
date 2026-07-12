import type { SupportedLocale, LocaleMetadata } from '../types/Locale'

export const LOCALE_STORAGE_KEY = 'app-locale' as const
export const DEFAULT_LOCALE: SupportedLocale = 'en'
export const SUPPORTED_LOCALES: readonly SupportedLocale[] = ['en', 'es', 'zh', 'ja'] as const

export const LOCALE_METADATA: Readonly<Record<SupportedLocale, LocaleMetadata>> = {
  en: { code: 'en', nativeName: 'English', englishName: 'English', direction: 'ltr' },
  es: { code: 'es', nativeName: 'Español', englishName: 'Spanish', direction: 'ltr' },
  zh: { code: 'zh', nativeName: '中文', englishName: 'Chinese', direction: 'ltr' },
  ja: { code: 'ja', nativeName: '日本語', englishName: 'Japanese', direction: 'ltr' },
} as const

export function isSupportedLocale(value: string): value is SupportedLocale {
  return SUPPORTED_LOCALES.includes(value as SupportedLocale)
}
