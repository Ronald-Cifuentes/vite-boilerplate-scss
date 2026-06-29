import type { SupportedLocale } from '../types/Locale'
import type { TranslationKey } from '../types/TranslationKeys'

export interface Translator {
  t: (key: TranslationKey) => string
  locale: SupportedLocale
  setLocale: (locale: SupportedLocale) => void
  supportedLocales: readonly SupportedLocale[]
}
