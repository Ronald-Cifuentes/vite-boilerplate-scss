# ADR-0009: Theme Mode Button (Tri-State Cycle)

- **Status:** Accepted
- **Date:** 2026-07-09
- **Deciders:** Architect Agent (per user requirement supersession #2)
- **Supersedes:** CONTRACTS.md v3.0.0 Section 7.2 (ThemeDropdown)

## Context

### User Requirement (Verbatim)

> "Dark mode cannot be a dropdown menu because that would confuse or annoy the user; it's better if
> it's a button that changes as it's pressed. It will have three modes that swap the icon: light
> mode, dark mode, and system (which will use the one the user has for their system)."

This supersedes the ThemeDropdown from task-2 (ADR-0007) for the THEME CONTROL ONLY. All other
task-2 cross-cutting mandates remain binding: icon-only control (no text in the button), nothing
decorative, 100% mobile-first, i18n en+es, react-icons only, 100% coverage.

### What is Rejected

The `ThemeDropdown` component implemented in task-2:

- `src/features/navbar/components/ThemeDropdown/` (entire directory)

This directory must be DELETED (dead code prohibition per established precedent).

**Note:** This is NOT a revert to task-1's `ThemeModeToggle` (2-state cycle button). Task-3 adds an
explicit third 'system' mode with LIVE OS-following behavior.

### Why a Cycle Button (Not Dropdown)

1. **User mandate**: The requirement is explicit and non-negotiable.
2. **Faster interaction**: Single click cycles state; no open/navigate/select flow.
3. **Simpler UX for binary-like choice**: Theme has only 3 options vs language/country/currency
   (2-4+ options with locale/flag/symbol differentiation).
4. **System mode discoverability**: The icon explicitly shows "system" as a distinct third state.

## Decision

Implement a **tri-state icon cycle button** following WAI-ARIA button pattern with dynamic icon and
live OS preference tracking.

### 1. Domain Model

#### Types

```typescript
// src/theme/types/Theme.ts (UPDATED)

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

#### Signal Structure

```typescript
// src/theme/signals/theme-signal.ts (UPDATED)

/** User's stored preference (what they chose) */
export const themePreferenceSignal = signal<ThemePreference>('system')

/** Resolved effective mode (what data-theme gets) */
export const effectiveThemeSignal = computed<ThemeMode>(() => {
  const pref = themePreferenceSignal.value
  if (pref === 'light' || pref === 'dark') return pref
  // 'system' -> resolve from OS
  return osPrefersDarkSignal.value ? 'dark' : 'light'
})

/** Tracks OS prefers-color-scheme: dark in real-time */
export const osPrefersDarkSignal = signal<boolean>(
  typeof window !== 'undefined' ? window.matchMedia('(prefers-color-scheme: dark)').matches : false
)
```

#### Resolution Location

Resolution lives in the **signal layer** via `effectiveThemeSignal` computed. The ThemeProvider:

1. Initializes `themePreferenceSignal` from localStorage / DOM / default.
2. Sets up `matchMedia` listener to update `osPrefersDarkSignal` on OS change.
3. Uses `useSignalEffect` to sync `effectiveThemeSignal.value` to `data-theme` attribute.

#### Live OS-Following Contract (preference === 'system')

When the user's preference is 'system':

1. On page load: `effectiveThemeSignal` resolves from current OS preference.
2. On OS change (system dark mode toggle): The `matchMedia` listener updates `osPrefersDarkSignal`,
   which triggers `effectiveThemeSignal` to recompute, which triggers `data-theme` update via
   `useSignalEffect`. **No reload required.**
3. SSR-safety: `osPrefersDarkSignal` initializes to `false` on server; FOUC script handles SSR.

### 2. Persistence and Backward Compatibility

#### LocalStorage Schema

**Key:** `app-theme` (unchanged from task-1/task-2)

**Valid values:** `'light'` | `'dark'` | `'system'` (NEW)

**Existing users:**

- Stored `'light'` or `'dark'`: works as-is (no migration needed).
- Missing key: defaults to `'system'` (see below).
- Corrupted/invalid value: allowlist validation rejects -> defaults to `'system'`.

#### Default for New/Unset Users

**Decision:** Default preference is `'system'`.

**Rationale:**

- Current behavior (task-2) already falls back to `matchMedia` when localStorage is unset.
- Defaulting to `'system'` preserves this observable behavior while making it explicit.
- Users who prefer light/dark explicitly will set it; those who want OS-following get it by default.

#### Validation Function

```typescript
// src/theme/config/themes.ts (UPDATED)
export const SUPPORTED_PREFERENCES: readonly ThemePreference[] = [
  'light',
  'dark',
  'system',
] as const

export function isValidPreference(value: string): value is ThemePreference {
  return SUPPORTED_PREFERENCES.includes(value as ThemePreference)
}

// Keep isValidTheme for effective mode validation (data-theme allowlist)
export function isValidTheme(value: string): value is ThemeMode {
  return value === 'light' || value === 'dark'
}
```

### 3. FOUC Prevention Script Contract (index.html)

The inline script must:

1. Read `localStorage.getItem('app-theme')`.
2. If stored value is `'light'` or `'dark'`: use it directly.
3. If stored value is `'system'` OR key is absent: resolve via `matchMedia`.
4. Set `document.documentElement.setAttribute('data-theme', resolvedMode)`.

**Updated script:**

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

**Security note (SEC-005):** CSS-only usage; React re-validates on hydration.

### 4. Component Contract

#### Name and Location

**Component:** `ThemeModeButton`

**Path:** `src/features/navbar/components/ThemeModeButton/`

**Files:**

```
ThemeModeButton/
  ThemeModeButton.tsx
  ThemeModeButton.module.scss
  ThemeModeButton.spec.tsx
  interfaces.ts
  index.ts
```

#### Props Interface

```typescript
// src/features/navbar/components/ThemeModeButton/interfaces.ts
import type { ThemePreference } from '../../../../theme'

export interface ThemeModeButtonProps {
  dataTestId?: string
  className?: string
  onPreferenceChange?: (newPreference: ThemePreference) => void
}
```

#### Cycle Order

**Decision:** `light -> dark -> system -> light` (starting from current preference)

**Rationale:**

- Natural progression: explicit light, explicit dark, then "let OS decide".
- System is last before looping, so users cycling casually hit both explicit modes before system.
- Consistent with common tri-state toggles (on/off/auto).

#### Icons

**Verified icons from react-icons/md (grep evidence from node_modules/react-icons/md/index.d.ts):**

| Preference | Icon                   | Export Verified |
| ---------- | ---------------------- | --------------- |
| `light`    | `MdLightMode`          | Yes             |
| `dark`     | `MdDarkMode`           | Yes             |
| `system`   | `MdSettingsBrightness` | Yes             |

**Alternative considered for system:** `MdBrightnessAuto` (also exists). Chose
`MdSettingsBrightness` because it visually suggests "settings/gear" combined with brightness,
implying "automatic/system" more clearly than `MdBrightnessAuto` (which looks like a plain
brightness slider).

#### Uses IconButton

**Yes.** The component wraps `src/shared/components/IconButton/` (already exists with proper
interface: `icon: IconType`, `aria-label: string`, size/variant/dataTestId props).

### 5. Accessibility Contract

#### ARIA Attributes

| Attribute       | Value                                                           |
| --------------- | --------------------------------------------------------------- |
| `role`          | Implicit `button` (semantic `<button>` element)                 |
| `aria-haspopup` | **NOT PRESENT** (it opens nothing)                              |
| `aria-expanded` | **NOT PRESENT** (it opens nothing)                              |
| `aria-label`    | Dynamic, localized, reflects CURRENT mode + optional next hint  |
| `aria-pressed`  | **NOT PRESENT** (not a toggle; 3 states don't fit pressed bool) |

#### Aria-Label Structure

**Decision:** Label reflects CURRENT preference, not next.

**Rationale:**

- Standard accessibility practice: screen readers announce what the control IS, not what it WILL DO.
- Action is implicit (button activates on press; users know pressing changes state).
- Hinting next would require 3 translations per language; current-only needs 3.

**i18n keys (new):**

```typescript
// TranslationDictionary.navbar additions
navbar: {
  // ... existing
  themeModeLight: string // "Light mode"
  themeModeDark: string // "Dark mode"
  themeModeSystem: string // "System theme"
}
```

**Translations:**

| Key                      | en           | es               |
| ------------------------ | ------------ | ---------------- |
| `navbar.themeModeLight`  | Light mode   | Modo claro       |
| `navbar.themeModeDark`   | Dark mode    | Modo oscuro      |
| `navbar.themeModeSystem` | System theme | Tema del sistema |

**aria-label format:** `"{currentModeLabel}"` (e.g., "Light mode" / "Modo claro")

**Note:** This replaces `navbar.lightMode` and `navbar.darkMode` usage in ThemeModeButton context.
Those keys remain for other potential uses but the button uses the new `themeMode*` keys for
consistency.

#### Announcer Integration

On preference change, announce via existing `themeAnnouncementSignal` pattern:

```typescript
// Announcement text
const modeName = t(`navbar.themeMode${capitalize(newPreference)}`)
setThemeAnnouncement(`${t('a11y.themeChangedTo')} ${modeName}`)
```

**Special case for 'system':** The announcement says "Theme changed to System theme", NOT "Theme
changed to Light mode (via system)". The user chose 'system'; that's what we announce. If they want
to know the resolved mode, they can observe the visual.

#### Keyboard Semantics

- **Enter:** Activate button -> cycle to next preference.
- **Space:** Activate button -> cycle to next preference.
- **Tab:** Focus moves to next focusable element (standard).

**e2e assertions:**

- `await button.press('Enter')` -> preference cycles.
- `await button.press('Space')` -> preference cycles.
- Screen reader announcement fires with correct text.

#### Touch Target

Minimum 44x44px (inherited from IconButton via design system `$touch-target-min`).

#### Icon Swap Differentiation

Icons are distinct shapes (sun, moon, gear+brightness), not differentiated by color alone. Passes
WCAG 1.4.1 Use of Color.

### 6. Deletion List

**Directories to DELETE:**

- `src/features/navbar/components/ThemeDropdown/` (entire directory: 5 files)

**i18n keys that become orphaned:**

Grep analysis:

- `navbar.selectTheme` - only used by ThemeDropdown trigger label
- `navbar.currentTheme` - only used by ThemeDropdown trigger label

**Note:** `navbar.lightMode` and `navbar.darkMode` are used by ThemeDropdown options AND potentially
by announcement text. After ThemeModeButton uses the new `navbar.themeMode*` keys, these MAY become
orphaned. However, to be conservative, KEEP them (they may be useful for future features). Only
delete the dropdown-specific keys.

**Keys to DELETE from TranslationDictionary:**

- `navbar.selectTheme`
- `navbar.currentTheme`

**Wait - these are used by other dropdowns?** No. Grep shows:

- `navbar.selectLanguage` -> LanguageDropdown
- `navbar.selectCountry` -> CountryDropdown
- `navbar.selectCurrency` -> CurrencyDropdown
- `navbar.currentLanguage` -> LanguageDropdown
- etc.

`selectTheme` and `currentTheme` are theme-specific. Safe to delete.

**E2E spec modifications:**

| File                                                | Action                                                         |
| --------------------------------------------------- | -------------------------------------------------------------- |
| `e2e/journeys/theme-persistence.spec.ts`            | Rewrite: dropdown -> button; add tri-state + system tests      |
| `e2e/journeys/navbar-controls.spec.ts`              | Update theme dropdown tests -> button tests                    |
| `e2e/journeys/accessibility.spec.ts`                | Remove theme dropdown a11y; add button a11y                    |
| `e2e/journeys/dropdown-keyboard-navigation.spec.ts` | REMOVE theme cases (not a listbox); keep lang/country/currency |

### 7. CONTRACTS.md Updates

**Version bump:** v3.0.0 -> v3.1.0

**Section 7.2 supersession:** Replace ThemeDropdown contract with ThemeModeButton contract.

**Changes to Section 3 (Theme Domain):**

- Update type definitions to show `ThemePreference` vs `ThemeMode`.
- Update signal structure documentation.
- Update ThemeProvider behavior (matchMedia listener for system mode).

**Changes to Section 10 (Acceptance Criteria):**

- Remove: "ThemeDropdown opens on click, shows light/dark with icons, selects on click/Enter"
- Remove: Theme-related listbox/dropdown items
- Add: "ThemeModeButton cycles light -> dark -> system on click"
- Add: "System preference follows OS in real-time (no reload)"
- Add: "Explicit 'system' choice persists to localStorage"
- Add: "FOUC script resolves 'system' via matchMedia"

### 8. Traceability (REQUIREMENTS-CHECKLIST.md)

**Task-3 rows to add (prefix THEME3-):**

| ID        | Requirement                                                  | Test Location                 |
| --------- | ------------------------------------------------------------ | ----------------------------- |
| THEME3-01 | ThemeModeButton replaces ThemeDropdown (not a dropdown)      | File existence check          |
| THEME3-02 | Cycle order: light -> dark -> system -> light                | Unit test + e2e               |
| THEME3-03 | Icon for light: MdLightMode                                  | Unit test                     |
| THEME3-04 | Icon for dark: MdDarkMode                                    | Unit test                     |
| THEME3-05 | Icon for system: MdSettingsBrightness                        | Unit test                     |
| THEME3-06 | aria-label reflects current preference (localized)           | Unit test                     |
| THEME3-07 | No aria-haspopup (not a popup trigger)                       | Unit test                     |
| THEME3-08 | Announcer announces preference change                        | Unit test                     |
| THEME3-09 | ThemePreference persists to localStorage                     | Unit test + e2e               |
| THEME3-10 | 'system' value in localStorage                               | e2e                           |
| THEME3-11 | System preference follows OS live (matchMedia listener)      | e2e with page.emulateMedia    |
| THEME3-12 | FOUC script resolves 'system' via matchMedia                 | e2e                           |
| THEME3-13 | Default preference is 'system' (new users)                   | Unit test + e2e               |
| THEME3-14 | ThemeDropdown directory DELETED                              | File system check             |
| THEME3-15 | e2e theme-persistence.spec.ts rewritten for tri-state        | e2e pass                      |
| THEME3-16 | e2e dropdown-keyboard-navigation.spec.ts theme cases removed | e2e pass                      |
| THEME3-17 | i18n keys: navbar.themeModeLight/Dark/System added (en+es)   | Translation file verification |
| THEME3-18 | i18n keys: navbar.selectTheme, currentTheme DELETED          | Translation file verification |
| THEME3-19 | 100% unit coverage maintained                                | Jest coverage report          |
| THEME3-20 | All e2e tests pass                                           | Playwright exit 0             |

**Superseded rows (mark as [SUPERSEDED], do not delete):**

- NAV2-02: ThemeDropdown replaces ThemeModeToggle -> superseded by THEME3-01
- DDL-* rows related to theme dropdown behavior (DDL-08 through DDL-18 theme-specific tests)

### 9. Bundle Impact Estimate

**Removed:**

- `ThemeDropdown/` wrapper (~200 lines TSX + SCSS)
- ThemeDropdown-specific tests (not shipped)
- Import of generic Dropdown in theme context (Dropdown stays for lang/country/currency)

**Added:**

- `ThemeModeButton/` (~80 lines TSX + minimal SCSS)
- `matchMedia` listener code (~20 lines in ThemeProvider)
- `osPrefersDarkSignal` (~5 lines)
- 3 new i18n keys (~50 chars x 2 languages = 100 chars)

**Net estimate:** ThemeDropdown was a thin wrapper (~200 LOC) using generic Dropdown.
ThemeModeButton is simpler (~100 LOC) using IconButton. The matchMedia listener adds ~25 LOC to
ThemeProvider.

**Expected impact:** Approximately **-100 to -200 bytes raw** (slight reduction).

Current: 220,599 B raw (within 224 KB budget). Expected: ~220,400-220,500 B raw (still within
budget).

**Gzip:** Minimal change; matchMedia pattern compresses well.

## Consequences

### Positive

- **Meets user requirement** exactly as stated.
- **Faster interaction** for theme changes (single click vs open/navigate/select).
- **Explicit system mode** makes OS-following discoverable and intentional.
- **Live OS-following** without page reload improves UX.
- **Slight bundle reduction** (simpler component than dropdown wrapper).
- **Consistent button pattern** aligns with user's mental model.

### Negative

- **Less discoverable options** (must cycle to see all 3 vs dropdown showing all at once).
- **Supersedes recent work** (ThemeDropdown from task-2, ~1 day old). Acceptable per user mandate.

### Neutral

- Existing `Announcer` and `themeAnnouncementSignal` reused.
- `IconButton` shared component reused.
- Same signal architecture, just extended with preference vs effective distinction.

## References

- ADR-0006: Theming Architecture (original theme domain)
- ADR-0007: Navbar Dropdown Interaction Pattern (what this partially supersedes for theme only)
- CONTRACTS.md v3.0.0 Section 7.2 (superseded)
- [prefers-color-scheme MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-color-scheme)
- [matchMedia MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window/matchMedia)
