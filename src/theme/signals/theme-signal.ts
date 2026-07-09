import { signal, computed } from '@preact/signals-react'
import type { ThemePreference, ThemeMode } from '../types/Theme'
import { DEFAULT_PREFERENCE, getNextPreference } from '../config/themes'

/**
 * User's stored preference (what they chose).
 * Lives at module scope so that any component reading it (via `useSignals()`)
 * re-renders only when the value actually changes.
 */
export const themePreferenceSignal = signal<ThemePreference>(DEFAULT_PREFERENCE)

/**
 * Tracks OS prefers-color-scheme: dark in real-time.
 * Updated by matchMedia listener in ThemeProvider.
 */
export const osPrefersDarkSignal = signal<boolean>(
  /* istanbul ignore next -- @preserve SSR guard */
  typeof window !== 'undefined' ? window.matchMedia('(prefers-color-scheme: dark)').matches : false
)

/**
 * Resolved effective mode (what data-theme gets).
 * When preference is 'system', resolves from OS preference.
 */
export const effectiveThemeSignal = computed<ThemeMode>(() => {
  const pref = themePreferenceSignal.value
  if (pref === 'light' || pref === 'dark') return pref
  // 'system' -> resolve from OS
  return osPrefersDarkSignal.value ? 'dark' : 'light'
})

/** Derived state: is effective theme light mode */
export const isLightMode = computed(() => effectiveThemeSignal.value === 'light')

/** Derived state: is effective theme dark mode */
export const isDarkMode = computed(() => effectiveThemeSignal.value === 'dark')

/**
 * Update the user's preference. Stable reference - safe to pass through props
 * without useCallback wrapping.
 */
export function setPreference(preference: ThemePreference): void {
  themePreferenceSignal.value = preference
}

/**
 * Cycle to next preference: light -> dark -> system -> light
 */
export function cyclePreference(): void {
  themePreferenceSignal.value = getNextPreference(themePreferenceSignal.value)
}

/**
 * Update OS preference (called by matchMedia listener in ThemeProvider)
 */
export function setOsPrefersDark(prefersDark: boolean): void {
  osPrefersDarkSignal.value = prefersDark
}
