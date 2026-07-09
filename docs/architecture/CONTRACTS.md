# Architecture Contracts

**Version:** 3.1.0 **Date:** 2026-07-09 **Status:** Authoritative - Frontend Engineer implements
against this document

**CHANGE from v3.0.0:** Theme control changed from ThemeDropdown to ThemeModeButton (tri-state cycle
button: light/dark/system) per user requirement supersession #2. See ADR-0009 for rationale.

**BREAKING CHANGE from v2.0.0:** Navbar controls changed from cycle-on-click buttons to
icon-triggered dropdowns per user requirement correction. See ADR-0007 for rationale. **Exception:**
Theme control reverted to button (not dropdown) per ADR-0009.

This document consolidates all architectural contracts. Every interface, file path, and naming
convention defined here is binding.

---

## 1. Target `src/` Tree (Updated for Task 3: ThemeModeButton)

```
src/
  features/
    greeting/
      components/
        Greeting/
          Greeting.tsx
          Greeting.module.scss
          Greeting.spec.tsx
          interfaces.ts
          index.ts
      index.ts
    language-selector/              # DEPRECATED - replaced by navbar controls
      ...
    navbar/                         # Navbar feature with controls
      components/
        Navbar/
          Navbar.tsx
          Navbar.module.scss
          Navbar.spec.tsx
          interfaces.ts
          index.ts
        LanguageDropdown/           # REPLACES LanguageCycleButton
          LanguageDropdown.tsx
          LanguageDropdown.spec.tsx
          interfaces.ts
          index.ts
        ThemeModeButton/            # REPLACES ThemeDropdown (per ADR-0009)
          ThemeModeButton.tsx
          ThemeModeButton.module.scss
          ThemeModeButton.spec.tsx
          interfaces.ts
          index.ts
        CountryDropdown/            # REPLACES CountryCycleButton
          CountryDropdown.tsx
          CountryDropdown.spec.tsx
          interfaces.ts
          index.ts
        CurrencyDropdown/           # Currency selection
          CurrencyDropdown.tsx
          CurrencyDropdown.spec.tsx
          interfaces.ts
          index.ts
        # DELETED (superseded, do not keep as dead code):
        # - LanguageCycleButton/
        # - ThemeModeToggle/
        # - CountryCycleButton/
        # - ThemeDropdown/          # DELETED per ADR-0009
      signals/
        announcement-signal.ts
        announcement-signal.spec.ts
        index.ts
      index.ts
  i18n/
    ports/
      Translator.ts
    adapters/
      I18nProvider.tsx
    config/
      locales.ts
      index.ts
    signals/
      locale-signal.ts
      persistence.ts
      side-effects.ts
      translator.ts
      translator.spec.ts
    translations/
      en.ts
      es.ts
      index.ts
    hooks/
      useTranslation.ts
      useTranslation.spec.ts
    types/
      Locale.ts
      TranslationKeys.ts
      index.ts
    index.ts
  theme/
    ports/
      Theme.ts
    adapters/
      ThemeProvider.tsx
      localStorage.ts
    signals/
      theme-signal.ts
      side-effects.ts
    config/
      themes.ts
      index.ts
    hooks/
      useTheme.ts
      useTheme.spec.ts
    types/
      Theme.ts
      index.ts
    index.ts
  region/
    ports/
      Region.ts
    adapters/
      RegionProvider.tsx
      localStorage.ts
    signals/
      region-signal.ts
      side-effects.ts
    config/
      regions.ts
      index.ts
    hooks/
      useRegion.ts
      useRegion.spec.ts
    types/
      Region.ts
      index.ts
    index.ts
  currency/
    ports/
      Currency.ts
    adapters/
      CurrencyProvider.tsx
      localStorage.ts
    signals/
      currency-signal.ts
      side-effects.ts
    config/
      currencies.ts
      index.ts
    hooks/
      useCurrency.ts
      useCurrency.spec.ts
    types/
      Currency.ts
      index.ts
    index.ts
  shared/
    ds/
      settings/
        _tokens.scss
        _palette.scss
        _breakpoints.scss
        _z-index.scss
        _index.scss
      tools/
        _responsive.scss
        _typography.scss
        _accessibility.scss
        _animation.scss
        _index.scss
      generic/
        _reset.scss
        _index.scss
      elements/
        _typography.scss
        _forms.scss
        _index.scss
      objects/
        _container.scss
        _grid.scss
        _stack.scss
        _cluster.scss
        _index.scss
      components/
        _button.scss
        _icon-button.scss
        _link.scss
        _navbar.scss
        _dropdown.scss
        _index.scss
      utilities/
        _spacing.scss
        _visibility.scss
        _index.scss
      themes/
        _contract.scss
        _light.scss
        _dark.scss
        _index.scss
      _all.scss
    components/
      Button/
        Button.tsx
        Button.module.scss
        Button.spec.tsx
        interfaces.ts
        index.ts
      IconButton/
        IconButton.tsx
        IconButton.module.scss
        IconButton.spec.tsx
        interfaces.ts
        index.ts
      Link/
        Link.tsx
        Link.module.scss
        Link.spec.tsx
        interfaces.ts
        index.ts
      Dropdown/
        Dropdown.tsx
        DropdownTrigger.tsx
        DropdownPanel.tsx
        DropdownOption.tsx
        Dropdown.module.scss
        Dropdown.spec.tsx
        interfaces.ts
        index.ts
      Announcer/
        Announcer.tsx
        Announcer.module.scss
        Announcer.spec.tsx
        interfaces.ts
        index.ts
      App/
        App.tsx
        App.module.scss
        App.spec.tsx
        interfaces.ts
        index.ts
    test/
      test-utils.tsx
      integration/
        i18n-provider.integration.spec.tsx
        theme-provider.integration.spec.tsx
        region-provider.integration.spec.tsx
        currency-provider.integration.spec.tsx
        navbar-controls.integration.spec.tsx
        dropdown.integration.spec.tsx
      arch/
        architecture.spec.ts
        design-system.spec.ts
        mobile-first.spec.ts
      __mocks__/
        styleMock.ts
  assets/
  main.tsx
  main.scss

e2e/
  journeys/
    language-selection.spec.ts
    locale-persistence.spec.ts
    theme-toggle.spec.ts
    theme-persistence.spec.ts
    country-selection.spec.ts
    currency-selection.spec.ts
    navbar-keyboard-a11y.spec.ts
    navbar-dropdown-a11y.spec.ts
    accessibility.spec.ts
  playwright.config.ts
```

