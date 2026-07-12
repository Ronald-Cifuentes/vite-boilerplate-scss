import type { SupportedLocale } from '../types/Locale'
import type { TranslationDictionary } from '../types/TranslationKeys'
import { en } from './en'
import { es } from './es'

// ADR-0014 + ADR-0011 Option A: en/es bundled inline, zh/ja lazy loaded
// zh/ja are loaded on-demand when selected to keep main bundle small

/**
 * Inline translations - always available
 */
export const inlineTranslations: Readonly<Record<'en' | 'es', TranslationDictionary>> = {
  en,
  es,
} as const

/**
 * Current loaded translations - starts with inline only
 * zh/ja are added dynamically when loaded
 */
export const translations: Record<SupportedLocale, TranslationDictionary> = {
  en,
  es,
  // zh/ja will be populated by loadLocale()
  zh: en, // Fallback to en until loaded
  ja: en, // Fallback to en until loaded
}

/**
 * Track which lazy locales have been loaded
 */
const loadedLocales = new Set<SupportedLocale>(['en', 'es'])

/**
 * Check if a locale's translations are loaded
 */
export function isLocaleLoaded(locale: SupportedLocale): boolean {
  return loadedLocales.has(locale)
}

/**
 * Lazy load a CJK locale's translations
 * Returns the loaded dictionary, or null on failure
 */
export async function loadLocale(locale: SupportedLocale): Promise<TranslationDictionary | null> {
  // Already loaded
  if (loadedLocales.has(locale)) {
    return translations[locale]
  }

  try {
    if (locale === 'zh') {
      const module = await import('./zh')
      translations.zh = module.zh
      loadedLocales.add('zh')
      return module.zh
    }
    if (locale === 'ja') {
      const module = await import('./ja')
      translations.ja = module.ja
      loadedLocales.add('ja')
      return module.ja
    }
    return null
  } catch {
    // Load failed - keep using fallback
    return null
  }
}
