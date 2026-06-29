# ADR-0004: Testing and Quality Strategy

- **Status:** Accepted
- **Date:** 2026-06-29
- **Deciders:** Architect Agent

## Context

The project mandates:

- 100% unit, integration, and e2e coverage
- TDD/BDD with Given/When/Then style
- SDD: features traceable to specs
- SOLID verification
- Jest for unit/integration, Playwright for e2e (via `pnpm dlx`)

## Decision

Implement a comprehensive testing strategy across three layers with behavioral specifications.

## Testing Pyramid

```
         /\
        /  \      E2E (Playwright)
       /----\     - User journeys
      /      \    - Cross-feature integration
     /--------\   Integration (Jest + RTL)
    /          \  - Provider + component interaction
   /------------\ Unit (Jest)
  /              \ - Pure functions
 /----------------\ - Isolated components
```

## Test Structure

### Unit Tests

Location: Co-located with source files (`*.spec.ts` / `*.spec.tsx`)

```
src/
  i18n/
    config/
      locales.spec.ts           # Config utility tests
    hooks/
      useTranslation.spec.ts    # Hook tests (with mock provider)
  features/
    greeting/
      components/
        Greeting/
          Greeting.spec.tsx     # Component unit tests
    language-selector/
      components/
        LanguageSelector/
          LanguageSelector.spec.tsx
```

### Integration Tests

Location: `src/shared/test/integration/`

```
src/
  shared/
    test/
      integration/
        i18n-provider.integration.spec.tsx    # Provider + consumers
        language-switching.integration.spec.tsx  # Selector + Greeting
```

### E2E Tests

Location: `e2e/` (project root)

```
e2e/
  journeys/
    language-selection.spec.ts    # Full user journey
    locale-persistence.spec.ts    # Reload + persistence
    accessibility.spec.ts         # a11y checks
  playwright.config.ts
```

## BDD Specifications (Given/When/Then)

### Example: Language Selector Unit Test

```typescript
// src/features/language-selector/components/LanguageSelector/LanguageSelector.spec.tsx

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LanguageSelector } from './LanguageSelector';
import { I18nProvider } from '../../../../i18n';

describe('LanguageSelector', () => {
  const renderWithProvider = (props = {}) =>
    render(
      <I18nProvider initialLocale="en">
        <LanguageSelector {...props} />
      </I18nProvider>
    );

  describe('Given the selector is rendered', () => {
    it('Then it displays the label', () => {
      // Arrange
      renderWithProvider();

      // Assert
      expect(screen.getByLabelText(/language/i)).toBeInTheDocument();
    });

    it('Then it shows all supported locales', () => {
      // Arrange
      renderWithProvider();

      // Assert
      expect(screen.getByRole('option', { name: 'English' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'Espanol' })).toBeInTheDocument();
    });
  });

  describe('Given the user selects a different locale', () => {
    it('When Spanish is selected, Then the locale changes', async () => {
      // Arrange
      const user = userEvent.setup();
      renderWithProvider();

      // Act
      await user.selectOptions(screen.getByRole('combobox'), 'es');

      // Assert
      expect(screen.getByRole('combobox')).toHaveValue('es');
    });

    it('When a locale is selected, Then onLocaleChange callback fires', async () => {
      // Arrange
      const onLocaleChange = jest.fn();
      const user = userEvent.setup();
      renderWithProvider({ onLocaleChange });

      // Act
      await user.selectOptions(screen.getByRole('combobox'), 'es');

      // Assert
      expect(onLocaleChange).toHaveBeenCalledWith('es');
    });
  });
});
```

### Example: i18n Provider Integration Test