---

## 2. i18n Domain Contracts

### 2.1 Locale Types

**File:** `src/i18n/types/Locale.ts`

```typescript
export type SupportedLocale = 'en' | 'es'

export interface LocaleMetadata {
  readonly code: SupportedLocale
  readonly nativeName: string
  readonly englishName: string
  readonly direction: 'ltr' | 'rtl'
}
```

### 2.2 Translation Keys (Compile-Time Safe)

**File:** `src/i18n/types/TranslationKeys.ts`

```typescript
export interface TranslationDictionary {
  common: {
    appName: string
  }
  greeting: {
    hello: string
    welcome: string
    formattedDate: string
    formattedPrice: string
  }
  languageSelector: {
    label: string
    changeLanguage: string
  }
  navbar: {
    language: string
    theme: string
    country: string
    currency: string
    selectLanguage: string
    selectCountry: string
    selectCurrency: string
    currentLanguage: string
    currentCountry: string
    currentCurrency: string
    lightMode: string
    darkMode: string
    // NEW for ThemeModeButton (ADR-0009)
    themeModeLight: string
    themeModeDark: string
    themeModeSystem: string
  }
  currency: {
    usd: string
    eur: string
    gbp: string
    mxn: string
  }
  a11y: {
    languageSelectorDescription: string
    currentLanguage: string
    languageChangedTo: string
    themeChangedTo: string
    countryChangedTo: string
    currencyChangedTo: string
    skipToContent: string
  }
}

export type TranslationKey = FlattenKeys<TranslationDictionary>

type FlattenKeys<T, Prefix extends string = ''> = T extends object
  ? {
      [K in keyof T & string]: T[K] extends object
        ? FlattenKeys<T[K], `${Prefix}${K}.`>
        : `${Prefix}${K}`
    }[keyof T & string]
  : never
```

**Note (v3.1.0):** `navbar.selectTheme` and `navbar.currentTheme` are REMOVED (ThemeDropdown
deleted). New keys `navbar.themeModeLight`, `navbar.themeModeDark`, `navbar.themeModeSystem` added
for ThemeModeButton aria-label.

### 2.3 Translator Port

**File:** `src/i18n/ports/Translator.ts`

```typescript
import type { SupportedLocale } from '../types/Locale'
import type { TranslationKey } from '../types/TranslationKeys'

export interface Translator {
  t: (key: TranslationKey) => string
  locale: SupportedLocale
  setLocale: (locale: SupportedLocale) => void
  supportedLocales: readonly SupportedLocale[]
}
```

### 2.4 Locale Configuration

**File:** `src/i18n/config/locales.ts`

```typescript
import type { SupportedLocale, LocaleMetadata } from '../types/Locale'

export const LOCALE_STORAGE_KEY = 'app-locale' as const
export const DEFAULT_LOCALE: SupportedLocale = 'en'
export const SUPPORTED_LOCALES: readonly SupportedLocale[] = ['en', 'es'] as const

export const LOCALE_METADATA: Readonly<Record<SupportedLocale, LocaleMetadata>> = {
  en: { code: 'en', nativeName: 'English', englishName: 'English', direction: 'ltr' },
  es: { code: 'es', nativeName: 'Espanol', englishName: 'Spanish', direction: 'ltr' },
} as const

export function isSupportedLocale(value: string): value is SupportedLocale {
  return SUPPORTED_LOCALES.includes(value as SupportedLocale)
}
```

### 2.5 I18nProvider Adapter

**File:** `src/i18n/adapters/I18nProvider.tsx`

```typescript
export interface I18nProviderProps {
  children: ReactNode
  initialLocale?: SupportedLocale
}

export const I18nProvider: FC<I18nProviderProps>
export function useI18nContext(): Translator
```

**Responsibilities:**

