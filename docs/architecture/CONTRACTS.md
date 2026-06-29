# Architecture Contracts

**Version:** 1.0.0  
**Date:** 2026-06-29  
**Status:** Authoritative - Frontend Engineer implements against this document

This document consolidates all architectural contracts. Every interface, file path, and naming
convention defined here is binding.

---

## 1. Target `src/` Tree

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
    language-selector/
      components/
        LanguageSelector/
          LanguageSelector.tsx
          LanguageSelector.module.scss
          LanguageSelector.spec.tsx
          interfaces.ts
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
  shared/
    components/
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
        language-switching.integration.spec.tsx
      arch/
        architecture.spec.ts
      __mocks__/
        styleMock.ts
  assets/
  main.tsx
  vite-env.d.ts

e2e/
  journeys/
    language-selection.spec.ts
    locale-persistence.spec.ts
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
  }
  languageSelector: {
    label: string
    changeLanguage: string
  }
  a11y: {
    languageSelectorDescription: string
    currentLanguage: string
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

## 3. Feature Contracts

### 3.1 Greeting Feature

**File:** `src/features/greeting/components/Greeting/interfaces.ts`

```typescript
export interface GreetingProps {
  dataTestId?: string
  className?: string
}
```

**File:** `src/features/greeting/components/Greeting/Greeting.tsx`

```typescript
export const Greeting: FC<GreetingProps>
export default Greeting
```

**Behavior:**

- Renders `t('greeting.hello')` as heading
- Renders `t('greeting.welcome')` as subtext
- No hardcoded strings

### 3.2 Language Selector Feature

**File:** `src/features/language-selector/components/LanguageSelector/interfaces.ts`

```typescript
import type { SupportedLocale } from '../../../../i18n'

export interface LanguageSelectorProps {
  dataTestId?: string
  className?: string
  onLocaleChange?: (newLocale: SupportedLocale) => void
}
```

**File:** `src/features/language-selector/components/LanguageSelector/LanguageSelector.tsx`

```typescript
export const LanguageSelector: FC<LanguageSelectorProps>
export default LanguageSelector
```

**Behavior:**

- Native `<select>` with `<label>`
- Options from `supportedLocales` with `LOCALE_METADATA[locale].nativeName`
- `aria-describedby` for screen reader description
- Calls `setLocale` on change
- Fires `onLocaleChange` callback if provided

---

## 4. Shared Components

### 4.1 App (Root Shell)

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

**Responsibilities:**

- Wraps content in I18nProvider
- Renders LanguageSelector
- Renders Greeting
- Layout container

---

## 5. Test Utilities

### 5.1 Custom Render

**File:** `src/shared/test/test-utils.tsx`

```typescript
import type { SupportedLocale } from '../../i18n'

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  initialLocale?: SupportedLocale
}

export function renderWithProviders(ui: ReactElement, options?: CustomRenderOptions): RenderResult

export * from '@testing-library/react'
export { renderWithProviders as render }
```

### 5.2 Style Mock

**File:** `src/shared/test/__mocks__/styleMock.ts`

```typescript
export default {}
```

---

## 6. generate-react-cli Configuration

**File:** `generate-react-cli.json`

```json
{
  "usesTypeScript": true,
  "usesCssModule": true,
  "cssPreprocessor": "scss",
  "testLibrary": "Testing Library",
  "component": {
    "default": {
      "customTemplates": {
        "index": "templates/component/index.ts",
        "interfaces": "templates/component/interfaces.ts",
        "component": "templates/component/TemplateName.tsx",
        "style": "templates/component/TemplateName.module.scss",
        "test": "templates/component/TemplateName.spec.tsx"
      },
      "path": "src/shared/components",
      "withStyle": true,
      "withTest": true,
      "withStory": false,
      "withLazy": false,
      "withIndex": true,
      "withInterfaces": true
    },
    "feature": {
      "customTemplates": {
        "index": "templates/component/index.ts",
        "interfaces": "templates/component/interfaces.ts",
        "component": "templates/component/TemplateName.tsx",
        "style": "templates/component/TemplateName.module.scss",
        "test": "templates/component/TemplateName.spec.tsx"
      },
      "path": "src/features",
      "withStyle": true,
      "withTest": true,
      "withStory": false,
      "withLazy": false,
      "withIndex": true,
      "withInterfaces": true
    },
    "hook": {
      "customTemplates": {
        "index": "templates/hook/index.ts",
        "interfaces": "templates/hook/interfaces.ts",
        "component": "templates/hook/useTemplateName.ts",
        "test": "templates/hook/useTemplateName.spec.ts"
      },
      "path": "src/shared/hooks",
      "withStyle": false,
      "withTest": true,
      "withStory": false,
      "withLazy": false,
      "withIndex": true,
      "withInterfaces": true
    },
    "testComp": {
      "customTemplates": {
        "test": "templates/component/TemplateName.spec.tsx"
      },
      "path": "src/shared/components",
      "withTest": true,
      "withStyle": false,
      "withStory": false,
      "withLazy": false,
      "withIndex": false,
      "withInterfaces": false
    },
    "testHook": {
      "customTemplates": {
        "test": "templates/hook/useTemplateName.spec.ts"
      },
      "path": "src/shared/hooks",
      "withTest": true,
      "withStyle": false,
      "withStory": false,
      "withLazy": false,
      "withIndex": false,
      "withInterfaces": false
    }
  },
  "usesStyledComponents": false
}
```

**Changes from original:**

1. `default` path: `src/components` -> `src/shared/components`
2. `hook` path: `src/hooks` -> `src/shared/hooks`
3. `testComp` path: `src/components` -> `src/shared/components`
4. `testHook` path: `src/hooks` -> `src/shared/hooks`
5. **NEW** `feature` type: generates into `src/features` (for feature components)

**Usage:**

```bash
# Shared component
pnpm dlx generate-react-cli component Button --type=default

# Feature component (manual path required)
pnpm dlx generate-react-cli component Greeting --type=feature --path=src/features/greeting/components

# Hook
pnpm dlx generate-react-cli component useAuth --type=hook
```

---

## 7. Coverage & Quality Requirements

### 7.1 Jest Coverage Thresholds

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

### 7.2 Files Excluded from Coverage

- `src/**/*.d.ts`
- `src/**/index.ts` (barrel exports)
- `src/main.tsx` (entry point)
- `src/vite-env.d.ts`

---

## 8. Acceptance Criteria for Frontend Phase

The Frontend Engineer's work is complete when:

### Must Pass

- [ ] All files in target tree exist with correct content
- [ ] `./node_modules/.bin/tsc --noEmit` exits 0
- [ ] `./node_modules/.bin/eslint src` exits 0
- [ ] `./node_modules/.bin/jest --coverage` exits 0 with 100% coverage
- [ ] `pnpm dlx playwright test` exits 0 (all e2e journeys pass)
- [ ] `pnpm dlx generate-react-cli component TestComp --type=default` works
- [ ] `package.json` unchanged (git diff shows no modifications)

### Functional

- [ ] App renders Greeting with translated text
- [ ] LanguageSelector displays all locales
- [ ] Changing locale updates all visible text immediately
- [ ] Locale persists to localStorage and restores on reload
- [ ] `<html lang>` attribute matches current locale
- [ ] Selector is keyboard accessible (Tab, Arrow keys)
- [ ] Selector has accessible name (label association)

### Architecture

- [ ] No hardcoded user-facing strings in components
- [ ] All config values in typed constants (no magic)
- [ ] i18n accessed only via useTranslation hook
- [ ] Feature components do not import from other features
- [ ] Ports have no React imports
- [ ] Dependencies point inward (Clean Architecture)

---

## 9. Notes for Implementation

1. **Move existing App:** `src/components/App/` -> `src/shared/components/App/`
2. **Delete empty dirs:** Remove `src/test/`, `src/hooks/`, `src/components/` (after move)
3. **Update main.tsx:** Import App from new location, wrap with I18nProvider
4. **Imports:** Use relative paths within domains, barrel imports across domains
5. **SCSS variables:** Use CSS custom properties for theming (defined in App.module.scss or a shared
   variables file)

---

## References

- ADR-0001: Architecture Style
- ADR-0002: i18n Design
- ADR-0003: Language Selector
- ADR-0004: Testing and Quality
- docs/PRD.md
- docs/REQUIREMENTS-CHECKLIST.md
