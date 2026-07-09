import { useSignals } from '@preact/signals-react/runtime'
import type { ThemePort } from '../ports/Theme'
import type { ThemePreference, ThemeMode } from '../types/Theme'
import {
  themePreferenceSignal,
  effectiveThemeSignal,
  osPrefersDarkSignal,
  setPreference,
  cyclePreference,
} from '../signals/theme-signal'

export function useTheme(): ThemePort {
  useSignals()

  return {
    get preference(): ThemePreference {
      return themePreferenceSignal.value
    },
    get effectiveMode(): ThemeMode {
      return effectiveThemeSignal.value
    },
    cyclePreference,
    setPreference,
    get osPrefersDark(): boolean {
      return osPrefersDarkSignal.value
    },
  }
}
