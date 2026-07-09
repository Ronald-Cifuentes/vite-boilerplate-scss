import { FC, ReactNode, useEffect } from 'react'
import { useSignalEffect } from '@preact/signals-react'
import {
  themePreferenceSignal,
  effectiveThemeSignal,
  setPreference,
  setOsPrefersDark,
} from '../signals/theme-signal'
import { syncDataTheme } from '../signals/side-effects'
import { persistPreference, loadPersistedPreference } from './localStorage'
import { isValidPreference, isValidTheme, DEFAULT_PREFERENCE } from '../config/themes'
import type { ThemePreference } from '../types/Theme'

export interface ThemeProviderProps {
  children: ReactNode
  initialPreference?: ThemePreference
}

/**
 * Boundary component that:
 *   1. Resets the singleton themePreferenceSignal on mount from: props > localStorage > DOM > default
 *   2. Sets up matchMedia listener to track OS color-scheme preference live
 *   3. Keeps the document data-theme attribute in sync with effectiveThemeSignal
 *   4. Persists preference changes to localStorage
 */
export const ThemeProvider: FC<ThemeProviderProps> = ({ children, initialPreference }) => {
  // Initialize preference on mount
  useSignalEffect(() => {
    if (initialPreference && isValidPreference(initialPreference)) {
      setPreference(initialPreference)
    } else {
      const persisted = loadPersistedPreference()
      if (persisted) {
        setPreference(persisted)
      } else {
        // Read from DOM (set by FOUC prevention script) to determine effective mode
        // but set preference to 'system' since user hasn't explicitly chosen
        const domTheme = document.documentElement.getAttribute('data-theme')
        if (domTheme && isValidTheme(domTheme)) {
          // FOUC script already set the correct effective theme, keep 'system' as preference
          setPreference(DEFAULT_PREFERENCE)
        } else {
          setPreference(DEFAULT_PREFERENCE)
        }
      }
    }
  })

  // Sync effectiveThemeSignal -> DOM + persist preference
  useSignalEffect(() => {
    syncDataTheme(effectiveThemeSignal.value)
  })

  // Persist preference changes to localStorage
  useSignalEffect(() => {
    persistPreference(themePreferenceSignal.value)
  })

  // Set up matchMedia listener for live OS-following when preference is 'system'
  useEffect(() => {
    /* istanbul ignore if -- @preserve SSR guard */
    if (typeof window === 'undefined') return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

    // Initialize OS preference
    setOsPrefersDark(mediaQuery.matches)

    const handleChange = (e: MediaQueryListEvent): void => {
      setOsPrefersDark(e.matches)
    }

    mediaQuery.addEventListener('change', handleChange)
    return (): void => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  return <>{children}</>
}

export default ThemeProvider