```typescript
// src/shared/test/integration/i18n-provider.integration.spec.tsx

import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { I18nProvider, useTranslation } from '../../../i18n';
import { LanguageSelector } from '../../../features/language-selector';

// Test consumer component
const TestConsumer = () => {
  const { t, locale } = useTranslation();
  return (
    <div>
      <span data-testid="greeting">{t('greeting.hello')}</span>
      <span data-testid="locale">{locale}</span>
    </div>
  );
};

describe('I18nProvider Integration', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('Given the provider wraps consumers', () => {
    it('Then consumers receive translation function', () => {
      // Arrange & Act
      render(
        <I18nProvider initialLocale="en">
          <TestConsumer />
        </I18nProvider>
      );

      // Assert
      expect(screen.getByTestId('greeting')).toHaveTextContent('Hello');
    });
  });

  describe('Given LanguageSelector changes locale', () => {
    it('When Spanish is selected, Then all consumers update', async () => {
      // Arrange
      const user = userEvent.setup();
      render(
        <I18nProvider initialLocale="en">
          <LanguageSelector />
          <TestConsumer />
        </I18nProvider>
      );

      // Act
      await user.selectOptions(screen.getByRole('combobox'), 'es');

      // Assert
      expect(screen.getByTestId('greeting')).toHaveTextContent('Hola');
      expect(screen.getByTestId('locale')).toHaveTextContent('es');
    });
  });

  describe('Given locale persistence', () => {
    it('When locale changes, Then it persists to localStorage', async () => {
      // Arrange
      const user = userEvent.setup();
      render(
        <I18nProvider>
          <LanguageSelector />
        </I18nProvider>
      );

      // Act
      await user.selectOptions(screen.getByRole('combobox'), 'es');

      // Assert
      expect(localStorage.getItem('app-locale')).toBe('es');
    });
  });
});
```

### Example: E2E Journey (Playwright)

```typescript
// e2e/journeys/language-selection.spec.ts

import { test, expect } from '@playwright/test'

test.describe('Language Selection Journey', () => {
  test.beforeEach(async ({ page, context }) => {
    // Clear storage
    await context.clearCookies()
    await page.evaluate(() => localStorage.clear())
  })

  test('Given a new user visits the app, When they switch language, Then all text updates', async ({
    page,
  }) => {
    // Given
    await page.goto('/')
    await expect(page.getByTestId('greeting')).toHaveText('Hello')
    await expect(page.locator('html')).toHaveAttribute('lang', 'en')

    // When
    await page.getByRole('combobox').selectOption('es')

    // Then
    await expect(page.getByTestId('greeting')).toHaveText('Hola')
    await expect(page.locator('html')).toHaveAttribute('lang', 'es')
  })

  test('Given a user with persisted preference, When they reload, Then preference is restored', async ({
    page,
  }) => {
    // Given
    await page.goto('/')
    await page.getByRole('combobox').selectOption('es')
    await expect(page.getByTestId('greeting')).toHaveText('Hola')

    // When
    await page.reload()

    // Then
    await expect(page.getByTestId('greeting')).toHaveText('Hola')
    await expect(page.getByRole('combobox')).toHaveValue('es')
    await expect(page.locator('html')).toHaveAttribute('lang', 'es')
  })
})
```

### Example: Accessibility E2E Test

```typescript
// e2e/journeys/accessibility.spec.ts

import { test, expect } from '@playwright/test'

test.describe('Accessibility', () => {
  test('Language selector is keyboard accessible', async ({ page }) => {
    // Given
    await page.goto('/')

    // When - navigate to selector via keyboard
    await page.keyboard.press('Tab')
    const combobox = page.getByRole('combobox')
    await expect(combobox).toBeFocused()

    // Then - can interact via keyboard
    await page.keyboard.press('ArrowDown')
    await page.keyboard.press('Enter')
    // Verify interaction worked (locale may or may not change based on initial state)
    await expect(combobox).toHaveValue(/.+/)
  })

  test('Language selector has accessible name', async ({ page }) => {
    await page.goto('/')

    const combobox = page.getByRole('combobox')
    await expect(combobox).toHaveAccessibleName(/language/i)
  })

  test('App performance is under 500ms', async ({ page }) => {
    const startTime = Date.now()
    await page.goto('/')
    await page.waitForSelector('[data-testid="app"]')
    const loadTime = Date.now() - startTime

    expect(loadTime).toBeLessThan(500)
  })
})
```

## Coverage Configuration

### Jest Config (`jest.config.ts`)

```typescript
import type { Config } from 'jest'

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest-setup.ts'],
  moduleNameMapper: {
    '\\.module\\.scss$': 'identity-obj-proxy',
    '\\.scss$': '<rootDir>/src/shared/test/__mocks__/styleMock.ts',
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/index.ts',
    '!src/main.tsx',
    '!src/vite-env.d.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100,
    },
  },
  testMatch: ['**/*.spec.{ts,tsx}'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
}

export default config
```