- Resolve initial locale: persisted (localStorage) -> navigator.language -> DEFAULT_LOCALE
- Sync `<html lang>` attribute on locale change
- Persist locale to localStorage on change
- Provide context value implementing Translator port

### 2.6 useTranslation Hook

**File:** `src/i18n/hooks/useTranslation.ts`

```typescript
export function useTranslation(): Translator
```

### 2.7 Translation Dictionaries

**Files:** `src/i18n/translations/en.ts`, `src/i18n/translations/es.ts`

Each file exports a `TranslationDictionary` satisfying the interface exactly.

**Required translations for ThemeModeButton (v3.1.0):**

| Key                      | en           | es               |
| ------------------------ | ------------ | ---------------- |
| `navbar.themeModeLight`  | Light mode   | Modo claro       |
| `navbar.themeModeDark`   | Dark mode    | Modo oscuro      |
| `navbar.themeModeSystem` | System theme | Tema del sistema |

### 2.8 Domain Barrel Export

**File:** `src/i18n/index.ts`

```typescript
// Types
export type { Translator } from './ports/Translator'
export type { SupportedLocale, LocaleMetadata } from './types/Locale'
export type { TranslationDictionary, TranslationKey } from './types/TranslationKeys'

// Config
export {
  DEFAULT_LOCALE,
  SUPPORTED_LOCALES,
  LOCALE_STORAGE_KEY,
  LOCALE_METADATA,
  isSupportedLocale,
} from './config/locales'

// Adapter
export { I18nProvider } from './adapters/I18nProvider'
export type { I18nProviderProps } from './adapters/I18nProvider'

// Hook
export { useTranslation } from './hooks/useTranslation'
```

---

## 3. Theme Domain Contracts (UPDATED for v3.1.0 - Tri-State)

### 3.1 Theme Types

**File:** `src/theme/types/Theme.ts`

```typescript
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
```

### 3.2 Theme Port

**File:** `src/theme/ports/Theme.ts`

```typescript
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
```

### 3.3 Theme Configuration

**File:** `src/theme/config/themes.ts`

```typescript
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
```

### 3.4 Theme Signals

**File:** `src/theme/signals/theme-signal.ts`

```typescript
import { signal, computed } from '@preact/signals-react'
import type { ThemePreference, ThemeMode } from '../types/Theme'
import { DEFAULT_PREFERENCE, getNextPreference } from '../config/themes'

/** User's stored preference (what they chose) */
export const themePreferenceSignal = signal<ThemePreference>(DEFAULT_PREFERENCE)

/** Tracks OS prefers-color-scheme: dark in real-time */
export const osPrefersDarkSignal = signal<boolean>(
  typeof window !== 'undefined' ? window.matchMedia('(prefers-color-scheme: dark)').matches : false
)

/** Resolved effective mode (what data-theme gets) */
export const effectiveThemeSignal = computed<ThemeMode>(() => {
  const pref = themePreferenceSignal.value
  if (pref === 'light' || pref === 'dark') return pref
  // 'system' -> resolve from OS
  return osPrefersDarkSignal.value ? 'dark' : 'light'
})

/** Update the user's preference */
export function setPreference(preference: ThemePreference): void {
  themePreferenceSignal.value = preference
}

/** Cycle to next preference */
export function cyclePreference(): void {
  themePreferenceSignal.value = getNextPreference(themePreferenceSignal.value)
}

/** Update OS preference (called by matchMedia listener) */
export function setOsPrefersDark(prefersDark: boolean): void {
  osPrefersDarkSignal.value = prefersDark
}
```

### 3.5 ThemeProvider Adapter

**File:** `src/theme/adapters/ThemeProvider.tsx`

```typescript
export interface ThemeProviderProps {
  children: ReactNode
  initialPreference?: ThemePreference
}

export const ThemeProvider: FC<ThemeProviderProps>
```

**Responsibilities (v3.1.0):**

1. Initialize `themePreferenceSignal` from: props > localStorage > DOM > 'system' default.
2. Set up `matchMedia('prefers-color-scheme: dark')` listener to update `osPrefersDarkSignal` on OS
   change.
3. Use `useSignalEffect` to sync `effectiveThemeSignal.value` to `data-theme` attribute.
4. Persist `themePreferenceSignal.value` to localStorage on change.

**Live OS-following:** When preference is 'system', OS changes update `osPrefersDarkSignal`, which
triggers `effectiveThemeSignal` recomputation, which triggers `data-theme` update. No page reload
required.

### 3.6 useTheme Hook

**File:** `src/theme/hooks/useTheme.ts`

```typescript
export function useTheme(): ThemePort
```

### 3.7 Domain Barrel Export

**File:** `src/theme/index.ts`

```typescript
// Types
export type { ThemePort } from './ports/Theme'
export type { ThemePreference, ThemeMode, ThemeConfig } from './types/Theme'

// Config
export {
  DEFAULT_PREFERENCE,
  SUPPORTED_PREFERENCES,
  THEME_STORAGE_KEY,
  isValidPreference,
  isValidTheme,
  getNextPreference,
} from './config/themes'

// Adapter
export { ThemeProvider } from './adapters/ThemeProvider'
export type { ThemeProviderProps } from './adapters/ThemeProvider'

// Hook
export { useTheme } from './hooks/useTheme'
```

