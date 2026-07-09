# QA Report: Task 3 Cycle 1 — ThemeModeButton (ADR-0009)

**Date:** 2026-07-09 **QA Engineer:** QA-Engineer Agent **Iteration:** 3 **Status:** PASSED

---

## Executive Summary

QA cycle 1 for Task 3 ThemeModeButton implementation validates the ADR-0009 tri-state cycle button
that supersedes ThemeDropdown. All 47 THEME3 requirements verified with artifact evidence. No
defects found.

**Final Verdict: PASSED**

---

## Scope Validation

### 1. DIFF-REVIEW: E2E Test Changes

**Objective:** Verify the 13 keyboard tests from task-2 for dropdowns were correctly updated, not
weakened.

**Prior state (HEAD commit):** 13 keyboard e2e tests in `dropdown-keyboard-navigation.spec.ts`

- Language Dropdown: 8 tests
- Theme Dropdown: 2 tests (ArrowDown/ArrowUp + Home/End)
- Country Dropdown: 1 test
- Currency Dropdown: 1 test
- Cross-dropdown: 1 test (all FOUR dropdowns)

**Current state:** 11 keyboard e2e tests

- Language Dropdown: 8 tests (UNCHANGED)
- Theme Dropdown: REMOVED (2 tests)
- Country Dropdown: 1 test (UNCHANGED)
- Currency Dropdown: 1 test (UNCHANGED)
- Cross-dropdown: 1 test (now tests THREE dropdowns - correctly updated)

**Removed tests are EXACTLY theme listbox cases:**

- `ArrowDown/ArrowUp navigation works with selection via Enter`
- `Home and End keys work`

**Replacement keyboard coverage for ThemeModeButton:**

- `navbar-controls.spec.ts:105-113`: Enter key cycles theme
- `navbar-controls.spec.ts:116-123`: Space key cycles theme
- `accessibility.spec.ts:182-196`: theme button is keyboard accessible (Enter/Space)

**Verdict:** No prior coverage weakened. Theme dropdown keyboard tests correctly removed; equivalent
button keyboard tests added.

### 2. jest-setup.ts matchMedia Mock

**Verified honest mock implementation:**

```typescript
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})
```

- Provides listener capture (addEventListener/removeEventListener)
- No tests asserting nothing
- ThemeProvider.spec.tsx uses the mock to verify listener cleanup

### 3. aria-hidden 4->3 Panels

**Evidence:** `accessibility.spec.ts:119-133`

```typescript
// Three dropdown panels should be hidden from screen readers when closed
// (Theme is now a button, not a dropdown - only 3 panels)
const langPanel = page.getByTestId('app-navbar-language-panel')
const countryPanel = page.getByTestId('app-navbar-country-panel')
const currencyPanel = page.getByTestId('app-navbar-currency-panel')
```

**Verdict:** Correctly updated from 4 to 3 panels; theme panel no longer exists.

---

## CONTRACTS Section 10 Acceptance Walk

