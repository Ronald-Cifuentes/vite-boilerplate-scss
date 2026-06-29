# ADR-0002: Internationalization (i18n) Design

- **Status:** Accepted
- **Date:** 2026-06-29
- **Deciders:** Architect Agent

## Context

The boilerplate must support internationalization with:

- No new runtime dependencies (package.json locked) - hand-rolled with React Context
- Compile-time type safety for translation keys (no runtime key errors)
- Hexagonal architecture: i18n as a port/adapter
- Locale resolution: persisted -> navigator -> default
- `<html lang>` synchronization
- Persistence via localStorage

## Decision

Implement i18n as a first-class domain with clear port/adapter separation.

### File Structure

```
src/i18n/
  ports/
    Translator.ts          # Port interface (the contract)
  adapters/
    I18nProvider.tsx       # React Context implementation (the adapter)
  config/
    locales.ts             # Centralized, typed locale configuration
    index.ts
  translations/
    en.ts                  # English dictionary
    es.ts                  # Spanish dictionary
    index.ts               # Aggregated translations export
  hooks/
    useTranslation.ts      # Consumer hook
    useTranslation.spec.ts
  types/
    Locale.ts              # Locale type definitions
    TranslationKeys.ts     # Compile-time safe keys
    index.ts
  index.ts                 # Domain barrel export
```

## Contracts (TypeScript Interfaces)

### 1. Locale Types (`src/i18n/types/Locale.ts`)

```typescript
/**
 * Supported locale codes. Extend this union to add new locales.
 * Each value must have a corresponding translation dictionary.
 */
export type SupportedLocale = 'en' | 'es'

/**
 * Metadata for a single locale (display name, direction, etc.)
 */
export interface LocaleMetadata {
  /** Locale code (e.g., 'en', 'es') */
  readonly code: SupportedLocale
  /** Native display name (e.g., 'English', 'Espanol') */
  readonly nativeName: string
  /** English display name for accessibility */
  readonly englishName: string
  /** Text direction */
  readonly direction: 'ltr' | 'rtl'
}
```

### 2. Translation Keys (`src/i18n/types/TranslationKeys.ts`)

```typescript
/**
 * Master translation dictionary shape.
 * All translation files MUST satisfy this interface.
 * Adding a key here enforces it across all locale files (compile-time safety).
 */
export interface TranslationDictionary {
  // Common
  common: {
    appName: string
  }
  // Greeting feature
  greeting: {
    hello: string
    welcome: string
  }
  // Language selector feature
  languageSelector: {
    label: string
    changeLanguage: string
  }
  // Accessibility
  a11y: {
    languageSelectorDescription: string
    currentLanguage: string
  }
}

/**
 * Dot-notation keys for the t() function.
 * Example: 'greeting.hello', 'common.appName'
 */
export type TranslationKey = FlattenKeys<TranslationDictionary>

/**
 * Utility type to flatten nested object keys into dot-notation.
 * TranslationDictionary { greeting: { hello: string } } => 'greeting.hello'
 */
type FlattenKeys<T, Prefix extends string = ''> = T extends object
  ? {
      [K in keyof T & string]: T[K] extends object
        ? FlattenKeys<T[K], `${Prefix}${K}.`>
        : `${Prefix}${K}`
    }[keyof T & string]
  : never
```

### 3. Translator Port (`src/i18n/ports/Translator.ts`)

```typescript
import type { SupportedLocale } from '../types/Locale'
import type { TranslationKey } from '../types/TranslationKeys'

/**
 * Translator port - the contract for i18n consumers.
 * Components depend on this interface, not the concrete provider.
 */
export interface Translator {
  /**
   * Translate a key to the current locale's string.
   * @param key - Dot-notation translation key (compile-time checked)
   * @returns Translated string
   */
  t: (key: TranslationKey) => string

  /**
   * Current active locale.
   */
  locale: SupportedLocale

  /**
   * Change the active locale. Persists to storage and updates <html lang>.
   * @param locale - New locale to activate
   */
  setLocale: (locale: SupportedLocale) => void

  /**
   * List of all supported locales with metadata.
   */
  supportedLocales: readonly SupportedLocale[]
}
```

### 4. Locale Configuration (`src/i18n/config/locales.ts`)

