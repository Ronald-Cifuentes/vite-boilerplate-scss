import type { SupportedLocale } from '../types/Locale'
import { DEFAULT_LOCALE, isSupportedLocale, LOCALE_STORAGE_KEY } from '../config/locales'
import type { Translator } from '../ports/Translator'
import {
  localeSignal,
  setLocale as setLocaleSignal,
  supportedLocales,
  translate,
} from './locale-signal'
import { persistLocale } from './persistence'

/**
 * Resolve which locale to use on initial mount. Mirrors the previous
 * `resolveInitialLocale` logic that lived inside `I18nProvider`. Priority:
 *   1. `override` (the prop, if valid)
 *   2. localStorage value, if any
 *   3. navigator.language prefix
 *   4. DEFAULT_LOCALE
 */
export function resolveInitialLocale(override?: SupportedLocale): SupportedLocale {
  if (override && isSupportedLocale(override)) {
    return override
  }

  try {
    const stored = localStorage.getItem(LOCALE_STORAGE_KEY)
    if (stored && isSupportedLocale(stored)) {
      return stored
    }
  } catch {
    // localStorage unavailable — continue
  }

  if (typeof navigator !== 'undefined' && navigator.language) {
    const browserLang = navigator.language.split('-')[0]
    if (isSupportedLocale(browserLang)) {
      return browserLang
    }
  }

  return DEFAULT_LOCALE
}

/**
 * Persist + assign in one call. Stable reference (re-assigned here at
 * module load, then never changes) — safe to pass to consumers without
 * memoization.
 */
export const setLocale = (next: SupportedLocale): void => {
  persistLocale(next)
  setLocaleSignal(next)
}

/**
 * The `Translator` API surface, backed by module-level signals. Exposed
 * as a plain object so consumers can read it without a hook. Components
 * that render against this object MUST call `useSignals()` (the wrapper
 * hook `useTranslation` does this for them) to subscribe to changes.
 */
export const translator: Translator = {
  t: translate,
  get locale(): SupportedLocale {
    return localeSignal.value
  },
  setLocale,
  supportedLocales,
}
