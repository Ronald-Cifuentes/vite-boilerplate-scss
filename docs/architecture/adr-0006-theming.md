# ADR-0006: Theming Architecture

- **Status:** Accepted
- **Date:** 2026-07-09
- **Deciders:** Architect Agent

## Context

The project requires:

1. A theme contract where ALL system colors come from one global theme definition
2. Light AND dark mode per theme, mandatory
3. User preference persisted with `prefers-color-scheme` default
4. FOUC (Flash of Unstyled Content) prevention
5. Integration with existing `@preact/signals-react` reactive state (per i18n pattern)
6. Hexagonal architecture: port + localStorage adapter (following `src/i18n/` pattern)

## Decision

Implement a **Theme Domain** following the same hexagonal architecture as i18n, with signals-based
reactive state and a theme contract enforcing semantic tokens.

### Token Structure (Semantic over Raw)

All colors use a two-tier token system:

**Tier 1: Primitive Palette (Raw Colors)**

```scss
// src/shared/ds/settings/_palette.scss
// These are NOT used directly in components - only referenced by semantic tokens

$palette-blue-50: #eff6ff;
$palette-blue-500: #3b82f6;
$palette-blue-600: #2563eb;
$palette-blue-700: #1d4ed8;
// ... full palette for each color family
```

**Tier 2: Semantic Tokens (Theme-Aware)**

```scss
// src/shared/ds/themes/_contract.scss
// The REQUIRED custom properties every theme must define

:root {
  // Surface colors (backgrounds)
  --color-surface-base: ; // Main background
  --color-surface-raised: ; // Cards, modals
  --color-surface-overlay: ; // Dropdowns, tooltips

  // Text colors
  --color-text-primary: ; // Main text
  --color-text-secondary: ; // Subdued text
  --color-text-muted: ; // Disabled, placeholder
  --color-text-inverse: ; // Text on primary/accent backgrounds

  // Interactive colors
  --color-interactive-primary: ; // Primary actions
  --color-interactive-primary-hover: ; // Primary hover
  --color-interactive-primary-active: ; // Primary pressed
  --color-interactive-secondary: ; // Secondary actions
  --color-interactive-secondary-hover: ;

  // Feedback colors
  --color-feedback-success: ;
  --color-feedback-warning: ;
  --color-feedback-error: ;
  --color-feedback-info: ;

  // Border colors
  --color-border-default: ;
  --color-border-strong: ;
  --color-border-focus: ; // Focus rings

  // Shadows (not colors but theme-dependent)
  --shadow-sm: ;
  --shadow-md: ;
  --shadow-lg: ;

  // Typography
  --font-family-base: ;
  --font-family-mono: ;

  // Transitions
  --transition-fast: ;
  --transition-normal: ;
}
```

### CSS Custom Properties per Theme

**Light Mode:**

```scss
// src/shared/ds/themes/_light.scss
[data-theme='light'] {
  --color-surface-base: #{$palette-gray-50};
  --color-surface-raised: #{$palette-white};
  --color-surface-overlay: #{$palette-white};

  --color-text-primary: #{$palette-gray-900};
  --color-text-secondary: #{$palette-gray-600};
  --color-text-muted: #{$palette-gray-400};
  --color-text-inverse: #{$palette-white};

  --color-interactive-primary: #{$palette-blue-600};
  --color-interactive-primary-hover: #{$palette-blue-700};
  --color-interactive-primary-active: #{$palette-blue-800};
  --color-interactive-secondary: #{$palette-gray-200};
  --color-interactive-secondary-hover: #{$palette-gray-300};

  --color-feedback-success: #{$palette-green-600};
  --color-feedback-warning: #{$palette-amber-500};
  --color-feedback-error: #{$palette-red-600};
  --color-feedback-info: #{$palette-blue-500};

  --color-border-default: #{$palette-gray-200};
  --color-border-strong: #{$palette-gray-400};
  --color-border-focus: #{$palette-blue-500};

  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);

  --font-family-base: 'Poppins', system-ui, sans-serif;
  --font-family-mono: 'Fira Code', monospace;

  --transition-fast: 150ms ease;
  --transition-normal: 250ms ease;

  color-scheme: light;
}
```

**Dark Mode:**

