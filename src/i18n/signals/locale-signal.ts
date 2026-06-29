import { signal, computed } from '@preact/signals-react'
import type { SupportedLocale } from '../types/Locale'
import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from '../config/locales'
import { translations } from '../translations'

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
 * Derived state: the dictionary matching the active locale. Recomputes only
 * when `localeSignal` changes; consumers that read `dictionarySignal.value`
 * get the right translations without manual re-binding.
 */
export const dictionarySignal = computed(() => translations[localeSignal.value])

/** Stable reference list of supported locales. */
export const supportedLocales: readonly SupportedLocale[] = SUPPORTED_LOCALES

/**
 * Update the active locale. Stable reference — safe to pass through props
 * without `useCallback` wrapping.
 */
export function setLocale(next: SupportedLocale): void {
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
