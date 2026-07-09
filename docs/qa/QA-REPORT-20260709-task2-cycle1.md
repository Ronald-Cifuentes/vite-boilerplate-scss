# QA Report: Task 2 Cycle 1 - Navbar Dropdowns + Currency

**Date:** 2026-07-09 **QA Engineer:** QA-Engineer Agent **Iteration:** 4 **Status:** FAILED

---

## Executive Summary

Task 2 implementation has critical defects in keyboard navigation. The dropdown components work
correctly with mouse interaction and basic Enter/Space keyboard triggers, but the ADR-0007 keyboard
contract (ArrowDown/ArrowUp/Home/End navigation within open dropdowns) fails in a real browser
environment despite passing in JSDOM unit tests.

---

## Seeded Defects Status

### DEF-B1: Bundle Size Over Budget (CONFIRMED)

- **Severity:** Medium
- **Owner:** frontend-engineer
- **Evidence:** `pnpm build` output shows `dist/assets/index-C7nB0tkh.js 220.56 kB | gzip: 69.78 kB`
- **Analysis:**
  - Raw bundle: 220.56 kB > 220 KB (rev.2 limit)
  - Gzip bundle: 69.78 kB <= 70 KB (within limit) but > 68 KB (alert threshold)
- **Status:** OPEN - requires performance-engineer analysis for tree-shaking opportunities

### FE-005: Dropdown Keyboard Navigation Timing (CONFIRMED AS REAL DEFECT)

- **Severity:** High
- **Owner:** frontend-engineer
- **Evidence:** New e2e test `e2e/journeys/dropdown-keyboard-navigation.spec.ts` - 13/13 tests
  FAILED
- **Root Cause Analysis:**
  - The `Dropdown.tsx` component uses `@preact/signals-react` for state management
  - The `useEffect` that calls `.focus()` on options fires based on signal value changes
  - In JSDOM (unit tests): signal updates and React effects are synchronous - tests pass
  - In real Chromium (e2e): signal updates have async timing - focus() calls don't execute before
    the assertion
- **Failure Pattern:**
  ```
  Error: expect(locator).toBeFocused() failed
  Locator: getByTestId('app-navbar-language-option-en')
  Expected: focused
  Received: inactive
  ```
  - The element has `tabindex="0"` and CSS class `_option--focused_` but `document.activeElement` is
    not the element
- **Status:** OPEN - FE must fix focus management to work in real browsers

---

## CONTRACTS.md Section 10 Acceptance Criteria

### Machine-Verifiable Gates

| Criterion                              | Status | Evidence                               |
| -------------------------------------- | ------ | -------------------------------------- |
| `pnpm exec tsc --noEmit` exits 0       | PASS   | Exit code 0                            |
| `pnpm test` exits 0 with 100% coverage | PASS   | 39 suites, 435 tests, 100% all metrics |
| `pnpm exec playwright test` exits 0    | FAIL   | 43/56 pass, 13 new keyboard tests fail |
| No hardcoded hex/rgb/hsl in SCSS       | PASS   | grep found no matches                  |
| No `@media (max-width` in SCSS         | PASS   | grep found no matches                  |
| Old cycle button directories deleted   | PASS   | find found no matches                  |

### Functional Criteria

| Criterion                                             | Status | Evidence                                            |
| ----------------------------------------------------- | ------ | --------------------------------------------------- |
| LanguageDropdown opens, shows options with icons      | PASS   | e2e navbar-controls.spec.ts passes                  |
| ThemeDropdown opens, shows light/dark with icons      | PASS   | e2e navbar-controls.spec.ts passes                  |
| CountryDropdown opens, shows 4 countries with icons   | PASS   | e2e navbar-controls.spec.ts passes                  |
| CurrencyDropdown opens, shows 4 currencies with icons | PASS   | e2e navbar-controls.spec.ts passes                  |
| Dropdowns close on Escape                             | FAIL   | Works with mouse close, but focus management broken |
| Dropdowns close on click-outside                      | PASS   | e2e passes                                          |
| Dropdowns close on Tab                                | FAIL   | Keyboard focus not reaching options                 |
| Focus returns to trigger on close                     | FAIL   | Focus management broken                             |
| Arrow keys navigate options                           | FAIL   | FE-005 - 0 of 13 keyboard e2e tests pass            |
| Selection announced via aria-live                     | PASS   | Unit specs verify announcement                      |
| Currency persists independently of region             | PASS   | CurrencyDropdown.spec.tsx tests this                |
| Currency defaults to region default                   | PASS   | CurrencyProvider.spec.tsx tests this                |
| Greeting displays price in selected currency          | PASS   | e2e currency-selection.spec.ts passes               |