### 3.8 FOUC Prevention Script (index.html)

**Updated for tri-state:**

```html
<script>
  // FOUC prevention - runs synchronously before paint
  // Storage key must match THEME_STORAGE_KEY in src/theme/config/themes.ts
  ;(function () {
    var STORAGE_KEY = 'app-theme'
    var stored = null
    try {
      stored = localStorage.getItem(STORAGE_KEY)
    } catch (e) {}

    var theme
    if (stored === 'light' || stored === 'dark') {
      // Explicit user preference
      theme = stored
    } else {
      // 'system' or absent/invalid -> resolve from OS
      theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    }
    document.documentElement.setAttribute('data-theme', theme)
  })()
</script>
```

---

## 4. Region Domain Contracts

### 4.1 Region Types

**File:** `src/region/types/Region.ts`

```typescript
/**
 * Region codes for Intl date/number formatting.
 * Distinct from language: e.g., user may read English but want European date formats.
 */
export type SupportedRegion = 'US' | 'ES' | 'GB' | 'MX'

export interface RegionMetadata {
  readonly code: SupportedRegion
  readonly nativeName: string
  readonly englishName: string
  readonly dateLocale: string
  readonly numberLocale: string
  readonly defaultCurrency: string // Renamed from 'currency' for clarity
}
```

### 4.2 Region Port

**File:** `src/region/ports/Region.ts`

```typescript
import type { SupportedRegion } from '../types/Region'

export interface RegionPort {
  region: SupportedRegion
  setRegion: (region: SupportedRegion) => void
  supportedRegions: readonly SupportedRegion[]

  /** Format a date according to current region */
  formatDate: (date: Date, options?: Intl.DateTimeFormatOptions) => string

  /** Format a number according to current region */
  formatNumber: (value: number, options?: Intl.NumberFormatOptions) => string
}
```

**Note:** `formatCurrency` moved to Currency domain. `cycleRegion` removed (dropdowns replace
cycling).

### 4.3 Region Configuration

**File:** `src/region/config/regions.ts`

```typescript
import type { SupportedRegion, RegionMetadata } from '../types/Region'

export const REGION_STORAGE_KEY = 'app-region' as const
export const DEFAULT_REGION: SupportedRegion = 'US'
export const SUPPORTED_REGIONS: readonly SupportedRegion[] = ['US', 'ES', 'GB', 'MX'] as const

export const REGION_METADATA: Readonly<Record<SupportedRegion, RegionMetadata>> = {
  US: {
    code: 'US',
    nativeName: 'United States',
    englishName: 'United States',
    dateLocale: 'en-US',
    numberLocale: 'en-US',
    defaultCurrency: 'USD',
  },
  ES: {
    code: 'ES',
    nativeName: 'Espana',
    englishName: 'Spain',
    dateLocale: 'es-ES',
    numberLocale: 'es-ES',
    defaultCurrency: 'EUR',
  },
  GB: {
    code: 'GB',
    nativeName: 'United Kingdom',
    englishName: 'United Kingdom',
    dateLocale: 'en-GB',
    numberLocale: 'en-GB',
    defaultCurrency: 'GBP',
  },
  MX: {
    code: 'MX',
    nativeName: 'Mexico',
    englishName: 'Mexico',
    dateLocale: 'es-MX',
    numberLocale: 'es-MX',
    defaultCurrency: 'MXN',
  },
} as const

export function isValidRegion(value: string): value is SupportedRegion {
  return SUPPORTED_REGIONS.includes(value as SupportedRegion)
}
```

### 4.4 useRegion Hook

**File:** `src/region/hooks/useRegion.ts`

```typescript
export function useRegion(): RegionPort
```

### 4.5 Domain Barrel Export

**File:** `src/region/index.ts`

```typescript
export type { RegionPort } from './ports/Region'
export type { SupportedRegion, RegionMetadata } from './types/Region'
export {
  DEFAULT_REGION,
  SUPPORTED_REGIONS,
  REGION_STORAGE_KEY,
  REGION_METADATA,
  isValidRegion,
} from './config/regions'
export { RegionProvider } from './adapters/RegionProvider'
export type { RegionProviderProps } from './adapters/RegionProvider'
export { useRegion } from './hooks/useRegion'
```

---

## 5. Currency Domain Contracts

### 5.1 Currency Types

**File:** `src/currency/types/Currency.ts`

```typescript
export type SupportedCurrency = 'USD' | 'EUR' | 'GBP' | 'MXN'

export interface CurrencyMetadata {
  readonly code: SupportedCurrency
  readonly symbol: string // e.g., "$", "EUR", "GBP", "MX$"
  readonly name: string // e.g., "US Dollar"
  readonly localizedNameKey: string // Translation key, e.g., "currency.usd"
}
```

### 5.2 Currency Port

**File:** `src/currency/ports/Currency.ts`