| Criterion                                           | Result | Evidence                                                 |
| --------------------------------------------------- | ------ | -------------------------------------------------------- |
| `pnpm exec tsc --noEmit` exits 0                    | PASS   | Exit code 0                                              |
| `pnpm test` exits 0 with 100% coverage              | PASS   | 39 suites, 490 tests, 100% all metrics                   |
| `pnpm exec playwright test` exits 0                 | PASS   | 75/75 tests pass (e2e/pnpm test exit 0)                  |
| No hardcoded hex/rgb/hsl in SCSS                    | PASS   | arch test passes                                         |
| No @media (max-width in SCSS                        | PASS   | grep returns no matches                                  |
| All e2e journeys pass                               | PASS   | 75/75 chromium tests                                     |
| ThemeDropdown directory DELETED                     | PASS   | `ls` returns "No such file or directory"                 |
| ThemeModeButton cycles light -> dark -> system      | PASS   | ThemeModeButton.spec.tsx:76-98, e2e theme-persistence.ts |
| Icon changes per preference                         | PASS   | ThemeModeButton.spec.tsx:101-117, e2e navbar-controls.ts |
| ThemePreference persists to localStorage            | PASS   | localStorage.spec.ts, e2e theme-persistence.ts           |
| System preference follows OS in real-time           | PASS   | e2e theme-persistence.ts:110-143 (page.emulateMedia)     |
| FOUC script resolves 'system' via matchMedia        | PASS   | index.html:19-24, e2e theme-persistence.ts:174-225       |
| Default preference is 'system'                      | PASS   | config/themes.ts:4, e2e theme-persistence.ts:227-234     |
| Existing light/dark values honored                  | PASS   | e2e theme-persistence.ts:239-262                         |
| ThemeModeButton has NO aria-haspopup                | PASS   | ThemeModeButton.spec.tsx:58-62, e2e accessibility.ts:175 |
| ThemeModeButton has dynamic aria-label              | PASS   | ThemeModeButton.spec.tsx:65-73, e2e accessibility.ts:158 |
| Screen reader announces preference change           | PASS   | ThemeModeButton.spec.tsx:133-144                         |
| Keyboard Enter/Space cycles                         | PASS   | ThemeModeButton.spec.tsx:147-154, e2e navbar-controls.ts |
| Touch target >= 44px                                | PASS   | e2e navbar-controls.ts:154-162                           |
| ThemePreference type added                          | PASS   | types/Theme.ts:6                                         |
| ThemeMode type remains                              | PASS   | types/Theme.ts:12                                        |
| osPrefersDarkSignal tracks OS preference            | PASS   | signals/theme-signal.ts:16-19                            |
| effectiveThemeSignal computes resolved mode         | PASS   | signals/theme-signal.ts:25-30                            |
| ThemeProvider sets up matchMedia listener           | PASS   | adapters/ThemeProvider.tsx:60-75                         |
| i18n keys added: navbar.themeModeLight/Dark/System  | PASS   | en.ts:30-32, es.ts:30-32                                 |
| i18n keys removed: navbar.selectTheme, currentTheme | PASS   | grep returns "Keys not found"                            |

---

## Behavioral Spot-Probes

### a. System-mode live-follow

**E2E tests:** `theme-persistence.spec.ts:110-143`

- `system follows OS LIVE: dark -> light without reload` (line 110)
- `system follows OS LIVE: light -> dark without reload` (line 130)
- `explicit preference ignores OS changes` (line 145)

**Implementation:** Uses `page.emulateMedia({ colorScheme })` and asserts `data-theme` flips WITHOUT
page reload.

### b. aria-label content

**Unit spec:** `ThemeModeButton.spec.tsx:65-73`

- Tests all 3 preferences: system -> "System theme", light -> "Light mode", dark -> "Dark mode"

**i18n integration:**

- en.ts:30-32: themeModeLight/Dark/System keys
- es.ts:30-32: Modo claro/oscuro, Tema del sistema

### c. Announcer

**Unit spec:** `ThemeModeButton.spec.tsx:133-144`

- Announces next preference: "Dark mode", "System theme" with CONTRACTS-compliant text

### d. Persistence matrix

| Scenario                 | Test Location                             | Result |
| ------------------------ | ----------------------------------------- | ------ |
| Stored 'system' -> stays | e2e theme-persistence.ts:39-55            | PASS   |
| Legacy 'light' honored   | e2e theme-persistence.ts:239-250          | PASS   |
| Legacy 'dark' honored    | e2e theme-persistence.ts:251-262          | PASS   |
| Corrupted -> 'system'    | localStorage.spec.ts:60-62 (returns null) | PASS   |
| FOUC handles system      | e2e theme-persistence.ts:211-225          | PASS   |

### e. Icon-per-mode

**Unit spec:** `ThemeModeButton.spec.tsx:101-117`

- Tests 3 different SVG icons render per preference
- Verifies icon changes when cycling

**Component:** `ThemeModeButton.tsx:14-18`

```typescript
const PREFERENCE_ICONS: Record<ThemePreference, IconType> = {
  light: MdLightMode,
  dark: MdDarkMode,
  system: MdSettingsBrightness,
}
```

### f. Remaining 3 dropdowns aria-hidden

**E2E:** `accessibility.spec.ts:119-133`

- Tests exactly 3 panels (lang, country, currency)
- All have `aria-hidden="true"` on load
- Open panel transitions to `aria-hidden="false"` (line 135-155)

---

## Test Quality Check

| Check                | Result | Evidence                             |
| -------------------- | ------ | ------------------------------------ |
| No .skip/.only       | PASS   | grep returns no matches              |
| No expect(true)      | PASS   | grep returns no matches              |
| No waitForTimeout    | PASS   | grep returns no matches              |
| No snapshot-only     | PASS   | All specs have behavioral assertions |
| Mobile-first         | PASS   | No @media (max-width in src/         |
| Touch target asserts | PASS   | navbar-controls.ts:154-162 (>= 44px) |

---

## Bundle Size

| Metric | Actual    | Budget  | Status |
| ------ | --------- | ------- | ------ |
| Raw    | 221,845 B | 224,000 | PASS   |
| Gzip   | 69,411 B  | 70,000  | PASS   |

**Note:** Grew +1,246 B vs task-2 (220,599 B). FE attributed to: 2 new signals + matchMedia listener

- 3rd icon (MdSettingsBrightness) + i18n keys. Remains within budget.

---

## Defect List

**No defects found.**

---

## Exit Gate Evidence

| Gate                | Result | Evidence                                                                 |
| ------------------- | ------ | ------------------------------------------------------------------------ |
| tsc --noEmit exit 0 | PASS   | Exit code 0                                                              |
| pnpm test exit 0    | PASS   | 39 suites, 490 tests, 100% coverage (629/629, 140/140, 133/133, 598/598) |
| playwright exit 0   | PASS   | 75/75 tests pass                                                         |
| Sonar clean         | N/A    | sonarqube-mcp not configured                                             |
| QA report empty     | PASS   | 0 defects                                                                |
| Coverage thresholds | PASS   | 100% all metrics                                                         |
| Regression tests    | N/A    | No defects to add regression tests for                                   |

---

## Checklist Tally

| Category       | Total | Passed | Failed | Superseded |
| -------------- | ----- | ------ | ------ | ---------- |
| Phase 1        | 47    | 46     | 0      | 0          |
| Phase 2 Task 1 | 48    | 43     | 0      | 5          |
| Phase 2 Task 2 | 53    | 47     | 0      | 6          |
| Phase 2 Task 3 | 47    | 47     | 0      | 0          |
| **Total**      | 195   | 183    | 0      | 11         |

**Task 3 Status: ALL 47 REQUIREMENTS MET**

---

## Diff-Review Conclusion

**Was any prior coverage weakened?** NO

- 13 keyboard e2e tests reduced to 11 (2 theme listbox tests removed)
- Removed tests are exactly the theme dropdown listbox navigation cases
- Equivalent keyboard coverage for ThemeModeButton added in navbar-controls.spec.ts and
  accessibility.spec.ts
- Language/Country/Currency dropdown keyboard tests UNCHANGED
- aria-hidden tests correctly updated from 4 to 3 panels

---

## Handoff

**Next:** Orchestrator **Reason:** Task 3 QA cycle 1 PASSED — all gates green, all 47 requirements
verified, no defects. Ready for final sign-off.
