import type { ThemePreference } from '../../../../theme'

export interface ThemeModeButtonProps {
  dataTestId?: string
  className?: string
  onPreferenceChange?: (newPreference: ThemePreference) => void
}