```typescript
import type { SupportedCurrency } from '../types/Currency'

export interface CurrencyPort {
  currency: SupportedCurrency
  setCurrency: (currency: SupportedCurrency) => void
  supportedCurrencies: readonly SupportedCurrency[]
  isUserOverridden: boolean // True if user explicitly selected currency

  /** Format a value in the current currency */
  formatCurrency: (value: number) => string
}
```

### 5.3 Currency Configuration

**File:** `src/currency/config/currencies.ts`

```typescript
import type { SupportedCurrency, CurrencyMetadata } from '../types/Currency'

export const CURRENCY_STORAGE_KEY = 'app-currency' as const
export const SUPPORTED_CURRENCIES: readonly SupportedCurrency[] = [
  'USD',
  'EUR',
  'GBP',
  'MXN',
] as const

export const CURRENCY_METADATA: Readonly<Record<SupportedCurrency, CurrencyMetadata>> = {
  USD: {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar',
    localizedNameKey: 'currency.usd',
  },
  EUR: {
    code: 'EUR',
    symbol: 'EUR',
    name: 'Euro',
    localizedNameKey: 'currency.eur',
  },
  GBP: {
    code: 'GBP',
    symbol: 'GBP',
    name: 'British Pound',
    localizedNameKey: 'currency.gbp',
  },
  MXN: {
    code: 'MXN',
    symbol: 'MX$',
    name: 'Mexican Peso',
    localizedNameKey: 'currency.mxn',
  },
} as const

export function isValidCurrency(value: string): value is SupportedCurrency {
  return SUPPORTED_CURRENCIES.includes(value as SupportedCurrency)
}
```

### 5.4 Currency Precedence Rule

**CRITICAL:** Currency selection follows this precedence:

1. **User explicit selection** (persisted in localStorage under `app-currency`)
2. **Region default** (from `REGION_METADATA[region].defaultCurrency`)

**Behavior:**

- On first load with no persisted currency: use region's default currency.
- When user changes region AND has NOT explicitly selected a currency: currency updates to new
  region's default.
- When user changes region AND HAS explicitly selected a currency: currency stays unchanged.
- When user explicitly selects a currency via CurrencyDropdown: persist `app-currency` AND set
  `isUserOverridden = true`.
- Clear override: Provide a "Reset to region default" option (or changing region after clearing
  localStorage).

**Implementation signal structure:**

```typescript
// src/currency/signals/currency-signal.ts
export const currencySignal = signal<SupportedCurrency>('USD')
export const userOverriddenSignal = signal<boolean>(false)

export function setCurrency(currency: SupportedCurrency, isExplicit: boolean = true): void {
  currencySignal.value = currency
  if (isExplicit) {
    userOverriddenSignal.value = true
  }
}

export function syncCurrencyToRegion(region: SupportedRegion): void {
  if (!userOverriddenSignal.value) {
    currencySignal.value = REGION_METADATA[region].defaultCurrency as SupportedCurrency
  }
}
```

### 5.5 useCurrency Hook

**File:** `src/currency/hooks/useCurrency.ts`

```typescript
export function useCurrency(): CurrencyPort
```

### 5.6 Domain Barrel Export

**File:** `src/currency/index.ts`

```typescript
export type { CurrencyPort } from './ports/Currency'
export type { SupportedCurrency, CurrencyMetadata } from './types/Currency'
export {
  SUPPORTED_CURRENCIES,
  CURRENCY_STORAGE_KEY,
  CURRENCY_METADATA,
  isValidCurrency,
} from './config/currencies'
export { CurrencyProvider } from './adapters/CurrencyProvider'
export type { CurrencyProviderProps } from './adapters/CurrencyProvider'
export { useCurrency } from './hooks/useCurrency'
```

### 5.7 Integration with Greeting

**File:** `src/features/greeting/components/Greeting/Greeting.tsx`

Update to use `useCurrency().formatCurrency` instead of `useRegion().formatCurrency`:

```typescript
import { useCurrency } from '../../../../currency'
import { useRegion } from '../../../../region'

export const Greeting: FC<GreetingProps> = ({ dataTestId = 'greeting', className }) => {
  const { t } = useTranslation()
  const { formatDate } = useRegion()
  const { formatCurrency } = useCurrency() // Changed

  const formattedDate = formatDate(new Date())
  const formattedPrice = formatCurrency(1234.56)
  // ...
}
```

---

## 6. Shared Components Contracts

### 6.1 Button

**File:** `src/shared/components/Button/interfaces.ts`

```typescript
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  dataTestId?: string
}
```

**Behavior:**

- Renders semantic `<button>` element
- Applies design system tokens for all visual properties
- Supports disabled state with appropriate aria attributes
- Forwards ref

### 6.2 IconButton

**File:** `src/shared/components/IconButton/interfaces.ts`

```typescript
import type { IconType } from 'react-icons'

export interface IconButtonProps extends Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  'children'
> {
  icon: IconType
  'aria-label': string // Required for accessibility
  size?: 'sm' | 'md' | 'lg'
  variant?: 'primary' | 'secondary' | 'ghost'
  dataTestId?: string
}
```

**Behavior:**

- Renders icon-only button with mandatory aria-label
- Icon from react-icons (only allowed icon source per constitution)
- Applies focus ring from design system
- Minimum touch target 44x44px