```scss
// src/shared/ds/themes/_dark.scss
[data-theme='dark'] {
  --color-surface-base: #{$palette-gray-900};
  --color-surface-raised: #{$palette-gray-800};
  --color-surface-overlay: #{$palette-gray-700};

  --color-text-primary: #{$palette-gray-50};
  --color-text-secondary: #{$palette-gray-300};
  --color-text-muted: #{$palette-gray-500};
  --color-text-inverse: #{$palette-gray-900};

  --color-interactive-primary: #{$palette-blue-500};
  --color-interactive-primary-hover: #{$palette-blue-400};
  --color-interactive-primary-active: #{$palette-blue-300};
  --color-interactive-secondary: #{$palette-gray-700};
  --color-interactive-secondary-hover: #{$palette-gray-600};

  --color-feedback-success: #{$palette-green-400};
  --color-feedback-warning: #{$palette-amber-400};
  --color-feedback-error: #{$palette-red-400};
  --color-feedback-info: #{$palette-blue-400};

  --color-border-default: #{$palette-gray-700};
  --color-border-strong: #{$palette-gray-500};
  --color-border-focus: #{$palette-blue-400};

  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.3);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.4);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.5);

  --font-family-base: 'Poppins', system-ui, sans-serif;
  --font-family-mono: 'Fira Code', monospace;

  --transition-fast: 150ms ease;
  --transition-normal: 250ms ease;

  color-scheme: dark;
}
```

### `data-theme` Attribute Strategy

The theme is applied via a `data-theme` attribute on the `<html>` element:

```html
<html lang="en" data-theme="light"></html>
```

**Resolution order:**

1. User preference (localStorage `app-theme`)
2. System preference (`prefers-color-scheme`)
3. Default (`light`)

### FOUC Prevention (Inline Script in index.html)

A blocking inline script runs BEFORE React hydration to set the theme:

```html
<!-- index.html -->
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Vite + React + TS</title>
    <script>
      // FOUC prevention - runs synchronously before paint
      ;(function () {
        var stored = null
        try {
          stored = localStorage.getItem('app-theme')
        } catch (e) {}
        var theme =
          stored || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
        document.documentElement.setAttribute('data-theme', theme)
      })()
    </script>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

### Theme Domain Structure (Hexagonal)

```
src/theme/
  ports/
    Theme.ts                    # Port interface (the contract)
  adapters/
    ThemeProvider.tsx           # React boundary + signal sync
    localStorage.ts             # Persistence adapter
  signals/
    theme-signal.ts             # Singleton theme signal
    side-effects.ts             # data-theme attribute sync
  config/
    themes.ts                   # Theme configuration constants
    index.ts
  hooks/
    useTheme.ts                 # Consumer hook
    useTheme.spec.ts
  types/
    Theme.ts                    # Type definitions
    index.ts
  index.ts                      # Domain barrel export
```

### Port Interface

```typescript
// src/theme/ports/Theme.ts
import type { ThemeMode } from '../types/Theme'

export interface ThemePort {
  /** Current theme mode */
  mode: ThemeMode

  /** Toggle between light and dark */
  toggle: () => void

  /** Set specific theme mode */
  setMode: (mode: ThemeMode) => void

  /** Check if current mode matches system preference */
  isSystemDefault: boolean
}
```

### Type Definitions

```typescript
// src/theme/types/Theme.ts
export type ThemeMode = 'light' | 'dark'

export interface ThemeConfig {
  readonly defaultMode: ThemeMode
  readonly storageKey: string
  readonly supportedModes: readonly ThemeMode[]
}
```

### Configuration

```typescript
// src/theme/config/themes.ts
import type { ThemeMode, ThemeConfig } from '../types/Theme'

export const THEME_STORAGE_KEY = 'app-theme' as const
export const DEFAULT_THEME: ThemeMode = 'light'
export const SUPPORTED_THEMES: readonly ThemeMode[] = ['light', 'dark'] as const

export const THEME_CONFIG: ThemeConfig = {
  defaultMode: DEFAULT_THEME,
  storageKey: THEME_STORAGE_KEY,
  supportedModes: SUPPORTED_THEMES,
} as const

export function isValidTheme(value: string): value is ThemeMode {
  return SUPPORTED_THEMES.includes(value as ThemeMode)
}
```

### Signals-Based State (Following i18n Pattern)

```typescript
// src/theme/signals/theme-signal.ts
import { signal, computed } from '@preact/signals-react'
import type { ThemeMode } from '../types/Theme'
import { DEFAULT_THEME } from '../config/themes'

export const themeSignal = signal<ThemeMode>(DEFAULT_THEME)

export const isLightMode = computed(() => themeSignal.value === 'light')
export const isDarkMode = computed(() => themeSignal.value === 'dark')

export function setTheme(mode: ThemeMode): void {
  themeSignal.value = mode
}

export function toggleTheme(): void {
  themeSignal.value = themeSignal.value === 'light' ? 'dark' : 'light'
}
```

### useTheme Hook

```typescript
// src/theme/hooks/useTheme.ts
import { useSignals } from '@preact/signals-react/runtime'
import type { ThemePort } from '../ports/Theme'
import { themeSignal, toggleTheme, setTheme } from '../signals/theme-signal'

