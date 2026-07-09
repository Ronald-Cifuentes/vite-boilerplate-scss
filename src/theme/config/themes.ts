import type { ThemePreference, ThemeMode, ThemeConfig } from '../types/Theme'

export const THEME_STORAGE_KEY = 'app-theme' as const
export const DEFAULT_PREFERENCE: ThemePreference = 'system'
export const SUPPORTED_PREFERENCES: readonly ThemePreference[] = [
  'light',
  'dark',
  'system',
] as const

export const THEME_CONFIG: ThemeConfig = {
  defaultPreference: DEFAULT_PREFERENCE,
  storageKey: THEME_STORAGE_KEY,
  supportedPreferences: SUPPORTED_PREFERENCES,
} as const

/** Validate stored preference value */
export function isValidPreference(value: string): value is ThemePreference {
  return SUPPORTED_PREFERENCES.includes(value as ThemePreference)
}

/** Validate effective mode value (data-theme attribute) */
export function isValidTheme(value: string): value is ThemeMode {
  return value === 'light' || value === 'dark'
}

/** Cycle order: light -> dark -> system -> light */
export function getNextPreference(current: ThemePreference): ThemePreference {
  const order: ThemePreference[] = ['light', 'dark', 'system']
  const currentIndex = order.indexOf(current)
  return order[(currentIndex + 1) % order.length]
}
