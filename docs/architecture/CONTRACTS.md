# Architecture Contracts

**Version:** 3.4.0 **Date:** 2026-07-10 (task 7) **Status:** Authoritative - Frontend Engineer
implements against this document

**CHANGE from v3.3.0 (Task 7 - PENDING HUMAN DECISIONS):** Responsive navbar with fullscreen mobile
menu replicating CodePen OJLMgYY. MobileMenu feature added at < 768px breakpoint. Fonts: Rubik Mono
One + Roboto Mono (self-hosted woff2, ~39 KB). See ADR-0012.

**CHANGE from v3.2.1 (Task 6 - PENDING HUMAN DECISIONS):** CJK locales (zh, ja) and regions (CN, JP)
with currencies (CNY, JPY). Exchange rates via BanRep SUAMECA series 28/33 (pending ratification).
Bundle strategy pending (lazy chunks or budget rev.6). See ADR-0011.

**CHANGE from v3.2.0:** Added Colombia (CO) to SUPPORTED_REGIONS with metadata { code: 'CO',
nativeName: 'Colombia', englishName: 'Colombia', dateLocale: 'es-CO', numberLocale: 'es-CO',
currency: 'COP' }. Additive change, no breaking impact.

**CHANGE from v3.1.0:** Currency conversion via BanRep SUAMECA + Banxico SIE (ADR-0010), COP added
to currencies, MXN via USD cross-rate, viewport-safe dropdown positioning, display format override
(en-US separators). Budget rev.4 approved (228KB/72KB).

**CHANGE from v3.0.0:** Theme control changed from ThemeDropdown to ThemeModeButton (tri-state cycle
button: light/dark/system) per user requirement supersession #2. See ADR-0009 for rationale.

**BREAKING CHANGE from v2.0.0:** Navbar controls changed from cycle-on-click buttons to
icon-triggered dropdowns per user requirement correction. See ADR-0007 for rationale. **Exception:**
Theme control reverted to button (not dropdown) per ADR-0009.

This document consolidates all architectural contracts. Every interface, file path, and naming
convention defined here is binding.

---

## 1. Target `src/` Tree (Updated for Task 4: Currency Conversion)

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
export type SupportedLocale = 'en' | 'es' | 'zh' | 'ja'

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
    cny: string
    jpy: string
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
export const SUPPORTED_LOCALES: readonly SupportedLocale[] = ['en', 'es', 'zh', 'ja'] as const