export function useTheme(): ThemePort {
  useSignals()

  return {
    get mode() {
      return themeSignal.value
    },
    toggle: toggleTheme,
    setMode: setTheme,
    get isSystemDefault() {
      if (typeof window === 'undefined') return true
      const systemPreference = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light'
      return themeSignal.value === systemPreference
    },
  }
}
```

### ThemeProvider (Boundary Component)

```typescript
// src/theme/adapters/ThemeProvider.tsx
import { FC, ReactNode } from 'react'
import { useSignalEffect } from '@preact/signals-react'
import { themeSignal, setTheme } from '../signals/theme-signal'
import { syncDataTheme } from '../signals/side-effects'
import { persistTheme, loadPersistedTheme } from './localStorage'
import { isValidTheme } from '../config/themes'
import type { ThemeMode } from '../types/Theme'

export interface ThemeProviderProps {
  children: ReactNode
  initialMode?: ThemeMode
}

export const ThemeProvider: FC<ThemeProviderProps> = ({ children, initialMode }) => {
  // Initialize from persisted/system preference on mount
  useSignalEffect(() => {
    if (initialMode && isValidTheme(initialMode)) {
      setTheme(initialMode)
    } else {
      const persisted = loadPersistedTheme()
      if (persisted) {
        setTheme(persisted)
      }
      // Note: FOUC script already set data-theme from system preference
      // so we read from DOM if no persisted value
      else {
        const domTheme = document.documentElement.getAttribute('data-theme')
        if (domTheme && isValidTheme(domTheme)) {
          setTheme(domTheme)
        }
      }
    }
  })

  // Sync signal -> DOM + persistence
  useSignalEffect(() => {
    syncDataTheme(themeSignal.value)
    persistTheme(themeSignal.value)
  })

  return <>{children}</>
}
```

### LocalStorage Adapter

```typescript
// src/theme/adapters/localStorage.ts
import type { ThemeMode } from '../types/Theme'
import { THEME_STORAGE_KEY, isValidTheme } from '../config/themes'

export function persistTheme(mode: ThemeMode): void {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, mode)
  } catch {
    // localStorage unavailable - silent fail
  }
}

export function loadPersistedTheme(): ThemeMode | null {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY)
    if (stored && isValidTheme(stored)) {
      return stored
    }
  } catch {
    // localStorage unavailable
  }
  return null
}
```

### Side Effects (DOM Sync)

```typescript
// src/theme/signals/side-effects.ts
import type { ThemeMode } from '../types/Theme'

export function syncDataTheme(mode: ThemeMode): void {
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-theme', mode)
  }
}
```

### Domain Barrel Export

```typescript
// src/theme/index.ts
// Types
export type { ThemePort } from './ports/Theme'
export type { ThemeMode, ThemeConfig } from './types/Theme'

// Config
export { DEFAULT_THEME, SUPPORTED_THEMES, THEME_STORAGE_KEY, isValidTheme } from './config/themes'

// Adapter
export { ThemeProvider } from './adapters/ThemeProvider'
export type { ThemeProviderProps } from './adapters/ThemeProvider'

// Hook
export { useTheme } from './hooks/useTheme'
```

### Integration with App

The `App` component wraps content in both providers:

```typescript
// src/shared/components/App/App.tsx
import { I18nProvider } from '../../../i18n'
import { ThemeProvider } from '../../../theme'
// ...

export const App: FC<AppProps> = ({ dataTestId = 'app' }) => {
  return (
    <ThemeProvider>
      <I18nProvider>
        <div className={styles.app} data-testid={dataTestId}>
          {/* ... */}
        </div>
      </I18nProvider>
    </ThemeProvider>
  )
}
```

## Consequences

### Positive

- **Single source of truth**: All colors defined in theme contract
- **Runtime themeable**: CSS custom properties allow instant theme switching
- **No FOUC**: Blocking inline script sets theme before first paint
- **Reactive**: Signals-based state integrates with existing i18n pattern
- **Testable**: ThemeProvider accepts `initialMode` prop for deterministic tests
- **Accessible**: `color-scheme` property informs browser of intended scheme

### Negative

- Inline script in `index.html` is not tree-shakeable (acceptable for FOUC prevention)
- Two providers to wrap (I18n + Theme) - could be combined in future if needed

### Neutral

- Follows same signal + provider + hook pattern as i18n (consistency)
- Theme state is module-level singleton (same trade-offs as locale signal)

## Migration from Current State

| Current                           | Target                                         |
| --------------------------------- | ---------------------------------------------- |
| `color-scheme: dark` in main.scss | `color-scheme` in theme files via `data-theme` |
| `font-family` hardcoded           | `var(--font-family-base)` from theme           |
| No theme toggle                   | ThemeModeToggle control in Navbar              |
| No persistence                    | localStorage via adapter                       |

## References

- ADR-0002: i18n Design (signals pattern to follow)
- ADR-0005: Design System (token structure)
- [prefers-color-scheme MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-color-scheme)
- [color-scheme MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/color-scheme)
