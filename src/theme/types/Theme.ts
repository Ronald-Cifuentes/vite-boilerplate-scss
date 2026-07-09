/**
 * ThemePreference: the user's STORED choice.
 * - 'light' | 'dark': explicit user selection
 * - 'system': defer to OS prefers-color-scheme
 */
export type ThemePreference = 'light' | 'dark' | 'system'

/**
 * ThemeMode: the RESOLVED/EFFECTIVE theme applied to data-theme attribute.
 * Always 'light' or 'dark' (never 'system' - that resolves to one of these).
 */
export type ThemeMode = 'light' | 'dark'

export interface ThemeConfig {
  readonly defaultPreference: ThemePreference
  readonly storageKey: string
  readonly supportedPreferences: readonly ThemePreference[]
}