```typescript
import type { SupportedLocale, LocaleMetadata } from '../types/Locale'

/**
 * localStorage key for persisted locale preference.
 * Centralized constant - no magic strings.
 */
export const LOCALE_STORAGE_KEY = 'app-locale' as const

/**
 * Default locale when no preference is found or detected.
 */
export const DEFAULT_LOCALE: SupportedLocale = 'en'

/**
 * Ordered list of supported locales.
 * First locale is the fallback default.
 */
export const SUPPORTED_LOCALES: readonly SupportedLocale[] = ['en', 'es'] as const

/**
 * Metadata for each supported locale.
 */
export const LOCALE_METADATA: Readonly<Record<SupportedLocale, LocaleMetadata>> = {
  en: {
    code: 'en',
    nativeName: 'English',
    englishName: 'English',
    direction: 'ltr',
  },
  es: {
    code: 'es',
    nativeName: 'Espanol',
    englishName: 'Spanish',
    direction: 'ltr',
  },
} as const

/**
 * Check if a string is a valid supported locale.
 * Type guard for runtime validation.
 */
export function isSupportedLocale(value: string): value is SupportedLocale {
  return SUPPORTED_LOCALES.includes(value as SupportedLocale)
}
```

### 5. Translation Dictionaries

#### `src/i18n/translations/en.ts`

```typescript
import type { TranslationDictionary } from '../types/TranslationKeys'

export const en: TranslationDictionary = {
  common: {
    appName: 'Vite Boilerplate',
  },
  greeting: {
    hello: 'Hello',
    welcome: 'Welcome to the application',
  },
  languageSelector: {
    label: 'Language',
    changeLanguage: 'Change language',
  },
  a11y: {
    languageSelectorDescription: 'Select your preferred language',
    currentLanguage: 'Current language',
  },
}
```

#### `src/i18n/translations/es.ts`

```typescript
import type { TranslationDictionary } from '../types/TranslationKeys'

export const es: TranslationDictionary = {
  common: {
    appName: 'Plantilla Vite',
  },
  greeting: {
    hello: 'Hola',
    welcome: 'Bienvenido a la aplicacion',
  },
  languageSelector: {
    label: 'Idioma',
    changeLanguage: 'Cambiar idioma',
  },
  a11y: {
    languageSelectorDescription: 'Seleccione su idioma preferido',
    currentLanguage: 'Idioma actual',
  },
}
```

#### `src/i18n/translations/index.ts`

```typescript
import type { SupportedLocale } from '../types/Locale'
import type { TranslationDictionary } from '../types/TranslationKeys'
import { en } from './en'
import { es } from './es'

/**
 * All translation dictionaries indexed by locale code.
 * TypeScript ensures each locale has a complete dictionary.
 */
export const translations: Readonly<Record<SupportedLocale, TranslationDictionary>> = {
  en,
  es,
} as const
```

### 6. I18n Provider Adapter (`src/i18n/adapters/I18nProvider.tsx`)