### 6.3 Link

**File:** `src/shared/components/Link/interfaces.ts`

```typescript
export interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  variant?: 'default' | 'nav' | 'subtle'
  external?: boolean
  dataTestId?: string
}
```

**Behavior:**

- Renders semantic `<a>` element
- External links: adds `rel="noopener noreferrer"` and `target="_blank"`
- Uses design system tokens for colors, underline, hover states
- All links must be functional (constitution: nothing decorative)

### 6.4 Dropdown (Generic DS Component)

**File:** `src/shared/components/Dropdown/interfaces.ts`

```typescript
import type { IconType } from 'react-icons'
import type { ReactNode } from 'react'

/** Shape of each option in a dropdown */
export interface DropdownOption<T extends string = string> {
  value: T
  labelKey: string // Translation key
  icon: IconType // react-icons icon component
}

/** Props for the Dropdown container */
export interface DropdownProps<T extends string = string> {
  options: readonly DropdownOption<T>[]
  value: T
  onChange: (value: T) => void
  triggerIcon: IconType // Icon shown on closed trigger
  triggerLabel: string // Localized aria-label for trigger
  id: string // Base ID for ARIA relationships
  dataTestId?: string
  className?: string
}

/** Props for DropdownTrigger (internal) */
export interface DropdownTriggerProps {
  icon: IconType
  'aria-label': string
  'aria-expanded': boolean
  'aria-controls': string
  id: string
  onClick: () => void
  onKeyDown: (e: React.KeyboardEvent) => void
  ref: React.RefObject<HTMLButtonElement>
  dataTestId?: string
}

/** Props for DropdownPanel (internal) */
export interface DropdownPanelProps {
  id: string
  'aria-labelledby': string
  children: ReactNode
  isOpen: boolean
  onClose: () => void
  dataTestId?: string
}

/** Props for DropdownOption (internal) */
export interface DropdownOptionProps<T extends string = string> {
  option: DropdownOption<T>
  isSelected: boolean
  isFocused: boolean
  onClick: () => void
  onKeyDown: (e: React.KeyboardEvent) => void
  id: string
  tabIndex: number
  ref?: React.RefObject<HTMLDivElement>
  dataTestId?: string
}
```

**Dropdown.tsx Behavior:**

- Manages open/close state via internal signal or useState
- Handles keyboard navigation (see ADR-0007 keyboard contract)
- Handles click-outside to close
- Handles Escape to close and return focus to trigger
- Manages roving tabindex across options
- Announces selection via Announcer prop or callback

**Dropdown SCSS Contract:**

**File:** `src/shared/ds/components/_dropdown.scss`

```scss
.c-dropdown {
  position: relative;
  display: inline-block;

  &__trigger {
    // Uses IconButton styles via composition
  }

  &__panel {
    position: absolute;
    z-index: var(--z-dropdown, 100);
    min-width: 160px;
    max-width: 90vw;
    max-height: 70vh;
    overflow-y: auto;
    background: var(--color-surface-overlay);
    border: 1px solid var(--color-border-default);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-md);

    // Animation
    opacity: 0;
    transform: translateY(-8px);
    transition:
      opacity var(--transition-fast),
      transform var(--transition-fast);

    &--open {
      opacity: 1;
      transform: translateY(0);
    }

    @media (prefers-reduced-motion: reduce) {
      transition: none;
    }
  }

  &__option {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-3) var(--space-4);
    min-height: 48px;
    cursor: pointer;
    color: var(--color-text-primary);

    &:hover,
    &--focused {
      background: var(--color-interactive-secondary);
    }

    &--selected {
      background: var(--color-interactive-secondary-hover);
      font-weight: var(--font-weight-medium);
    }

    &:focus {
      outline: none;
    }

    &:focus-visible {
      @include focus-ring;
    }
  }

  &__icon {
    flex-shrink: 0;
    width: 20px;
    height: 20px;
  }

  &__label {
    flex: 1;
  }
}
```

### 6.5 Announcer

**File:** `src/shared/components/Announcer/interfaces.ts`

```typescript
export interface AnnouncerProps {
  message: string
  politeness?: 'polite' | 'assertive'
  dataTestId?: string
}
```

**Behavior:**

- Renders visually hidden `aria-live` region
- Updates message triggers screen reader announcement
- Used by dropdowns and ThemeModeButton to announce selection changes

### 6.6 App (Root Shell)

**File:** `src/shared/components/App/interfaces.ts`

```typescript
export interface AppProps {
  dataTestId?: string
}
```

**File:** `src/shared/components/App/App.tsx`

```typescript
export const App: FC<AppProps>
export default App
```

**Responsibilities (Updated for v3.1):**

- Wraps content in ThemeProvider (outermost)
- Wraps content in RegionProvider
- Wraps content in CurrencyProvider (after RegionProvider so it can react to region changes)
- Wraps content in I18nProvider (innermost)
- Renders Navbar at top (with 3 dropdowns + 1 button)
- Renders Greeting in main content area
- Layout container using design system objects

---

## 7. Navbar Control Contracts

See ADR-0007 for dropdown accessibility specification. See ADR-0009 for ThemeModeButton
specification.

