import { signal, computed } from '@preact/signals-react'
import type { SupportedLocale } from '../types/Locale'
import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from '../config/locales'
import { translations, isLocaleLoaded, loadLocale } from '../translations'

/**
 * Singleton signal carrying the active locale for the whole app.
 *
 * Lives at module scope so that any component reading it (via `useSignals()`)
 * re-renders only when the value actually changes, without needing a Context
 * Provider tree. `<I18nProvider>` resets this signal on mount to provide
 * per-render isolation (essential for tests).
 */
export const localeSignal = signal<SupportedLocale>(DEFAULT_LOCALE)

/**
 * Signal to track when translations are being loaded (for CJK lazy chunks)
 */
export const localeLoadingSignal = signal<boolean>(false)

/**
 * Signal to force dictionary recomputation after lazy load
 * Incremented each time a lazy locale chunk is loaded
 */
const dictionaryVersionSignal = signal<number>(0)

/**
 * Derived state: the dictionary matching the active locale. Recomputes only
 * when `localeSignal` or `dictionaryVersionSignal` changes; consumers that read
 * `dictionarySignal.value` get the right translations without manual re-binding.
 */
export const dictionarySignal = computed(() => {
  // Read version signal to establish dependency (triggers recomputation after lazy loads)
  // Number.isFinite reads the value to create the dependency; always true for integers
  Number.isFinite(dictionaryVersionSignal.value)
  return translations[localeSignal.value]
})

/** Stable reference list of supported locales. */
export const supportedLocales: readonly SupportedLocale[] = SUPPORTED_LOCALES

/**
 * Update the active locale. Stable reference — safe to pass through props
 * without `useCallback` wrapping.
 * ADR-0014: For zh/ja, triggers lazy load of translations chunk
 */
export function setLocale(next: SupportedLocale): void {
  // For CJK locales, trigger lazy loading if not already loaded
  if ((next === 'zh' || next === 'ja') && !isLocaleLoaded(next)) {
    localeLoadingSignal.value = true
    void loadLocale(next).then(() => {
      localeLoadingSignal.value = false
      // Force dictionary recomputation by bumping version
      dictionaryVersionSignal.value++
    })
  }
  // Always set immediately - will use fallback (en) until chunk loads
  localeSignal.value = next
}

/**
 * Translate a dotted key (e.g. `'greeting.hello'`) using the active
 * dictionary. Re-reads `dictionarySignal.value` on every call so the result
 * always reflects the latest locale.
 */
export function translate(key: string): string {
  const keys = key.split('.')
  let value: unknown = dictionarySignal.value

  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = (value as Record<string, unknown>)[k]
    } else {
      return key
    }
  }

  return typeof value === 'string' ? value : key
}