### Accessibility Criteria

| Criterion                                                    | Status | Evidence                         |
| ------------------------------------------------------------ | ------ | -------------------------------- |
| aria-haspopup on triggers                                    | PASS   | Unit tests verify                |
| aria-expanded reflects state                                 | PASS   | Unit + e2e tests verify          |
| aria-controls/labelledby relationships                       | PASS   | Unit tests verify                |
| aria-selected on options                                     | PASS   | Unit tests verify                |
| Screen reader announcement                                   | PASS   | Announcer component integration  |
| Keyboard navigation (Enter/Space/Arrows/Home/End/Escape/Tab) | FAIL   | Only Enter/Space work in browser |
| Touch targets >= 44px                                        | PASS   | e2e min touch target test passes |

### Architecture Criteria

| Criterion                                 | Status | Evidence                              |
| ----------------------------------------- | ------ | ------------------------------------- |
| Currency domain follows hexagonal pattern | PASS   | Code structure verified               |
| Generic Dropdown in shared/components     | PASS   | src/shared/components/Dropdown exists |
| Feature dropdowns are thin wrappers       | PASS   | Code review                           |
| Icons only from react-icons/md            | PASS   | All imports verified                  |

---

## Additional Findings

### DEF-Q1: Missing Icon Assertions in Dropdown Specs (Medium)

- **Severity:** Medium
- **Owner:** frontend-engineer
- **Location:** All navbar dropdown spec files
- **Description:** None of the dropdown specs (LanguageDropdown, ThemeDropdown, CountryDropdown,
  CurrencyDropdown) assert that icon elements are present inside dropdown options.
- **Requirement Violated:** User requirement #4: "In dropdown popups, there must be icons to
  accompany the text"
- **Evidence:** `grep -rn "icon\|Icon\|svg"` found no assertions in navbar dropdown specs
- **Recommended Fix:** Add tests that verify `<svg>` or icon elements exist inside each dropdown
  option

### DEF-Q2: waitForTimeout Usage in E2E Tests (Low)

- **Severity:** Low
- **Owner:** frontend-engineer
- **Location:**
  - `e2e/journeys/navbar-controls.spec.ts:42`
  - `e2e/journeys/country-selection.spec.ts:158,169,179`
- **Description:** Tests use `waitForTimeout(100)` which is a timing hack rather than waiting for
  specific conditions
- **Impact:** Tests may be flaky under load; indicates underlying timing issues with signal
  propagation
- **Evidence:** grep found 4 instances

---

## Test Quality Spot-Check

### Unit Test Quality

| File                        | Quality    | Issues                                    |
| --------------------------- | ---------- | ----------------------------------------- |
| `Dropdown.spec.tsx`         | Good       | Comprehensive ARIA, keyboard, mouse tests |
| `LanguageDropdown.spec.tsx` | Acceptable | Missing icon presence assertion           |
| `ThemeDropdown.spec.tsx`    | Acceptable | Missing icon presence assertion           |
| `CountryDropdown.spec.tsx`  | Acceptable | Missing icon presence assertion           |
| `CurrencyDropdown.spec.tsx` | Acceptable | Missing icon presence assertion           |

No `expect(true)`, `.skip`, or `.only` patterns found.

### E2E Test Quality

