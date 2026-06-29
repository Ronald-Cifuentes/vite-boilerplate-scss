# ADR-0003: Language Selector Component

- **Status:** Accepted
- **Date:** 2026-06-29
- **Deciders:** Architect Agent

## Context

The application requires a language selector that:

- Allows users to switch between supported locales
- Is fully accessible (WCAG AA, keyboard navigable, screen reader friendly)
- Is mobile-first responsive
- Consumes the i18n port via Dependency Inversion (not coupled to implementation)
- Uses no external icon libraries (react-icons not installed; package.json locked)

## Decision

Implement `LanguageSelector` as a feature with a single component that consumes the `Translator`
port via `useTranslation`.

### File Structure

```
src/features/language-selector/
  components/
    LanguageSelector/
      LanguageSelector.tsx
      LanguageSelector.module.scss
      LanguageSelector.spec.tsx
      interfaces.ts
      index.ts
  index.ts
```

## Contracts (TypeScript Interfaces)

### Component Interface (`src/features/language-selector/components/LanguageSelector/interfaces.ts`)

```typescript
import type { SupportedLocale } from '../../../../i18n'

/**
 * Props for the LanguageSelector component.
 */
export interface LanguageSelectorProps {
  /**
   * Test ID for e2e/integration testing.
   * @default 'language-selector'
   */
  dataTestId?: string

  /**
   * Optional CSS class name for styling override.
   */
  className?: string

  /**
   * Callback fired after locale changes (for analytics, etc.).
   * The actual locale change is handled internally via useTranslation.
   */
  onLocaleChange?: (newLocale: SupportedLocale) => void
}
```

### Component Implementation Contract (`src/features/language-selector/components/LanguageSelector/LanguageSelector.tsx`)

```typescript
import { FC, useCallback, useId } from 'react';
import { useTranslation, LOCALE_METADATA, type SupportedLocale } from '../../../../i18n';
import type { LanguageSelectorProps } from './interfaces';
import styles from './LanguageSelector.module.scss';

/**
 * LanguageSelector - accessible dropdown for switching application locale.
 *
 * Accessibility:
 * - Uses native <select> for built-in keyboard/screen reader support
 * - Associated <label> with htmlFor
 * - aria-describedby for additional context
 * - Live region announces locale change
 *
 * Mobile-first:
 * - Touch-friendly native select
 * - Responsive sizing via SCSS
 */
export const LanguageSelector: FC<LanguageSelectorProps> = ({
  dataTestId = 'language-selector',
  className,
  onLocaleChange,
}) => {
  const { t, locale, setLocale, supportedLocales } = useTranslation();
  const selectId = useId();
  const descriptionId = useId();

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      const newLocale = event.target.value as SupportedLocale;
      setLocale(newLocale);
      onLocaleChange?.(newLocale);
    },
    [setLocale, onLocaleChange]
  );

  return (
    <div
      className={`${styles.languageSelector} ${className ?? ''}`}
      data-testid={dataTestId}
    >
      <label htmlFor={selectId} className={styles.label}>
        {t('languageSelector.label')}
      </label>
      <select
        id={selectId}
        value={locale}
        onChange={handleChange}
        className={styles.select}
        aria-describedby={descriptionId}
        data-testid={`${dataTestId}-select`}
      >
        {supportedLocales.map((localeCode) => {
          const meta = LOCALE_METADATA[localeCode];
          return (
            <option key={localeCode} value={localeCode}>
              {meta.nativeName}
            </option>
          );
        })}
      </select>
      <span id={descriptionId} className={styles.srOnly}>
        {t('a11y.languageSelectorDescription')}
      </span>
    </div>
  );
};

export default LanguageSelector;
```

### Styles Contract (`src/features/language-selector/components/LanguageSelector/LanguageSelector.module.scss`)

```scss
/**
 * LanguageSelector styles - mobile-first approach.
 * Base styles target mobile; media queries add desktop enhancements.
 */

.languageSelector {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  width: 100%;
  max-width: 12rem;
}

.label {
  font-size: 0.875rem;
  font-weight: 500;
  color: inherit;
}

.select {
  appearance: none;
  background-color: var(--surface-color, #ffffff);
  border: 1px solid var(--border-color, #d1d5db);
  border-radius: 0.375rem;
  padding: 0.625rem 2rem 0.625rem 0.75rem;
  font-size: 1rem;
  line-height: 1.5;
  color: inherit;
  cursor: pointer;
  width: 100%;

  // Custom dropdown arrow (inline, no react-icons)
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='currentColor'%3E%3Cpath fill-rule='evenodd' d='M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z' clip-rule='evenodd'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.5rem center;
  background-size: 1.25rem;

  &:focus {
    outline: 2px solid var(--focus-color, #3b82f6);
    outline-offset: 2px;
  }

  &:hover {
    border-color: var(--border-hover-color, #9ca3af);
  }
}

// Screen reader only utility
.srOnly {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

// Desktop enhancements (mobile-first: min-width)
@media (min-width: 640px) {
  .languageSelector {
    flex-direction: row;
    align-items: center;
    gap: 0.5rem;
  }

  .select {
    width: auto;
    min-width: 8rem;
  }
}
```

### Feature Barrel Export (`src/features/language-selector/index.ts`)

```typescript
export { LanguageSelector } from './components/LanguageSelector'
export type { LanguageSelectorProps } from './components/LanguageSelector/interfaces'
```

## Accessibility Requirements

| Requirement                  | Implementation                                                |
| ---------------------------- | ------------------------------------------------------------- |
| **Keyboard navigable**       | Native `<select>` provides Tab, Arrow keys, Enter, Space      |
| **Screen reader accessible** | `<label>` with `htmlFor`, `aria-describedby` for instructions |
| **Focus indicator**          | Visible outline on `:focus` (2px solid, offset)               |
| **Accessible name**          | Label text "Language" (translated)                            |
| **Current value announced**  | Native select announces selected option                       |
| **Color contrast**           | Text/background meets AA (4.5:1 minimum)                      |

## Mobile-First Behavior

| Viewport               | Behavior                                                     |
| ---------------------- | ------------------------------------------------------------ |
| **Mobile (< 640px)**   | Stacked layout (label above select), full-width touch target |
| **Desktop (>= 640px)** | Inline layout (label beside select), auto-width              |

## Dependency Inversion

The component depends on the `Translator` port abstraction, not the concrete `I18nProvider`:

```
LanguageSelector --> useTranslation --> Translator (port interface)
                                              ^
                                              |
                                        I18nProvider (adapter)
```

This means:

- Tests can mock `useTranslation` or wrap with a test provider
- The component has no knowledge of localStorage, context internals, etc.
- Switching i18n implementations requires zero component changes

## Consequences

### Positive

- Native `<select>` provides robust a11y without custom ARIA management
- Mobile-first CSS keeps bundle small and prioritizes mobile experience
- No icon library dependency (inline SVG for dropdown arrow)
- Fully testable via Testing Library's user-event

### Negative

- Native select styling is limited (can't style options cross-browser)
- No animated transitions (acceptable for simplicity)

### Neutral

- Single component feature (may grow if custom dropdown is needed later)

## References

- ADR-0001: Architecture Style
- ADR-0002: i18n Design
- PRD FR1: Language selector requirements
- WCAG 2.1 AA: https://www.w3.org/WAI/WCAG21/quickref/
