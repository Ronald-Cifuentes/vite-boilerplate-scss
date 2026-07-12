export type { ThemePort } from './ports/Theme'
export type { ThemePreference, ThemeMode, ThemeConfig } from './types/Theme'

export {
  DEFAULT_PREFERENCE,
  SUPPORTED_PREFERENCES,
  THEME_STORAGE_KEY,
  THEME_CONFIG,
  PREFERENCE_ICONS,
  PREFERENCE_LABEL_KEYS,
  isValidPreference,
  isValidTheme,
  getNextPreference,
} from './config/themes'

export { ThemeProvider } from './adapters/ThemeProvider'
export type { ThemeProviderProps } from './adapters/ThemeProvider'

export { useTheme } from './hooks/useTheme'