### 7.1 LanguageDropdown

**File:** `src/features/navbar/components/LanguageDropdown/interfaces.ts`

```typescript
import type { SupportedLocale } from '../../../../i18n'

export interface LanguageDropdownProps {
  dataTestId?: string
  className?: string
  onLocaleChange?: (newLocale: SupportedLocale) => void
}
```

**Options (icon + labelKey):**

| Value | Icon         | Label Key                                           |
| ----- | ------------ | --------------------------------------------------- |
| `en`  | `MdLanguage` | LOCALE_METADATA.en.nativeName (hardcoded "English") |
| `es`  | `MdLanguage` | LOCALE_METADATA.es.nativeName (hardcoded "Espanol") |

**Note:** Icon is same for all languages (MdLanguage). Differentiation is via text.

### 7.2 ThemeModeButton (SUPERSEDES ThemeDropdown - ADR-0009)

**File:** `src/features/navbar/components/ThemeModeButton/interfaces.ts`

```typescript
import type { ThemePreference } from '../../../../theme'

export interface ThemeModeButtonProps {
  dataTestId?: string
  className?: string
  onPreferenceChange?: (newPreference: ThemePreference) => void
}
```

**Behavior:**

- Tri-state cycle button (NOT a dropdown)
- Cycle order: `light -> dark -> system -> light`
- Each press advances to the next preference
- Icon changes to reflect CURRENT preference

**Icons (icon per preference):**

| Preference | Icon                   | Export Verified |
| ---------- | ---------------------- | --------------- |
| `light`    | `MdLightMode`          | Yes             |
| `dark`     | `MdDarkMode`           | Yes             |
| `system`   | `MdSettingsBrightness` | Yes             |

**ARIA (plain button, no popup):**

