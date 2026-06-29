import type { SupportedLocale } from '../types/Locale'
import { LOCALE_STORAGE_KEY } from '../config/locales'

/**
 * Persist the active locale to localStorage. Silent on failure — the app
 * continues to work in environments where storage is unavailable (SSR,
 * private mode, quota exceeded).
 */
export function persistLocale(locale: SupportedLocale): void {
  try {
    localStorage.setItem(LOCALE_STORAGE_KEY, locale)
  } catch {
    // localStorage unavailable — silent fail
  }
}
