import type { SupportedLocale } from '../types/Locale'
import type { TranslationDictionary } from '../types/TranslationKeys'
import en from '../data/en.json'
import es from '../data/es.json'
import {
  isLocaleLoaded as loaderIsLocaleLoaded,
  loadTranslations,
  markLocaleLoaded,
} from '../loader'

// ADR-0015 + ADR-0011 Option A: en/es bundled inline (static JSON imports),
// ja/zh lazy loaded (dynamic JSON imports) to keep main bundle small

/**
 * Inline translations - always available (statically imported JSON)
 */
export const inlineTranslations: Readonly<Record<'en' | 'es', TranslationDictionary>> = {
  en,
  es,
} as const

/**
 * Current loaded translations - starts with inline only
 * ja/zh are added dynamically when loaded, fallback to en until then
 */
export const translations: Record<SupportedLocale, TranslationDictionary> = {
  en,
  es,
  // ja/zh fallback to en until loaded (ADR-0011 + ADR-0015)
  zh: en,
  ja: en,
}

/**
 * Check if a locale's translations are loaded
 */
export function isLocaleLoaded(locale: SupportedLocale): boolean {
  return loaderIsLocaleLoaded(locale)
}

/**
 * Lazy load a CJK locale's translations.
 * Returns the loaded dictionary, or null on failure (falls back to en).
 */
export async function loadLocale(locale: SupportedLocale): Promise<TranslationDictionary | null> {
  if (loaderIsLocaleLoaded(locale)) {
    return translations[locale]
  }

  const loaded = await loadTranslations(locale)

  if (loaded) {
    // Update translations record with loaded dictionary
    if (locale === 'zh') {
      translations.zh = loaded
      markLocaleLoaded('zh')
    } else if (locale === 'ja') {
      translations.ja = loaded
      markLocaleLoaded('ja')
    }
    return loaded
  }

  // Load failed - keep using fallback (en)
  return null
}
