import type { SupportedLocale } from '../types/Locale'
import type { TranslationDictionary } from '../types/TranslationKeys'
import { en } from './en'
import { es } from './es'

export const translations: Readonly<Record<SupportedLocale, TranslationDictionary>> = {
  en,
  es,
} as const