```typescript
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
  type FC,
} from 'react';
import type { Translator } from '../ports/Translator';
import type { SupportedLocale } from '../types/Locale';
import type { TranslationKey } from '../types/TranslationKeys';
import {
  DEFAULT_LOCALE,
  SUPPORTED_LOCALES,
  LOCALE_STORAGE_KEY,
  isSupportedLocale,
} from '../config/locales';
import { translations } from '../translations';

/**
 * React context for the Translator port.
 * Null when accessed outside provider (will throw in useTranslation).
 */
const I18nContext = createContext<Translator | null>(null);

export interface I18nProviderProps {
  children: ReactNode;
  /** Optional initial locale override (for testing) */
  initialLocale?: SupportedLocale;
}

/**
 * Resolve initial locale using priority order:
 * 1. Persisted preference (localStorage)
 * 2. Browser language (navigator.language)
 * 3. Default locale
 */
function resolveInitialLocale(override?: SupportedLocale): SupportedLocale {
  if (override && isSupportedLocale(override)) {
    return override;
  }

  // 1. Check localStorage
  try {
    const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
    if (stored && isSupportedLocale(stored)) {
      return stored;
    }
  } catch {
    // localStorage unavailable (SSR, private mode) - continue
  }

  // 2. Check navigator language
  if (typeof navigator !== 'undefined' && navigator.language) {
    const browserLang = navigator.language.split('-')[0];
    if (isSupportedLocale(browserLang)) {
      return browserLang;
    }
  }

  // 3. Default
  return DEFAULT_LOCALE;
}

/**
 * Sync <html lang> attribute with current locale.
 */
function syncHtmlLang(locale: SupportedLocale): void {
  if (typeof document !== 'undefined') {
    document.documentElement.lang = locale;
  }
}

/**
 * Persist locale to localStorage.
 */
function persistLocale(locale: SupportedLocale): void {
  try {
    localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  } catch {
    // localStorage unavailable - silent fail
  }
}

/**
 * I18nProvider - the adapter implementing the Translator port via React Context.
 */
export const I18nProvider: FC<I18nProviderProps> = ({ children, initialLocale }) => {
  const [locale, setLocaleState] = useState<SupportedLocale>(() =>
    resolveInitialLocale(initialLocale)
  );

  // Sync <html lang> on mount and locale change
  useEffect(() => {
    syncHtmlLang(locale);
  }, [locale]);

  // Translation function
  const t = useCallback(
    (key: TranslationKey): string => {
      const keys = key.split('.');
      let value: unknown = translations[locale];

      for (const k of keys) {
        if (value && typeof value === 'object' && k in value) {
          value = (value as Record<string, unknown>)[k];
        } else {
          // Key not found - return key itself (dev aid)
          console.warn(`[i18n] Missing translation: ${key} for locale: ${locale}`);
          return key;
        }
      }

      return typeof value === 'string' ? value : key;
    },
    [locale]
  );

  // Locale setter with persistence
  const setLocale = useCallback((newLocale: SupportedLocale): void => {
    setLocaleState(newLocale);
    persistLocale(newLocale);
  }, []);

  // Memoized context value
  const contextValue = useMemo<Translator>(
    () => ({
      t,
      locale,
      setLocale,
      supportedLocales: SUPPORTED_LOCALES,
    }),
    [t, locale, setLocale]
  );

  return <I18nContext.Provider value={contextValue}>{children}</I18nContext.Provider>;
};

/**
 * Internal hook to access raw context (used by useTranslation).
 */
export function useI18nContext(): Translator {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useTranslation must be used within an I18nProvider');
  }
  return context;
}
```

### 7. useTranslation Hook (`src/i18n/hooks/useTranslation.ts`)

```typescript
import type { Translator } from '../ports/Translator'
import { useI18nContext } from '../adapters/I18nProvider'

/**
 * Hook to access the i18n Translator port.
 * Returns { t, locale, setLocale, supportedLocales }.
 *
 * @throws Error if used outside I18nProvider
 *
 * @example
 * const { t, locale, setLocale } = useTranslation();
 * return <h1>{t('greeting.hello')}</h1>;
 */
export function useTranslation(): Translator {
  return useI18nContext()
}
```

### 8. Domain Barrel Export (`src/i18n/index.ts`)

```typescript
// Ports (interfaces)
export type { Translator } from './ports/Translator'

// Types
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

// Adapter (provider)
export { I18nProvider } from './adapters/I18nProvider'
export type { I18nProviderProps } from './adapters/I18nProvider'

// Hook
export { useTranslation } from './hooks/useTranslation'
```

## Locale Resolution Order

1. **Persisted preference** - `localStorage.getItem('app-locale')`
2. **Browser language** - `navigator.language` (first segment, e.g., 'en' from 'en-US')
3. **Default locale** - `'en'` (from `DEFAULT_LOCALE` constant)

## Consequences

### Positive

- **Compile-time safety:** Adding a translation key to `TranslationDictionary` forces all locale
  files to implement it
- **No runtime key errors:** TypeScript prevents `t('invalid.key')` at compile time
- **Testable:** `I18nProvider` accepts `initialLocale` prop for deterministic tests
- **Mockable:** Tests can provide a mock `Translator` implementation
- **No dependencies:** Pure React Context, no external i18n library

### Negative

- No ICU message format, pluralization, or interpolation (can be added later if needed)
- Manual sync required when adding new locales

### Neutral

- Translation files are TypeScript for compile-time checking (not JSON)

## References

- ADR-0001: Architecture Style
- PRD FR2, FR3: i18n requirements
