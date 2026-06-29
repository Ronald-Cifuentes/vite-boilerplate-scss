// Types
export type { Translator } from './ports/Translator'
export type { SupportedLocale, LocaleMetadata } from './types/Locale'
export type { TranslationDictionary, TranslationKey } from './types/TranslationKeys'

// Config
export {
  DEFAULT_LOCALE,
  SUPPORTED_LOCALES,
  LOCALE_STORAGE_KEY,
  LOCALE_METADATA,
  isSupportedLocale,
} from './config/locales'

// Adapter
export { I18nProvider } from './adapters/I18nProvider'
export type { I18nProviderProps } from './adapters/I18nProvider'

// Hook
export { useTranslation } from './hooks/useTranslation'
