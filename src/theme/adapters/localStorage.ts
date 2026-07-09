import type { ThemePreference } from '../types/Theme'
import { THEME_STORAGE_KEY, isValidPreference } from '../config/themes'

export function persistPreference(preference: ThemePreference): void {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, preference)
  } catch {
    // localStorage unavailable - silent fail
  }
}

export function loadPersistedPreference(): ThemePreference | null {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY)
    if (stored && isValidPreference(stored)) {
      return stored
    }
  } catch {
    // localStorage unavailable
  }
  return null
}

export function clearPersistedPreference(): void {
  try {
    localStorage.removeItem(THEME_STORAGE_KEY)
  } catch {
    // localStorage unavailable - silent fail
  }
}