| File                                   | Quality | Issues                                         |
| -------------------------------------- | ------- | ---------------------------------------------- |
| `navbar-controls.spec.ts`              | Good    | 1 waitForTimeout hack                          |
| `country-selection.spec.ts`            | Good    | 3 waitForTimeout hacks                         |
| `dropdown-keyboard-navigation.spec.ts` | Good    | All assertions valid; tests reveal real defect |

---

## Verified Decorative Sweep

All interactive elements checked:

| Element                  | Location | Has Handler        | Verdict |
| ------------------------ | -------- | ------------------ | ------- |
| LanguageDropdown trigger | Navbar   | Yes - onChange     | PASS    |
| ThemeDropdown trigger    | Navbar   | Yes - onChange     | PASS    |
| CountryDropdown trigger  | Navbar   | Yes - onChange     | PASS    |
| CurrencyDropdown trigger | Navbar   | Yes - onChange     | PASS    |
| Dropdown options (all)   | Popups   | Yes - onClick      | PASS    |
| Skip to content link     | App      | Yes - href="#main" | PASS    |

No empty onClick handlers found. No href="#" or href="" links found.

---

## Mobile-First Verification

- **MF-01:** No `@media (max-width` queries found - PASS
- **MF-02:** `_responsive.scss` uses only min-width - PASS (verified in task 1)
- **MF-03:** Base styles are mobile - PASS (e2e 375px viewport tests pass)
- **Viewport Coverage:** e2e tests run at 375px, 768px, 1440px - PASS

---

## Requirements Checklist Summary

| Section                 | Total | Passed | Failed | Blocked |
| ----------------------- | ----- | ------ | ------ | ------- |
| DDL (Dropdown)          | 17    | 13     | 4      | 0       |
| NAV2 (Navbar Dropdowns) | 11    | 11     | 0      | 0       |
| CURR (Currency)         | 10    | 10     | 0      | 0       |
| MF (Mobile-First)       | 3     | 3      | 0      | 0       |
| FUNC (Functional)       | 3     | 3      | 0      | 0       |
| QUALITY2                | 7     | 5      | 2      | 0       |

Failed requirements:

- DDL-08, DDL-09, DDL-10, DDL-11: Keyboard navigation in open dropdown
- QUALITY2-02: All e2e tests pass (keyboard tests fail)

---

## Defect Summary

| ID     | Severity | Status | Owner             | Description                                  |
| ------ | -------- | ------ | ----------------- | -------------------------------------------- |
| DEF-B1 | Medium   | OPEN   | frontend-engineer | Bundle size 220.56 kB > 220 KB limit         |
| FE-005 | High     | OPEN   | frontend-engineer | Keyboard focus not working in real browser   |
| DEF-Q1 | Medium   | OPEN   | frontend-engineer | Missing icon assertions in specs             |
| DEF-Q2 | Low      | OPEN   | frontend-engineer | waitForTimeout usage indicates timing issues |

---

## Recommendations

1. **FE-005 (Critical):** The focus management issue requires investigation of signal timing.
   Consider:
   - Using `queueMicrotask()` or `requestAnimationFrame()` before `.focus()` call
   - Using a ref callback pattern instead of useEffect for immediate focus
   - Adding a small delay (5-10ms) between signal update and focus call

2. **DEF-B1:** Performance engineer should analyze tree-shaking opportunities in react-icons

3. **DEF-Q1:** Add explicit icon assertions to all dropdown component specs

4. **DEF-Q2:** Replace `waitForTimeout` with proper `waitFor` conditions

---

## Exit Gate Status

- QA/report.md empty: **FAIL** (4 defects open)
- tsc --noEmit exit 0: **PASS**
- pnpm test exit 0: **PASS**
- playwright exit 0: **FAIL** (13 new keyboard tests fail)
- Sonar: Not available (sonarqube-mcp not configured)
- Coverage thresholds: **PASS** (100% all metrics)

**Overall Status: FAILED**

Handoff to frontend-engineer to fix FE-005 (keyboard focus management).
