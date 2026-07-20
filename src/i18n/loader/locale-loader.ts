import type { SupportedLocale } from '../types/Locale'
import type { TranslationDictionary } from '../types/TranslationKeys'

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
 * Mark a locale as loaded (called by translations/index.ts after dynamic import)
 */
export function markLocaleLoaded(locale: SupportedLocale): void {
  loadedLocales.add(locale)
}

/**
 * Reset loaded locales to initial state (for testing)
 */
export function resetLoadedLocales(): void {
  loadedLocales.clear()
  loadedLocales.add('en')
  loadedLocales.add('es')
}

/**
 * Lazy load a CJK locale's translations.
 * Dynamic imports produce separate chunks for ja/zh (Vite code-splitting).
 * Returns the loaded dictionary, or null on failure.
 */
export async function loadTranslations(
  locale: SupportedLocale
): Promise<TranslationDictionary | null> {
  if (loadedLocales.has(locale)) {
    // Already loaded - return value from translations record
    // The actual dictionary is managed by translations/index.ts
    return null
  }

  try {
    if (locale === 'zh') {
      const module = await import('../data/zh.json')
      loadedLocales.add('zh')
      return module.default as unknown as TranslationDictionary
    }
    if (locale === 'ja') {
      const module = await import('../data/ja.json')
      loadedLocales.add('ja')
      return module.default as unknown as TranslationDictionary
    }
    // Unsupported locale
    return null
  } catch (error) {
    /* istanbul ignore next -- @preserve Runtime error handling: dynamic import() failures cannot be reliably mocked in Jest */
    console.error(`Failed to load translations for locale "${locale}":`, error)
    /* istanbul ignore next -- @preserve */
    return null
  }
}
