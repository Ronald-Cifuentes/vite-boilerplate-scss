import type { ThemePreference, ThemeMode } from '../types/Theme'

export interface ThemePort {
  /** User's stored preference ('light' | 'dark' | 'system') */
  preference: ThemePreference

  /** Resolved effective mode ('light' | 'dark') - what data-theme gets */
  effectiveMode: ThemeMode

  /** Cycle to next preference: light -> dark -> system -> light */
  cyclePreference: () => void

  /** Set specific preference */
  setPreference: (preference: ThemePreference) => void

  /** Check if current OS prefers dark mode */
  osPrefersDark: boolean
}