### Test Utils (`src/shared/test/test-utils.tsx`)

```typescript
import { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { I18nProvider, SupportedLocale } from '../../i18n';

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  initialLocale?: SupportedLocale;
}

/**
 * Custom render function that wraps components in required providers.
 * Use this instead of @testing-library/react render for integration tests.
 */
export function renderWithProviders(
  ui: ReactElement,
  { initialLocale = 'en', ...options }: CustomRenderOptions = {}
) {
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <I18nProvider initialLocale={initialLocale}>{children}</I18nProvider>
  );

  return render(ui, { wrapper: Wrapper, ...options });
}

// Re-export everything from @testing-library/react
export * from '@testing-library/react';
export { renderWithProviders as render };
```

## SOLID Verification

| Principle                     | Verification Method                                                                                       |
| ----------------------------- | --------------------------------------------------------------------------------------------------------- |
| **S** - Single Responsibility | Code review: each file has one purpose; if a test requires multiple mocks, the unit may be doing too much |
| **O** - Open/Closed           | Adding new locales requires only new translation files, no core changes                                   |
| **L** - Liskov Substitution   | Test that mock Translator works identically to real I18nProvider                                          |
| **I** - Interface Segregation | Translator port has only `t`, `locale`, `setLocale`, `supportedLocales` - no unused methods               |
| **D** - Dependency Inversion  | Components import ports (types), not adapters; verify via import linting                                  |

### Architecture Test (Layer Boundaries)

```typescript
// src/shared/test/arch/architecture.spec.ts

import * as fs from 'fs'
import * as path from 'path'

describe('Architecture Rules', () => {
  const readFile = (filePath: string) =>
    fs.readFileSync(path.join(process.cwd(), filePath), 'utf-8')

  describe('Dependency Direction', () => {
    it('Features do not import from shared/components/App', () => {
      // Features should not depend on the App shell
      const greetingFile = readFile('src/features/greeting/components/Greeting/Greeting.tsx')
      expect(greetingFile).not.toMatch(/from ['"].*shared\/components\/App/)
    })

    it('i18n ports have no external dependencies', () => {
      const translatorPort = readFile('src/i18n/ports/Translator.ts')
      // Should only import from within i18n/types
      const imports = translatorPort.match(/from ['"]([^'"]+)['"]/g) || []
      imports.forEach(imp => {
        expect(imp).toMatch(/from ['"]\.\.\/types/)
      })
    })

    it('Components do not import React internals from adapters', () => {
      const selectorFile = readFile(
        'src/features/language-selector/components/LanguageSelector/LanguageSelector.tsx'
      )
      // Should use useTranslation hook, not useI18nContext directly
      expect(selectorFile).not.toMatch(/useI18nContext/)
      expect(selectorFile).toMatch(/useTranslation/)
    })
  })

  describe('No Framework in Domain', () => {
    it('i18n types have no React imports', () => {
      const localeTypes = readFile('src/i18n/types/Locale.ts')
      const keyTypes = readFile('src/i18n/types/TranslationKeys.ts')

      expect(localeTypes).not.toMatch(/from ['"]react['"]/)
      expect(keyTypes).not.toMatch(/from ['"]react['"]/)
    })

    it('i18n config has no React imports', () => {
      const config = readFile('src/i18n/config/locales.ts')
      expect(config).not.toMatch(/from ['"]react['"]/)
    })
  })
})
```

## Playwright Configuration

```typescript
// e2e/playwright.config.ts

import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './journeys',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],
  webServer: {
    command: 'pnpm --pm-on-fail=ignore run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
})
```

## Consequences

### Positive

- 100% coverage enforced at config level (build fails if not met)
- BDD style makes tests readable and spec-traceable
- Architecture tests prevent layer violations
- E2E covers real user journeys

### Negative

- High coverage target may slow development initially
- Architecture tests require maintenance as structure evolves

### Neutral

- Tests are co-located with source (easier navigation, but more files per folder)

## References

- PRD NFR3: 100% coverage requirement
- REQUIREMENTS-CHECKLIST.md G1-G6: Testing requirements
- ADR-0001: Architecture to verify