export const LOCALE_METADATA: Readonly<Record<SupportedLocale, LocaleMetadata>> = {
  en: { code: 'en', nativeName: 'English', englishName: 'English', direction: 'ltr' },
  es: { code: 'es', nativeName: 'Espanol', englishName: 'Spanish', direction: 'ltr' },
  zh: { code: 'zh', nativeName: '中文', englishName: 'Chinese', direction: 'ltr' },
  ja: { code: 'ja', nativeName: '日本語', englishName: 'Japanese', direction: 'ltr' },
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
export type SupportedRegion = 'US' | 'ES' | 'GB' | 'MX' | 'CO' | 'CN' | 'JP'

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
export const SUPPORTED_REGIONS: readonly SupportedRegion[] = [
  'US',
  'ES',
  'GB',
  'MX',
  'CO',
  'CN',
  'JP',
] as const

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
  CO: {
    code: 'CO',
    nativeName: 'Colombia',
    englishName: 'Colombia',
    dateLocale: 'es-CO',
    numberLocale: 'es-CO',
    defaultCurrency: 'COP',
  },
  CN: {
    code: 'CN',
    nativeName: '中国',
    englishName: 'China',
    dateLocale: 'zh-CN',
    numberLocale: 'zh-CN',
    defaultCurrency: 'CNY',
  },
  JP: {
    code: 'JP',
    nativeName: '日本',
    englishName: 'Japan',
    dateLocale: 'ja-JP',
    numberLocale: 'ja-JP',
    defaultCurrency: 'JPY',
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
export type SupportedCurrency = 'COP' | 'USD' | 'EUR' | 'GBP' | 'MXN' | 'CNY' | 'JPY'

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
  'COP', // Colombian Peso (base currency for conversion)
  'USD',
  'EUR',
  'GBP',
  'MXN',
] as const

export const CURRENCY_METADATA: Readonly<Record<SupportedCurrency, CurrencyMetadata>> = {
  COP: {
    code: 'COP',
    symbol: '$',
    name: 'Colombian Peso',
    localizedNameKey: 'currency.cop',
    decimals: 0,
  },
  USD: {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar',
    localizedNameKey: 'currency.usd',
    decimals: 2,
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
  CNY: {
    code: 'CNY',
    symbol: 'CN¥',
    name: 'Chinese Yuan',
    localizedNameKey: 'currency.cny',
    decimals: 2,
  },
  JPY: {
    code: 'JPY',
    symbol: '¥',
    name: 'Japanese Yen',
    localizedNameKey: 'currency.jpy',
    decimals: 0,
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

**Implementation Note (Task 8):** The actual implementation in `Dropdown.module.scss` uses
`display: none` for closed panels (not `opacity: 0` + `pointer-events: none`). This prevents closed
panels from contributing to layout overflow. Both open AND close use CSS `@keyframes` animations
(since `display: none` elements cannot transition). This approach:

1. **Prevents horizontal overflow** - closed panels are removed from layout entirely
2. **Maintains FE-005 click-through safety** - `display: none` elements cannot receive events;
   closing panels have `pointer-events: none` during the exit animation
3. **Preserves POS-RACE-1 flip measurement** - `useLayoutEffect` still measures synchronously when
   `isOpen` becomes true (React renders with `display: block` before paint)
4. **Respects `prefers-reduced-motion`** - animations disabled via `animation: none`

**Open animation:** `dropdownFadeIn` keyframes (opacity 0→1, translateY -8px→0). **Close animation
(UX-001):** `dropdownFadeOut` keyframes (reverse of open). The `isClosing` state keeps the panel
visible during the exit animation while `isOpen` immediately becomes false (for aria-expanded and
focus-return). A 200ms fallback timeout ensures the panel hides even if `animationend` doesn't fire
(e.g., reduced-motion disables animations).

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

### 7.6 MobileMenu (NEW - Task 7, ADR-0012)

**Feature Location:** `src/features/mobile-menu/`

```
src/features/mobile-menu/
  components/
    MobileMenu/
      MobileMenu.tsx
      MobileMenu.module.scss
      MobileMenu.spec.tsx
      interfaces.ts
      index.ts
    MobileMenuItem/
      MobileMenuItem.tsx
      MobileMenuItem.module.scss
      MobileMenuItem.spec.tsx
      interfaces.ts
      index.ts
    MobileMenuSubmenu/
      MobileMenuSubmenu.tsx
      MobileMenuSubmenu.module.scss
      MobileMenuSubmenu.spec.tsx
      interfaces.ts
      index.ts
    HamburgerButton/
      HamburgerButton.tsx
      HamburgerButton.module.scss
      HamburgerButton.spec.tsx
      interfaces.ts
      index.ts
  hooks/
    useFocusTrap.ts
    useFocusTrap.spec.ts
  index.ts
```

#### 7.6.1 Breakpoint Contract

| Viewport | Hamburger | Inline Controls | MobileMenu |
| -------- | --------- | --------------- | ---------- |
| < 768px  | Visible   | Hidden          | Available  |
| >= 768px | Hidden    | Visible         | N/A        |

**Token:** `$breakpoint-md: 768px` (existing in `src/shared/ds/settings/_breakpoints.scss`)

**Mobile-first enforcement:** Base styles = mobile (hamburger visible). Desktop styles via
`@include media-md`.

#### 7.6.2 HamburgerButton Contract

**File:** `src/features/mobile-menu/components/HamburgerButton/interfaces.ts`

```typescript
export interface HamburgerButtonProps {
  isOpen: boolean
  onClick: () => void
  dataTestId?: string
  className?: string
}
```

**ARIA:**

| Attribute       | Value                                                            |
| --------------- | ---------------------------------------------------------------- |
| `role`          | Implicit `button`                                                |
| `aria-expanded` | `{isOpen}`                                                       |
| `aria-controls` | `"mobile-menu"`                                                  |
| `aria-label`    | `t('mobileMenu.openMenu')` / `t('mobileMenu.closeMenu')` dynamic |

**Animation (per CodePen OJLMgYY):**

- Two horizontal bars (`::before`, `::after`)
- Open: `transform: rotate(1turn)` on wrapper, bars rotate to form X (45deg, -45deg)
- Timing: `--td: 150ms`, `--te: cubic-bezier(0.215, 0.61, 0.355, 1)`

**Test ID:** `app-navbar-hamburger`

#### 7.6.3 MobileMenu Contract

**File:** `src/features/mobile-menu/components/MobileMenu/interfaces.ts`

```typescript
export interface MobileMenuProps {
  isOpen: boolean
  onClose: () => void
  dataTestId?: string
}
```

**ARIA:**

| Attribute    | Value                       |
| ------------ | --------------------------- |
| `role`       | `dialog`                    |
| `aria-modal` | `true`                      |
| `aria-label` | `t('mobileMenu.menuLabel')` |
| `id`         | `"mobile-menu"`             |

**Focus Management:**

- On open: focus moves to first menu item
- On close: focus returns to hamburger button
- Tab cycle contained within menu (focus trap)
- Escape key closes menu

**Test ID:** `app-mobile-menu`

**Animation (per CodePen OJLMgYY):**

- Overlay: two half-height `::before`/`::after` bands
- Slide from `translateX(-110%)` to `translateX(0)`
- Stagger: top band immediate, bottom band `calc(var(--td) / 2)` delay
- Menu items: stagger entrance via nth-child delays

#### 7.6.4 MobileMenuItem Contract

**File:** `src/features/mobile-menu/components/MobileMenuItem/interfaces.ts`

```typescript
export interface MobileMenuItemProps {
  labelKey: string // Translation key for item label
  icon?: IconType // Optional icon
  onClick?: () => void // For immediate action (e.g., theme cycle)
  hasSubmenu?: boolean // Whether item expands
  isExpanded?: boolean // If hasSubmenu, current state
  onToggleSubmenu?: () => void
  dataTestId?: string
}
```

**Menu Items:**

| Item     | labelKey              | Behavior                                |
| -------- | --------------------- | --------------------------------------- |
| Language | `mobileMenu.language` | Expands submenu with locale options     |
| Country  | `mobileMenu.country`  | Expands submenu with region options     |
| Currency | `mobileMenu.currency` | Expands submenu with currency options   |
| Theme    | `mobileMenu.theme`    | Cycles preference on click (no submenu) |

**Styling (per CodePen OJLMgYY):**

- Font: Rubik Mono One at `10vmin`
- Sibling pull: `--pull: 30%` translateY on hover
- Sibling dim: `opacity: 0.25` on non-hovered

**Test IDs:** `app-mobile-menu-item-language`, `app-mobile-menu-item-country`,
`app-mobile-menu-item-currency`, `app-mobile-menu-item-theme`

#### 7.6.5 MobileMenuSubmenu Contract

**File:** `src/features/mobile-menu/components/MobileMenuSubmenu/interfaces.ts`

```typescript
export interface MobileMenuSubmenuProps<T extends string> {
  options: readonly { value: T; label: string; icon?: IconType }[]
  selectedValue: T
  onSelect: (value: T) => void
  isVisible: boolean
  dataTestId?: string
}
```

**Options source:**

- Language: `LOCALE_METADATA` (nativeName)
- Country: `REGION_METADATA` (nativeName)
- Currency: `CURRENCY_METADATA` (localizedName via `t()`)

**Styling (per CodePen OJLMgYY):**

- Font: Roboto Mono at `3.5vmin`
- Light-band hover effect on options
- Blink caret animation

**Selection behavior:** Selection closes submenu, menu stays open.

#### 7.6.6 Font Tokens (NEW)

**File:** `src/shared/ds/settings/_tokens.scss` (additions)

```scss
// Mobile menu fonts (CodePen OJLMgYY fidelity)
--font-family-mobile-menu-heading:
  'Rubik Mono One', 'Noto Sans SC', 'Noto Sans JP', ui-monospace, monospace;
--font-family-mobile-menu-body:
  'Roboto Mono', 'Noto Sans SC', 'Noto Sans JP', ui-monospace, monospace;
```

**Font files (self-hosted, OFL license):**

| File           | Path                                      |  Size |
| -------------- | ----------------------------------------- | ----: |
| Rubik Mono One | `public/fonts/rubik-mono-one-latin.woff2` |  7 KB |
| Roboto Mono    | `public/fonts/roboto-mono-latin.woff2`    | 33 KB |

**Preload (index.html):**

```html
<link
  rel="preload"
  href="/fonts/rubik-mono-one-latin.woff2"
  as="font"
  type="font/woff2"
  crossorigin
/>
<link rel="preload" href="/fonts/roboto-mono-latin.woff2" as="font" type="font/woff2" crossorigin />
```

**CJK Fallback:** Rubik Mono One has no CJK coverage. Chinese/Japanese labels render in fallback
fonts (Noto Sans SC/JP or system).

#### 7.6.7 Color Tokens (NEW)

**File:** `src/shared/ds/themes/_contract.scss` (additions)

```scss
// Mobile menu colors (theme-aware mapping of CodePen OJLMgYY palette)
--color-mobile-menu-overlay: #18181a; // Band overlay (works both themes)
--color-mobile-menu-text: var(--color-text-primary);
--color-mobile-menu-secondary: #75757c;
--color-mobile-menu-highlight: #f5f5f5;
```

#### 7.6.8 Animation Tokens (NEW)

**File:** `src/shared/ds/settings/_tokens.scss` (additions)

```scss
// Mobile menu timing (CodePen OJLMgYY fidelity)
--mobile-menu-td: 150ms;
--mobile-menu-te: cubic-bezier(0.215, 0.61, 0.355, 1);
```

#### 7.6.9 Accessibility Contract

| Requirement     | Implementation                                                 |
| --------------- | -------------------------------------------------------------- |
| Semantic toggle | `<button>` with aria-expanded, aria-controls                   |
| Focus on open   | First menu item receives focus                                 |
| Focus on close  | Hamburger button receives focus                                |
| Escape closes   | KeyboardEvent handler                                          |
| Tab containment | useFocusTrap hook                                              |
| Touch submenus  | Tap/focus triggers in addition to hover                        |
| Reduced motion  | `prefers-reduced-motion: reduce` disables/shortens transitions |

#### 7.6.10 i18n Keys (NEW)

| Key                    | en         | es          | zh       | ja               |
| ---------------------- | ---------- | ----------- | -------- | ---------------- |
| `mobileMenu.openMenu`  | Open menu  | Abrir menu  | 打开菜单 | メニューを開く   |
| `mobileMenu.closeMenu` | Close menu | Cerrar menu | 关闭菜单 | メニューを閉じる |
| `mobileMenu.language`  | Language   | Idioma      | 语言     | 言語             |
| `mobileMenu.country`   | Country    | Pais        | 国家     | 国               |
| `mobileMenu.currency`  | Currency   | Moneda      | 货币     | 通貨             |
| `mobileMenu.theme`     | Theme      | Tema        | 主题     | テーマ           |

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

## 10. Acceptance Criteria for Task 4 (Currency Conversion & Positioning)

The Frontend Engineer's work is complete when ALL Task 3 criteria remain met PLUS:

### Must Pass (Machine-Verifiable)

- [ ] `pnpm exec tsc --noEmit` exits 0
- [ ] `pnpm test` exits 0 with 100% coverage
- [ ] `pnpm exec playwright test` exits 0 (including new conversion + positioning tests)
- [ ] Bundle size under budget (pending rev.4 approval if needed)

### Currency Conversion (FX-xxx)

- [ ] FX-001: BanRep adapter fetches rates from SUAMECA (idSerie 1/30/31)
- [ ] FX-002: Rates cached in localStorage with 24h staleness bound
- [ ] FX-003: UI states: loading / live / stale (with age) / unavailable
- [ ] FX-004: Conversion math in major units (COP / copPerUnit = foreign)
- [ ] FX-005: Half-up rounding to currency decimals (COP=0, others=2)
- [ ] FX-006: Display format: {symbol}{amount} {ISO} (e.g., "$4,500 COP")
- [ ] FX-007: Separators: comma for thousands, period for decimals (override locale)
- [ ] FX-008: Base price 4500 COP in config (not hardcoded in Greeting)
- [ ] FX-009: COP identity conversion (4500 COP -> 4500 COP)
- [ ] FX-010: Graceful degradation when rates unavailable (show COP)
- [ ] FX-011: AbortController timeout 8000ms on fetch
- [ ] FX-012: Fail-closed: reject rate if unidad field malformed

### COP in Selector (COP-xxx)

- [ ] COP-001: COP added to SupportedCurrency type
- [ ] COP-002: COP in SUPPORTED_CURRENCIES array (first position)
- [ ] COP-003: COP metadata: symbol=$, decimals=0, localizedNameKey=currency.cop
- [ ] COP-004: COP icon: MdAttachMoney
- [ ] COP-005: i18n keys: currency.cop (en: "Colombian Peso", es: "Peso Colombiano")

### Dropdown Positioning (POS-xxx)

- [ ] POS-001: Panel flips above trigger when insufficient space below
- [ ] POS-002: Panel right-aligns when left edge would overflow viewport
- [ ] POS-003: Measurement on open + window resize (debounced)
- [ ] POS-004: Hard clamp: max-width: calc(100vw - 16px)
- [ ] POS-005: 8px gutter maintained on all edges
- [ ] POS-006: SSR-safe (calculation in useEffect)
- [ ] POS-007: No new dependencies (no floating-ui)

### Responsive (RESP-xxx)

- [ ] RESP-001: All dropdowns work at 375px viewport
- [ ] RESP-002: All dropdowns work at 768px viewport
- [ ] RESP-003: All dropdowns work at 1440px viewport
- [ ] RESP-004: Trigger near right edge -> panel stays in viewport

### E2E Tests (E2E-xxx)

- [ ] E2E-001: Mock rates via page.route for deterministic tests
- [ ] E2E-002: Test with user's example rates (verify exact numbers)
- [ ] E2E-003: Test rates unavailable -> shows COP fallback
- [ ] E2E-004: Test stale rates -> shows age indicator
- [ ] E2E-005: Positioning test at 375px with trigger near right edge
- [ ] E2E-006: Positioning test vertical flip near bottom

---

## 11. Exchange Rates Domain Contracts (NEW - v3.2.0)

### 11.1 Domain Structure

**Location:** `src/exchange-rates/` (sibling to `src/currency/`)

```
src/exchange-rates/
  ports/
    ExchangeRates.ts
  adapters/
    BanrepRatesAdapter.ts
  signals/
    rates-signal.ts
  config/
    series.ts
    prices.ts
  types/
    Rate.ts
  hooks/
    useExchangeRates.ts
  index.ts
```

### 11.2 Rate Types

**File:** `src/exchange-rates/types/Rate.ts`

```typescript
export type RateStatus = 'loading' | 'live' | 'stale' | 'unavailable' | 'partial'

export interface RateSnapshot {
  copPerUnit: number // COP per 1 foreign unit
  sourceDate: Date // When BanRep published it
  retrievedAt: Date // When we fetched it
}

export interface RatesState {
  status: RateStatus
  rates: Partial<Record<SupportedCurrency, RateSnapshot>>
  staleAgeMs?: number // If stale, how old
  unavailableCurrencies?: SupportedCurrency[] // If partial, which failed
  error?: string // If unavailable, why
}
```

### 11.3 Exchange Rates Port

**File:** `src/exchange-rates/ports/ExchangeRates.ts`

```typescript
export interface ExchangeRatesPort {
  state: RatesState
  refresh: () => Promise<void>
  convert: (amountCop: number, toCurrency: SupportedCurrency) => number | null
  getLastRefresh: () => Date | null
}
```

### 11.4 Series Configuration

**File:** `src/exchange-rates/config/series.ts`

```typescript
export const BANREP_SERIES: Record<'USD' | 'EUR' | 'GBP' | 'CNY' | 'JPY', number> = {
  USD: 1, // TRM (Tasa Representativa del Mercado)
  EUR: 30, // COP/EUR reserve rate
  GBP: 31, // COP/GBP reserve rate
  CNY: 28, // COP/CNY reserve rate (ADR-0011)
  JPY: 33, // COP/JPY reserve rate (ADR-0011)
}

// MXN via Banxico cross-rate (see ADR-0010 Section 4)
export const BANXICO_SERIES = 'SF43718' // Tipo de cambio FIX (MXN/USD)
export const BANXICO_BASE_URL =
  'https://www.banxico.org.mx/SieAPIRest/service/v1/series/SF43718/datos/oportuno'
// Token via VITE_BANXICO_TOKEN env var (never committed)

export const SUAMECA_BASE_URL =
  'https://suameca.banrep.gov.co/estadisticas-economicas-back/rest/estadisticaEconomicaRestService/consultaInformacionSerie'

export const RATES_STORAGE_KEY = 'app-exchange-rates'
export const STALENESS_BOUND_MS = 24 * 60 * 60 * 1000 // 24 hours
export const FETCH_TIMEOUT_MS = 8000
```

### 11.5 Price Configuration

**File:** `src/exchange-rates/config/prices.ts`

```typescript
export const BASE_PRICE_COP = 4500 as const
```

### 11.6 Display Format Contract

**Requirement:** User specified "$4,500 COP = $1.37 USD = $1.20 EUR = $23.94 MXN = $1.02 GBP"

**Format:** `{symbol}{amount} {ISO}`

| Currency | Symbol | Decimals | Example      |
| -------- | ------ | -------- | ------------ |
| COP      | $      | 0        | $4,500 COP   |
| USD      | $      | 2        | $1.37 USD    |
| EUR      | EUR    | 2        | EUR1.20 EUR  |
| GBP      | GBP    | 2        | GBP1.02 GBP  |
| MXN      | MX$    | 2        | MX$23.94 MXN |
| CNY      | CN¥    | 2        | CN¥9.23 CNY  |
| JPY      | ¥      | 0        | ¥220 JPY     |

**Separators (OVERRIDE locale):**

- Thousands: `,` (comma)
- Decimals: `.` (period)

### 11.7 Conversion Math

```typescript
function convertCopTo(amountCop: number, toCurrency: SupportedCurrency): number | null {
  if (toCurrency === 'COP') return amountCop
  const rate = rates[toCurrency]
  if (!rate) return null
  const foreign = amountCop / rate.copPerUnit
  const decimals = CURRENCY_DECIMALS[toCurrency]
  return Math.round(foreign * 10 ** decimals) / 10 ** decimals
}
```

### 11.8 i18n Keys (NEW)

| Key                 | en                | es                   |
| ------------------- | ----------------- | -------------------- |
| `currency.cop`      | Colombian Peso    | Peso Colombiano      |
| `rates.loading`     | Loading rates...  | Cargando tasas...    |
| `rates.stale`       | Rates from {age}  | Tasas de hace {age}  |
| `rates.ago`         | ago               | atras                |
| `rates.unavailable` | Rates unavailable | Tasas no disponibles |
| `currency.cny`      | Chinese Yuan      | Yuan Chino           |
| `currency.jpy`      | Japanese Yen      | Yen Japones          |

---

## 11.9 Task 3 Acceptance Criteria (Preserved)

The following Task 3 criteria MUST remain passing:

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

## 13. Task 6 Acceptance Criteria (CJK Locales + CNY/JPY Rates)

**STATUS:** Pending (awaiting human decisions on rate sources and bundle strategy)

The Frontend Engineer's work is complete when ALL prior criteria remain met PLUS:

### Must Pass (Machine-Verifiable)

- [ ] `pnpm exec tsc --noEmit` exits 0
- [ ] `pnpm test` exits 0 with 100% coverage
- [ ] `pnpm exec playwright test` exits 0
- [ ] Bundle size within ratified budget (rev.5 or rev.6 per human decision)

### Locale Expansion (LOC-xxx)

- [ ] LOC-001: SupportedLocale type extended: 'en' | 'es' | 'zh' | 'ja'
- [ ] LOC-002: SUPPORTED_LOCALES order: ['en', 'es', 'zh', 'ja'] (append only)
- [ ] LOC-003: LOCALE_METADATA zh: { nativeName: '中文', englishName: 'Chinese' }
- [ ] LOC-004: LOCALE_METADATA ja: { nativeName: '日本語', englishName: 'Japanese' }
- [ ] LOC-005: zh.ts translation file with all keys (TranslationKeys enforced)
- [ ] LOC-006: ja.ts translation file with all keys (TranslationKeys enforced)
- [ ] LOC-007: isSupportedLocale validates 'zh' and 'ja' as true
- [ ] LOC-008: Language dropdown shows 4 options
- [ ] LOC-009: html[lang] updates to 'zh' or 'ja' on selection

### Region Expansion (REG-xxx)

- [ ] REG-001: SupportedRegion type extended: + 'CN' | 'JP'
- [ ] REG-002: SUPPORTED_REGIONS order: [..., 'CN', 'JP'] (append only)
- [ ] REG-003: REGION_METADATA CN: { nativeName: '中国', dateLocale: 'zh-CN', currency: 'CNY' }
- [ ] REG-004: REGION_METADATA JP: { nativeName: '日本', dateLocale: 'ja-JP', currency: 'JPY' }
- [ ] REG-005: isValidRegion validates 'CN' and 'JP' as true
- [ ] REG-006: Country dropdown shows 7 options
- [ ] REG-007: syncCurrencyToRegion: CN -> CNY, JP -> JPY

### Currency Expansion (CUR-xxx)

- [ ] CUR-001: SupportedCurrency type extended: + 'CNY' | 'JPY'
- [ ] CUR-002: SUPPORTED_CURRENCIES order: [..., 'CNY', 'JPY'] (append only)
- [ ] CUR-003: CURRENCY_METADATA CNY: { symbol: 'CN¥', decimals: 2 }
- [ ] CUR-004: CURRENCY_METADATA JPY: { symbol: '¥', decimals: 0 }
- [ ] CUR-005: formatAmount handles JPY 0-decimals correctly
- [ ] CUR-006: isValidCurrency validates 'CNY' and 'JPY' as true
- [ ] CUR-007: Currency dropdown shows 7 options

### Exchange Rate Sources (RATE-xxx) [PENDING HUMAN RATIFICATION]

- [ ] RATE-001: BANREP_SERIES extended: CNY: 28, JPY: 33
- [ ] RATE-002: CNY rate fetched from SUAMECA series 28 with unidad='COP/CNY' assertion
- [ ] RATE-003: JPY rate fetched from SUAMECA series 33 with unidad='COP/JPY' assertion
- [ ] RATE-004: Fail-closed validation for CNY/JPY
- [ ] RATE-005: 24h staleness bound applies to CNY/JPY
- [ ] RATE-006: Partial availability: CNY/JPY failures isolated

### Translation Keys (TRANS-xxx)

- [ ] TRANS-001: TranslationDictionary.currency extended: + cny, jpy
- [ ] TRANS-002: en.ts has currency.cny/jpy
- [ ] TRANS-003: es.ts has currency.cny/jpy
- [ ] TRANS-004: zh.ts has currency.cny/jpy
- [ ] TRANS-005: ja.ts has currency.cny/jpy
- [ ] TRANS-006: All 4 locale files pass TranslationKeys type check

### Keyboard Navigation (KBD-xxx)

- [ ] KBD-001: Language dropdown End->ja, wrap ja->en
- [ ] KBD-002: Country dropdown End->JP, wrap JP->US
- [ ] KBD-003: Currency dropdown End->JPY, wrap JPY->COP

### E2E Tests (E2E-xxx)

- [ ] E2E-001: zh locale selection renders Chinese UI
- [ ] E2E-002: ja locale selection renders Japanese UI
- [ ] E2E-003: CN region triggers CNY sync
- [ ] E2E-004: JP region triggers JPY sync
- [ ] E2E-005: CNY displays CN¥X.XX CNY format
- [ ] E2E-006: JPY displays ¥XXX JPY format (0 decimals)
- [ ] E2E-007: Keyboard e2e updated for 4/7/7 counts

### Provenance (PROV-xxx)

- [ ] PROV-001: zh.ts flagged machine-authored
- [ ] PROV-002: ja.ts flagged machine-authored
- [ ] PROV-003: Native speaker review required before production

---

## 15. Acceptance Criteria for Task 7 (Responsive Navbar - PENDING HUMAN DECISIONS)

The Frontend Engineer's work is complete when ALL prior criteria remain met PLUS:

### Must Pass (Machine-Verifiable)

- [ ] `pnpm exec tsc --noEmit` exits 0
- [ ] `pnpm test` exits 0 with 100% coverage
- [ ] `pnpm exec playwright test` exits 0
- [ ] Bundle size within ratified budget (rev.7 pending approval)

### Mobile Menu Feature (MM-xxx)

- [ ] MM-001: MobileMenu feature created at `src/features/mobile-menu/`
- [ ] MM-002: HamburgerButton visible at < 768px, hidden at >= 768px
- [ ] MM-003: Inline controls hidden at < 768px, visible at >= 768px
- [ ] MM-004: Menu opens on hamburger click with fullscreen overlay
- [ ] MM-005: Menu closes on Escape key
- [ ] MM-006: Focus moves to first menu item on open
- [ ] MM-007: Focus returns to hamburger on close
- [ ] MM-008: Tab cycle contained within open menu (focus trap)
- [ ] MM-009: 4 menu items: Language, Country, Currency, Theme

### Visual Fidelity (VF-xxx) per CodePen OJLMgYY

- [ ] VF-001: Band-slide overlay (two half-height bands from left)
- [ ] VF-002: Stagger timing: --td 150ms, --te cubic-bezier(0.215, 0.61, 0.355, 1)
- [ ] VF-003: Hamburger 2-bar to X with 1turn spin
- [ ] VF-004: Top-level items in Rubik Mono One at 10vmin
- [ ] VF-005: Submenu items in Roboto Mono at 3.5vmin
- [ ] VF-006: Sibling pull (--pull: 30%) on hover
- [ ] VF-007: Sibling dim (opacity: 0.25) on hover
- [ ] VF-008: Light-band slide on link hover
- [ ] VF-009: Blink caret animation

### Fonts (FONT-xxx)

- [ ] FONT-001: Rubik Mono One woff2 committed at public/fonts/
- [ ] FONT-002: Roboto Mono woff2 committed at public/fonts/
- [ ] FONT-003: OFL license file committed alongside fonts
- [ ] FONT-004: @font-face declarations with font-display: swap
- [ ] FONT-005: Preload links in index.html
- [ ] FONT-006: Total font transfer <= 45 KB

### Accessibility Deviations (A11Y-xxx)

- [ ] A11Y-001: Real button toggle (not checkbox hack)
- [ ] A11Y-002: aria-expanded on hamburger
- [ ] A11Y-003: aria-controls pointing to menu
- [ ] A11Y-004: Touch-usable submenus (tap/focus, not hover-only)
- [ ] A11Y-005: prefers-reduced-motion: reduce disables/shortens transitions

### E2E Adaptation (E2E7-xxx)

- [ ] E2E7-001: openMobileMenuIfNeeded helper created
- [ ] E2E7-002: 375px viewport tests adapted to use menu
- [ ] E2E7-003: Desktop (1280x720) tests unchanged
- [ ] E2E7-004: New mobile menu journey tests added
- [ ] E2E7-005: All existing e2e tests pass (no_desktop_regression)

### i18n (I18N7-xxx)

- [ ] I18N7-001: mobileMenu.openMenu key in all 4 locales
- [ ] I18N7-002: mobileMenu.closeMenu key in all 4 locales
- [ ] I18N7-003: mobileMenu.language/country/currency/theme keys in all 4 locales

### Quality (QUALITY7-xxx)

- [ ] QUALITY7-001: No @media (max-width in SCSS (mobile-first)
- [ ] QUALITY7-002: No hardcoded colors in mobile-menu SCSS
- [ ] QUALITY7-003: No new npm dependencies
- [ ] QUALITY7-004: Hand-rolled focus trap (no focus-trap library)

## 16. References

- ADR-0001: Architecture Style
- ADR-0002: i18n Design
- ADR-0003: Language Selector
- ADR-0004: Testing and Quality
- ADR-0005: Design System Architecture
- ADR-0006: Theming Architecture
- ADR-0007: Navbar Dropdown Interaction Pattern
- ADR-0009: Theme Mode Button (Tri-State Cycle)
- ADR-0010: Currency Conversion and Positioning **NEW**
- ADR-0011: CJK Locales and CNY/JPY Rates **NEW (pending human decisions)**
- ADR-0012: Responsive Navbar with Fullscreen Mobile Menu **NEW (ratified: self-host fonts + budget
  rev.7, owner 2026-07-10)**
- docs/PRD.md
- docs/REQUIREMENTS-CHECKLIST.md

---

## 17. Task 9 Contracts (NEW - v3.5.0)

### 17.1 Theme-Aware Mobile Menu Color Tokens (ADR-0012 Amendment 1)

**SUPERSEDES Section 7.6.7.** The pen palette is now the DARK theme only. Light theme gets coherent
equivalents.

**Dark Theme (\_dark.scss):**

```scss
--color-mobile-menu-overlay: #18181a;
--color-mobile-menu-text: #{p.$palette-gray-200};
--color-mobile-menu-secondary: #75757c;
--color-mobile-menu-highlight: #f5f5f5;
```

**Light Theme (\_light.scss):**

```scss
--color-mobile-menu-overlay: #{p.$palette-gray-50};
--color-mobile-menu-text: #{p.$palette-gray-900};
--color-mobile-menu-secondary: #{p.$palette-gray-500};
--color-mobile-menu-highlight: #18181a;
```

**Hamburger/X Bar Contrast Contract:**

| State                | Light Theme Bars                | Dark Theme Bars                 |
| -------------------- | ------------------------------- | ------------------------------- |
| Closed (over navbar) | `--color-text-primary`          | `--color-text-primary`          |
| Open (over overlay)  | `--color-mobile-menu-highlight` | `--color-mobile-menu-highlight` |

**Test IDs for contrast verification:**

- `app-navbar-hamburger` (button)
- Bars are `::before`/`::after` of `.bars` span

### 17.2 Menu Scroll Contract (ADR-0012 Amendment 2)

**Requirements:**

| ID         | Requirement                                   | Implementation                           |
| ---------- | --------------------------------------------- | ---------------------------------------- |
| SCROLL-001 | Overlay scrolls when content exceeds viewport | `overflow-y: auto` on `.menu`            |
| SCROLL-002 | All items reachable at landscape 667x375      | E2E test with Tab navigation             |
| SCROLL-003 | All items reachable at 320px class heights    | E2E test with Tab navigation             |
| SCROLL-004 | Scrollbar styled consistent with DS           | `-webkit-scrollbar` rules with DS tokens |
| SCROLL-005 | Focus-visible items scrolled into view        | `scrollIntoView({ block: 'nearest' })`   |

### 17.3 Menu Close on Breakpoint Cross Contract (ADR-0012 Amendment 2)

**Requirements:**

| ID        | Requirement                                        | Implementation                                     |
| --------- | -------------------------------------------------- | -------------------------------------------------- |
| CROSS-001 | Viewport crossing 768px with menu open closes menu | `matchMedia('(min-width: 768px)')` change listener |
| CROSS-002 | Close uses EXISTING task-8 path                    | Call same `onClose()` that Escape/hamburger use    |
| CROSS-003 | Immediate aria/focus update                        | `aria-expanded=false`, focus moves                 |
| CROSS-004 | Deferred visual hide                               | Animation or immediate per existing logic          |
| CROSS-005 | Scroll lock released                               | `body.style.overflow` restored                     |
| CROSS-006 | Focus destination after auto-close                 | First inline control trigger OR body               |

**NOT ALLOWED:** Resize event polling, separate close path, focus lost.

### 17.4 Breakpoint Tokens (ADR-0013)

**File:** `src/shared/ds/settings/_breakpoints.scss`

```scss
$breakpoint-sm: 640px; // Large phones / small tablets (Tailwind-aligned)
$breakpoint-md: 768px; // Tablet / hamburger->inline switch
$breakpoint-lg: 1024px; // Desktop
$breakpoint-xl: 1280px; // Large desktop
$breakpoint-2xl: 1536px; // Extra large

$breakpoints: (
  'sm': $breakpoint-sm,
  'md': $breakpoint-md,
  'lg': $breakpoint-lg,
  'xl': $breakpoint-xl,
  '2xl': $breakpoint-2xl,
);

$breakpoint-mobile-menu-switch: $breakpoint-md;
```

**Migration:** Only `sm` changes (375->640, unused). All others unchanged.

### 17.5 Geo Auto-Detection Domain (ADR-0014 - AMENDED with GPS)

**Location:** `src/geo-detection/` (lazy chunk, not in main bundle)

```
src/geo-detection/
  adapters/
    GeoDetectionAdapter.ts    # Orchestrates detection flow
    GpsAdapter.ts             # navigator.geolocation wrapper
    ReverseGeocodeAdapter.ts  # BigDataCloud API
  config/
    country-mapping.ts
    providers.ts
  hooks/
    useGeoDetection.ts
  types/
    GeoResult.ts
  index.ts
```

#### 17.5.1 Precedence Chain (CRITICAL)

| Priority | Source               | Condition                                                  |
| -------- | -------------------- | ---------------------------------------------------------- |
| 1        | Stored user choice   | localStorage has any pref set                              |
| 2        | GPS                  | User grants permission, coords -> reverse geocode succeeds |
| 3        | IP geolocation       | GPS denied/timeout/unavailable, IP-geo succeeds            |
| 4        | Device language      | Both GPS and IP-geo fail                                   |
| 5        | Defaults (en/US/USD) | Device language unsupported                                |

**Rationale for GPS > IP-geo:** Owner's VPN testing scenario. User physically in Colombia using US
VPN should detect as Colombia (GPS reports physical location), not US (IP reports VPN exit).

#### 17.5.2 Provider Contract

**IP Geolocation:**

| Provider | URL                                       | Timeout | Response Field          |
| -------- | ----------------------------------------- | ------- | ----------------------- |
| Primary  | `https://api.country.is/`                 | 3000ms  | `country` (ISO alpha-2) |
| Fallback | `https://get.geojs.io/v1/ip/country.json` | 3000ms  | `country` (ISO alpha-2) |

**Reverse Geocoding (GPS path):**

| Provider     | URL                                                                                                     | Timeout | Response Field              |
| ------------ | ------------------------------------------------------------------------------------------------------- | ------- | --------------------------- |
| BigDataCloud | `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=..&longitude=..&localityLanguage=en` | 3000ms  | `countryCode` (ISO alpha-2) |

**Fail-closed validation:**

- IP-geo: `country` must match `^[A-Z]{2}$`
- Reverse geocode: `countryCode` must match `^[A-Z]{2}$`

#### 17.5.3 GPS Parameters

| Parameter            | Value    | Rationale                                   |
| -------------------- | -------- | ------------------------------------------- |
| `timeout`            | 5000ms   | Balance between waiting and UX              |
| `maximumAge`         | 600000ms | 10 min cached position OK for country-level |
| `enableHighAccuracy` | false    | Country-level resolution, save battery      |

#### 17.5.4 Country Mapping (Unchanged)

```typescript
export const COUNTRY_TO_PREFS: Record<
  string,
  { locale: SupportedLocale; region: SupportedRegion; currency: SupportedCurrency }
> = {
  CO: { locale: 'es', region: 'CO', currency: 'COP' },
  US: { locale: 'en', region: 'US', currency: 'USD' },
  ES: { locale: 'es', region: 'ES', currency: 'EUR' },
  GB: { locale: 'en', region: 'GB', currency: 'GBP' },
  MX: { locale: 'es', region: 'MX', currency: 'MXN' },
  CN: { locale: 'zh', region: 'CN', currency: 'CNY' },
  JP: { locale: 'ja', region: 'JP', currency: 'JPY' },
}
```

#### 17.5.5 Detection Flow Contract

| Step | Condition                                   | Action                                               |
| ---- | ------------------------------------------- | ---------------------------------------------------- |
| 1    | Any pref set in localStorage                | Skip detection entirely, use stored                  |
| 2    | All prefs unset                             | Start GPS AND IP-geo in parallel                     |
| 3    | GPS granted + coords                        | Reverse geocode via BigDataCloud                     |
| 4    | Reverse geocode success + supported country | Apply GPS country (precedence 2)                     |
| 5    | Reverse geocode fail OR GPS denied/timeout  | Use IP-geo result if available (precedence 3)        |
| 6    | IP-geo success + supported country          | Apply IP country                                     |
| 7    | IP-geo success + unsupported country        | Device language fallback                             |
| 8    | Both GPS and IP-geo fail                    | Device language fallback                             |
| 9    | Device language supported                   | Apply { locale, region: default, currency: default } |
| 10   | Device language unsupported                 | Apply defaults (en/US/USD)                           |

#### 17.5.6 E2E Mocking Seam

```typescript
// e2e/helpers/geo-mock.ts

// IP geolocation mocks
export async function mockGeoResponse(page: Page, countryCode: string): Promise<void>
export async function mockGeoFailure(page: Page): Promise<void>

// Reverse geocode mocks
export async function mockReverseGeocode(page: Page, countryCode: string): Promise<void>
export async function mockReverseGeocodeFailure(page: Page): Promise<void>

// GPS mocks (Playwright context)
export async function mockGpsGranted(
  context: BrowserContext,
  coords: { lat: number; lng: number }
): Promise<void>
export async function mockGpsDenied(context: BrowserContext): Promise<void>
```

**Test matrix (expanded):**

- GPS granted + all 7 countries (via reverse geocode mock)
- VPN scenario: GPS=CO + IP=US -> CO wins
- GPS denied + all 7 countries (via IP mock)
- GPS timeout + IP fallback
- GPS + reverse geocode failure + IP fallback
- Both fail -> device language fallback
- Unsupported country (FR) -> device language fallback
- Returning user with prefs -> stored wins

#### 17.5.7 External Origins

| Origin               | Purpose         | Data Transmitted | Privacy Note     |
| -------------------- | --------------- | ---------------- | ---------------- |
| api.country.is       | IP geolocation  | IP (inherent)    | First visit only |
| get.geojs.io         | IP fallback     | IP (inherent)    | If primary fails |
| api.bigdatacloud.net | Reverse geocode | Lat/Lng coords   | GPS granted only |

**CRITICAL:** Coordinates sent to BigDataCloud ONLY after user grants browser permission prompt.

### 17.6 Lazy Chunk Structure (ADR-0014 + ADR-0011 Option A)

| Chunk        | Contents                      | Load Condition               |
| ------------ | ----------------------------- | ---------------------------- |
| main.js      | App shell, en/es translations | Always                       |
| geo.js       | Detection adapter + config    | First visit, no stored prefs |
| locale-zh.js | zh.ts translations            | User selects Chinese         |
| locale-ja.js | ja.ts translations            | User selects Japanese        |

**Dynamic import pattern:**

```typescript
// For geo detection
const loadGeoDetection = () => import('./geo-detection')

// For locale loading (in I18nProvider)
const loadLocale = async (locale: SupportedLocale) => {
  if (locale === 'zh') return (await import('./translations/zh')).default
  if (locale === 'ja') return (await import('./translations/ja')).default
  // en/es bundled
}
```

### 17.7 Budget Structure (Rev.9 Proposed)

| Chunk                  | Max Raw | Max Gzip | Warning            |
| ---------------------- | ------- | -------- | ------------------ |
| main.js                | 237 KB  | 75 KB    | 236.5 KB / 74.5 KB |
| geo.js                 | 3 KB    | 1.5 KB   | 2.5 KB             |
| locale-zh.js           | 3 KB    | 1 KB     | 2.5 KB             |
| locale-ja.js           | 3 KB    | 1 KB     | 2.5 KB             |
| Total transfer (worst) | 246 KB  | 78.5 KB  | -                  |

---

## 18. Task 9 Acceptance Criteria

### Must Pass (Machine-Verifiable)

- [ ] `pnpm exec tsc --noEmit` exits 0
- [ ] `pnpm test` exits 0 with 100% coverage
- [ ] `pnpm exec playwright test` exits 0
- [ ] Bundle within ratified rev.9 structure (pending human approval)

### Theme-Aware Menu (THEME9-xxx)

- [ ] THEME9-001: Light theme menu overlay is light (gray-50 or similar)
- [ ] THEME9-002: Dark theme menu overlay is dark (#18181A)
- [ ] THEME9-003: Menu text contrasts overlay in BOTH themes
- [ ] THEME9-004: X/hamburger bars visible over navbar (closed state) BOTH themes
- [ ] THEME9-005: X/hamburger bars visible over overlay (open state) BOTH themes
- [ ] THEME9-006: E2E computed color assertions for overlay in both themes

### Breakpoints (BP-xxx)

- [ ] BP-001: _breakpoints.scss updated with Tailwind-aligned scale
- [ ] BP-002: $breakpoint-sm changed to 640px (was 375px)
- [ ] BP-003: All other breakpoints unchanged
- [ ] BP-004: Hamburger switch remains at 768px (md)
- [ ] BP-005: No max-width queries (mobile-first preserved)

### Menu Scroll (SCROLL-xxx)

- [ ] SCROLL-001: Menu has overflow-y: auto
- [ ] SCROLL-002: All items reachable at 667x375 (landscape)
- [ ] SCROLL-003: All items reachable at 320x480 (small height)
- [ ] SCROLL-004: Scrollbar styled with DS tokens
- [ ] SCROLL-005: Focus-visible items scrolled into view

### Menu Close on Cross (CROSS-xxx)

- [ ] CROSS-001: matchMedia listener at 768px
- [ ] CROSS-002: Menu closes when viewport crosses to >= 768px
- [ ] CROSS-003: Scroll lock released after cross-close
- [ ] CROSS-004: Focus moves to inline controls after cross-close
- [ ] CROSS-005: No resize event polling
- [ ] CROSS-006: Reuses existing close path (not separate implementation)

### Geo Detection (GEO-xxx) [PENDING HUMAN RATIFICATION]

- [ ] GEO-001: geo-detection/ directory exists as lazy chunk
- [ ] GEO-002: api.country.is primary provider
- [ ] GEO-003: get.geojs.io fallback provider
- [ ] GEO-004: 3s timeout per provider
- [ ] GEO-005: 7 supported countries mapped correctly
- [ ] GEO-006: Unsupported country -> device language fallback
- [ ] GEO-007: Provider failure -> device language fallback
- [ ] GEO-008: Stored prefs -> skip detection entirely
- [ ] GEO-009: Detected values persisted via existing setters
- [ ] GEO-010: E2E mock seam for all 7 countries + unsupported + failure

### Lazy Chunks (CHUNK-xxx) [PENDING HUMAN RATIFICATION]

- [ ] CHUNK-001: zh.ts lazy loaded (not in main bundle)
- [ ] CHUNK-002: ja.ts lazy loaded (not in main bundle)
- [ ] CHUNK-003: geo-detection lazy loaded (not in main bundle)
- [ ] CHUNK-004: main.js under 237 KB raw
- [ ] CHUNK-005: Per-chunk under 3 KB raw

---

## 19. References (Updated)

- ADR-0001: Architecture Style
- ADR-0002: i18n Design
- ADR-0003: Language Selector
- ADR-0004: Testing and Quality
- ADR-0005: Design System Architecture
- ADR-0006: Theming Architecture
- ADR-0007: Navbar Dropdown Interaction Pattern
- ADR-0009: Theme Mode Button (Tri-State Cycle)
- ADR-0010: Currency Conversion and Positioning
- ADR-0011: CJK Locales and CNY/JPY Rates (Option A lazy locales activated)
- ADR-0012: Responsive Navbar with Fullscreen Mobile Menu (Amendments 1+2 added)
- ADR-0013: Breakpoint Scale **NEW**
- ADR-0014: Geo Auto-Detection and Bundle Chunking **NEW (pending human decisions)**
- docs/PRD.md
- docs/REQUIREMENTS-CHECKLIST.md