| Attribute       | Value                                                 |
| --------------- | ----------------------------------------------------- |
| `role`          | Implicit `button` (semantic element)                  |
| `aria-haspopup` | **NOT PRESENT** (not a popup trigger)                 |
| `aria-expanded` | **NOT PRESENT** (not a popup trigger)                 |
| `aria-label`    | Dynamic, localized: e.g., "Light mode" / "Modo claro" |
| `aria-pressed`  | **NOT PRESENT** (3 states don't fit boolean toggle)   |

**aria-label key mapping:**

| Preference | Translation Key          |
| ---------- | ------------------------ |
| `light`    | `navbar.themeModeLight`  |
| `dark`     | `navbar.themeModeDark`   |
| `system`   | `navbar.themeModeSystem` |

**Keyboard:**

- Enter/Space: Cycle to next preference
- Tab: Standard focus navigation

**Announcer:**

On preference change, announce via `themeAnnouncementSignal`:

```
"{a11y.themeChangedTo} {navbar.themeMode<Preference>}"
```

Example: "Theme changed to System theme" / "Tema cambiado a Tema del sistema"

**Live OS-Following:**

When preference is 'system', changes to OS color scheme update the effective theme in real-time (no
reload). This is handled by the ThemeProvider's matchMedia listener.

### 7.3 CountryDropdown

**File:** `src/features/navbar/components/CountryDropdown/interfaces.ts`

```typescript
import type { SupportedRegion } from '../../../../region'

export interface CountryDropdownProps {
  dataTestId?: string
  className?: string
  onRegionChange?: (newRegion: SupportedRegion) => void
}
```

**Options (icon + labelKey):**

| Value | Icon       | Label (from REGION_METADATA) |
| ----- | ---------- | ---------------------------- |
| `US`  | `MdPublic` | "United States"              |
| `ES`  | `MdPublic` | "Spain" / "Espana"           |
| `GB`  | `MdPublic` | "United Kingdom"             |
| `MX`  | `MdPublic` | "Mexico"                     |

### 7.4 CurrencyDropdown

**File:** `src/features/navbar/components/CurrencyDropdown/interfaces.ts`

```typescript
import type { SupportedCurrency } from '../../../../currency'

export interface CurrencyDropdownProps {
  dataTestId?: string
  className?: string
  onCurrencyChange?: (newCurrency: SupportedCurrency) => void
}
```

**Options (icon + labelKey):**

| Value | Icon              | Label Key      |
| ----- | ----------------- | -------------- |
| `USD` | `MdAttachMoney`   | `currency.usd` |
| `EUR` | `MdEuroSymbol`    | `currency.eur` |
| `GBP` | `MdCurrencyPound` | `currency.gbp` |
| `MXN` | `MdAttachMoney`   | `currency.mxn` |

### 7.5 Trigger Icon Assignment Summary

| Control          | Control Type | Trigger Icon                                                    |
| ---------------- | ------------ | --------------------------------------------------------------- |
| LanguageDropdown | Dropdown     | `MdLanguage`                                                    |
| ThemeModeButton  | Button       | `MdLightMode` / `MdDarkMode` / `MdSettingsBrightness` (dynamic) |
| CountryDropdown  | Dropdown     | `MdPublic`                                                      |
| CurrencyDropdown | Dropdown     | `MdAttachMoney`                                                 |

---

## 8. Design System Layer Contracts

### 8.1 Token File Contract

**File:** `src/shared/ds/settings/_tokens.scss`

(No change from v2.0.0)

### 8.2 Theme Contract

**File:** `src/shared/ds/themes/_contract.scss`

(No change from v2.0.0)

### 8.3 Arch Test Rules for Design System

**File:** `src/shared/test/arch/design-system.spec.ts`

```typescript
describe('Design System Architecture Rules', () => {
  it('No hardcoded hex colors in component SCSS files')
  it('No hardcoded rgb/rgba/hsl colors in component SCSS files')
  it('Settings files produce no CSS output')
  it('Tools files produce no CSS output')
  it('No !important outside utilities layer')
  it('Component classes use c- prefix')
  it('Object classes use o- prefix')
  it('Utility classes use u- prefix')
})
```

### 8.4 Mobile-First Enforcement

**File:** `src/shared/test/arch/mobile-first.spec.ts`

```typescript
describe('Mobile-First Architecture Rules', () => {
  it('No @media (max-width anywhere in src/', async () => {
    // Scan all .scss files in src/
    // Fail if any contain @media (max-width
    // Only min-width media queries allowed (mobile-first)
  })

  it('Responsive mixins use only min-width', () => {
    // Verify tools/_responsive.scss contains only min-width mixins
  })

  it('Component base styles are mobile styles (no media query wrapping base)', () => {
    // Heuristic: base class selectors should not be inside @media blocks
  })
})
```

### 8.5 Functional Completeness Contract

**Requirement:** Every rendered interactive element must have a real handler or navigation.

**Arch test rule:**

```typescript
describe('Functional Completeness', () => {
  it('No buttons with empty onClick handlers', () => {
    // Scan tsx files for onClick={() => {}} or onClick={noop}
  })

  it('No links with href="#" or href=""', () => {
    // Scan tsx files for href="#" or href=""
  })

  it('No disabled-without-reason buttons', () => {
    // If a button is permanently disabled, it should not be rendered
    // This is a warning, not a fail
  })
})
```

---

## 9. Coverage & Quality Requirements

### 9.1 Jest Coverage Thresholds

```typescript
coverageThreshold: {
  global: {
    branches: 100,
    functions: 100,
    lines: 100,
    statements: 100,
  },
}
```

### 9.2 Files Excluded from Coverage

- `src/**/*.d.ts`
- `src/**/index.ts` (barrel exports)
- `src/main.tsx` (entry point)
- `src/vite-env.d.ts`

---

## 10. Acceptance Criteria for Task 3 (ThemeModeButton)

The Frontend Engineer's work is complete when:

### Must Pass (Machine-Verifiable)

- [ ] `pnpm exec tsc --noEmit` exits 0
- [ ] `pnpm test` exits 0 with 100% coverage
- [ ] `pnpm exec playwright test` exits 0
- [ ] No hardcoded hex/rgb/hsl values in `src/**/*.scss` (arch test)
- [ ] No `@media (max-width` in `src/**/*.scss` (mobile-first arch test)
- [ ] All e2e journeys pass (including updated theme tests)
- [ ] ThemeDropdown directory DELETED (no dead code)

### Functional

- [ ] ThemeModeButton cycles light -> dark -> system on click
- [ ] Icon changes per preference (MdLightMode, MdDarkMode, MdSettingsBrightness)
- [ ] ThemePreference ('light', 'dark', 'system') persists to localStorage
- [ ] System preference follows OS in real-time (no page reload)
- [ ] FOUC script resolves 'system' via matchMedia
- [ ] Default preference is 'system' (new users)
- [ ] Existing 'light'/'dark' values in localStorage still work (back-compat)

### Accessibility

- [ ] ThemeModeButton has NO aria-haspopup (not a popup)
- [ ] ThemeModeButton has dynamic aria-label reflecting current preference
- [ ] Screen reader announces preference change via aria-live
- [ ] Keyboard: Enter/Space cycles preference
- [ ] Touch target >= 44px

### Architecture

- [ ] ThemePreference type added ('light' | 'dark' | 'system')
- [ ] ThemeMode type remains ('light' | 'dark') for effective mode
- [ ] osPrefersDarkSignal tracks OS preference
- [ ] effectiveThemeSignal computes resolved mode
- [ ] ThemeProvider sets up matchMedia listener for live updates
- [ ] i18n keys added: navbar.themeModeLight, themeModeDark, themeModeSystem
- [ ] i18n keys removed: navbar.selectTheme, navbar.currentTheme

### E2E Updates

- [ ] theme-persistence.spec.ts rewritten for tri-state
- [ ] System mode e2e uses page.emulateMedia for live OS-following test
- [ ] dropdown-keyboard-navigation.spec.ts: theme cases REMOVED

---

## 11. References

- ADR-0001: Architecture Style
- ADR-0002: i18n Design
- ADR-0003: Language Selector
- ADR-0004: Testing and Quality
- ADR-0005: Design System Architecture
- ADR-0006: Theming Architecture
- ADR-0007: Navbar Dropdown Interaction Pattern
- ADR-0009: Theme Mode Button (Tri-State Cycle) **NEW**
- docs/PRD.md
- docs/REQUIREMENTS-CHECKLIST.md
