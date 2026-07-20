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
import { isValidPreference, DEFAULT_PREFERENCE } from '../config/themes'
import type { ThemePreference } from '../types/Theme'

export interface ThemeProviderProps {
  children: ReactNode
  initialPreference?: ThemePreference
}

export const ThemeProvider: FC<ThemeProviderProps> = ({ children, initialPreference }) => {
  useSignalEffect(() => {
    if (initialPreference && isValidPreference(initialPreference)) {
      setPreference(initialPreference)
    } else {
      const p = loadPersistedPreference()
      setPreference(p ?? DEFAULT_PREFERENCE)
    }
  })

  useSignalEffect(() => {
    syncDataTheme(effectiveThemeSignal.value)
  })
  useSignalEffect(() => {
    persistPreference(themePreferenceSignal.value)
  })

  useEffect(() => {
    /* istanbul ignore if -- @preserve SSR guard */
    if (globalThis.window === undefined) return
    const mq = globalThis.window.matchMedia('(prefers-color-scheme: dark)')
    setOsPrefersDark(mq.matches)
    const h = (e: MediaQueryListEvent): void => {
      setOsPrefersDark(e.matches)
    }
    mq.addEventListener('change', h)
    return (): void => mq.removeEventListener('change', h)
  }, [])

  return <>{children}</>
}
