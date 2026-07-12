# Test Architecture Audit for Foundation Template

**Date:** 2026-07-11  
**Auditor:** QA Engineer  
**Scope:** Task 10 Phase 1 read-only audit  
**Purpose:** Audit what downstream teams inherit when cloning this template

---

## Executive Summary

This audit evaluates the test architecture patterns that will be inherited by projects using this
repository as a boilerplate. The current state is **functional but improvable** with several
patterns that will create maintenance debt at scale.

**Key Numbers:**

- 192 e2e tests (Playwright, serial in CI)
- 61 Jest suites, 100% coverage x4 thresholds enforced
- 11 istanbul-ignore pragmas (all adjudicated legitimate)
- 48 hard-sleep `waitForTimeout` calls in e2e specs
- 58 focus assertions (FLAKE-1 discipline applied inconsistently)

---

## 1. FLAKE RESISTANCE

### 1.1 Hard Sleeps (`waitForTimeout`) Catalogue

| File                               | Count  | Concern                                                     |
| ---------------------------------- | ------ | ----------------------------------------------------------- |
| `menu-theme-scroll-resize.spec.ts` | 22     | Highest concentration; waits for CSS animations (200-500ms) |
| `geo-detection.spec.ts`            | 10     | Waits for async detection flows (500-1500ms)                |
| `currency-conversion.spec.ts`      | 4      | Waits for rate fetching (1000ms)                            |
| `geo-mock.ts` (helper)             | 1      | Tracking wait (500ms)                                       |
| **TOTAL**                          | **48** | -                                                           |

**Severity:** MEDIUM  
**Evidence:** `grep -rn "waitForTimeout" e2e/ --include="*.ts"` returns 48 occurrences in project
code.

**Assessment:** These represent timing fragility. Under resource contention (CI load, slow
machines), 300ms may not be enough for animation completion. The geo-detection 1000-1500ms waits are
necessary for async flows but undocumented as to why those specific values.

**Recommendation (S-sized):** Replace animation waits with `waitForFunction` targeting animation
completion states (CSS `animationend` or computed style checks). Document geo detection timing
requirements in spec comments.

### 1.2 FLAKE-1 Focus Discipline Analysis

**The Pattern:** Task 5 established a discipline documented in
`dropdown-keyboard-navigation.spec.ts`:

```typescript
// CRITICAL: Wait for deferred focus to settle before sending keys
await expect(enOption).toBeFocused()
```

**Application Coverage:**

| Spec File                              | Applied? | Evidence                                |
| -------------------------------------- | -------- | --------------------------------------- |
| `dropdown-keyboard-navigation.spec.ts` | YES      | All 18 keyboard tests await focus       |
| `menu-theme-scroll-resize.spec.ts`     | PARTIAL  | Only 1 focus await at line 323          |
| `accessibility.spec.ts`                | NO       | Uses `.focus()` without await-assertion |
| `navbar-controls.spec.ts`              | NO       | Uses `.focus()` without await-assertion |

**Severity:** MEDIUM  
**S/M/L:** M (requires updating multiple files)

**Assessment:** The discipline that fixed FLAKE-1 is documented but not universally applied.
`accessibility.spec.ts` line 13, 73, 76, 79, 82 and `navbar-controls.spec.ts` lines 49, 108, 119,
194 use raw `await trigger.focus()` without the subsequent `await expect(...).toBeFocused()` gate.

### 1.3 Serial-Only Assumptions

**Current Config (playwright.config.cjs):**

```javascript
fullyParallel: true,
workers: process.env.CI ? 1 : undefined,
```

**Assessment:** Config claims `fullyParallel: true` but CI forces `workers: 1` (serial). This is
correct given:

1. **Focus Contention:** Multiple browser instances competing for focus would break keyboard
   navigation tests. The deferred-focus setTimeout(0) mechanism cannot guarantee focus when another
   window steals it.

2. **LocalStorage State:** Tests manipulate `localStorage` without isolation. Parallel tests would
   corrupt each other's state.

3. **Geo Detection Routing:** Route mocks in fixtures apply globally; parallel tests would conflict.

**Severity:** INFO (documented limitation, not a defect)  
**Template Guidance Required:** Yes - downstream teams MUST understand parallel e2e is not viable
without architectural changes (page-level localStorage namespace, isolated contexts per test).

---

## 2. RUN-TIME BUDGET

### 2.1 Current Measurements

| Metric          | Value            | Trend                  |
| --------------- | ---------------- | ---------------------- |
| Total E2E Tests | 192              | +99 since task 2       |
| Serial Run Time | ~1.6-2.1 minutes | Linear growth per task |
| Test Files      | 12               | -                      |
| Total Lines     | 3,303            | -                      |

**Growth Pattern:** Each feature task adds 10-25 e2e tests. At current trajectory:

- Task 15: ~250 tests, ~2.5-3 min
- Task 20: ~300 tests, ~3-4 min
- Task 30: ~400 tests, ~5-6 min

**Severity:** LOW (acceptable for now)  
**Threshold:** When serial time exceeds 5 minutes, consider:

1. Test splitting by journey vs. regression categories
2. Parallel-safe refactoring (isolated contexts)
3. Visual regression as a gate rather than exhaustive e2e

### 2.2 Parallelization Feasibility

**What Would Break:**

1. 58 focus assertions - would race
2. 28 viewport changes - would conflict with window state
3. Route mocking via `blockGeoDetection` fixture - applies at page level, not context level

**Effort Estimate:** L (Large) - Would require:

- Context-per-test architecture
- Isolated localStorage keys per worker
- Rewriting fixtures to be context-scoped

---

## 3. PATTERN CONSISTENCY

### 3.1 Mock Architecture: Fixtures vs Per-Spec

**Current State: Two Competing Patterns**

**Pattern A - Fixtures (`e2e/helpers/fixtures.ts`):**

- Blessed pattern via `test.extend`
- Provides `blockGeoDetection` fixture that auto-applies
- Mocks: geo APIs aborted, rate endpoints with deterministic data
- Used by: 10 of 12 spec files

**Pattern B - Per-Spec Route Mocks:**

- Used in: `currency-conversion.spec.ts`, `language-selection.spec.ts`, `geo-detection.spec.ts`
- Duplicates rate mocking logic
- Different mock values from fixtures

**Evidence:**

```typescript
// fixtures.ts: valor: 3284.6715
// currency-conversion.spec.ts: valor: 3284.6715 (matches)
// But fixtures lacks CNY/JPY while currency-conversion.spec.ts has them
```

**Severity:** LOW  
**S/M/L:** S (document blessed pattern, consolidate CNY/JPY into fixtures)

### 3.2 State Reset Duplication

**Pattern:** `localStorage.clear()` in `beforeEach` across 15+ spec files.

**Files with signal reset in beforeEach:**

- `App.spec.tsx` (duplicated for two describe blocks)
- `Navbar.spec.tsx`
- `LanguageDropdown.spec.tsx`
- `CountryDropdown.spec.tsx`
- `CurrencyDropdown.spec.tsx`
- `ThemeModeButton.spec.tsx`
- `Greeting.spec.tsx`
- (and 8 more)

**Assessment:** No shared `test-utils/reset-state.ts` exists. The App.spec.tsx has the most
comprehensive reset (6 signals), manually duplicated in the geo-detection describe block.

**Severity:** MEDIUM  
**S/M/L:** S (create `src/shared/test/reset-state.ts` exported from test-utils)

### 3.3 Jest Setup Global Mocks

**Location:** `jest-setup.ts`  
**Contents:**

| Mock                               | Purpose                    | Documented?   |
| ---------------------------------- | -------------------------- | ------------- |
| `Element.prototype.scrollIntoView` | Mobile menu focus handling | YES (comment) |
| `window.matchMedia`                | Theme detection tests      | NO            |
| `window.requestAnimationFrame`     | Sync focus for assertions  | YES (comment) |
| `window.cancelAnimationFrame`      | No-op                      | NO            |
| `ResizeObserver`                   | useDropdownPosition hook   | YES (comment) |

**Severity:** LOW  
**Assessment:** 3 of 5 mocks documented. Template users should know these exist.

---

## 4. COVERAGE INTEGRITY

### 4.1 Istanbul Ignore Adjudication

| File                          | Pragma                                     | Verdict    | Reason                                                                                                       |
| ----------------------------- | ------------------------------------------ | ---------- | ------------------------------------------------------------------------------------------------------------ |
| `Dropdown.tsx:108`            | `istanbul ignore else`                     | LEGITIMATE | Comment states "all 4 keys tested" - the else branch is defensive and unreachable given the includes() guard |
| `theme-signal.ts:17`          | `istanbul ignore next -- SSR guard`        | LEGITIMATE | `typeof window` check unreachable in browser-only codebase                                                   |
| `side-effects.ts:8`           | `istanbul ignore else -- SSR guard`        | LEGITIMATE | Same as above                                                                                                |
| `ThemeProvider.tsx:37`        | `istanbul ignore if -- SSR guard`          | LEGITIMATE | Same as above                                                                                                |
| `http.ts:11`                  | `istanbul ignore next -- timeout callback` | LEGITIMATE | Timeout callback fires only on slow networks                                                                 |
| `env.ts:14`                   | `istanbul ignore next`                     | LEGITIMATE | `process.env` fallback for non-Vite environments                                                             |
| `rates-signal.ts:61`          | `istanbul ignore next`                     | LEGITIMATE | Guard for null rate entries (defensive)                                                                      |
| `BanxicoRatesAdapter.ts:52`   | `istanbul ignore next`                     | LEGITIMATE | Guard for invalid cross-rate (defensive)                                                                     |
| `GeoDetectionAdapter.ts:65`   | `istanbul ignore else -- defense-in-depth` | LEGITIMATE | Comment explains it                                                                                          |
| `ReverseGeocodeAdapter.ts:14` | `istanbul ignore next -- timeout callback` | LEGITIMATE | Same as http.ts                                                                                              |
| `IpGeoAdapter.ts:12`          | `istanbul ignore next -- timeout callback` | LEGITIMATE | Same as http.ts                                                                                              |

**Total: 11 pragmas, 11 legitimate**  
**Verdict:** No coverage laundering detected. All pragmas are SSR guards or defensive branches that
cannot be reached in the test environment.

### 4.2 Dead-Test Candidates

**Tests that exist only to cover otherwise-dead code:** NONE FOUND

All 61 test suites exercise live application code paths that contribute to user journeys.

---

## 5. E2E BLIND SPOTS FOR A TEMPLATE

### 5.1 No Visual Regression Harness

**Status:** Not configured  
**Impact:** Theme changes, CSS regressions, and layout shifts are caught only by manual review or
explicit pixel assertions in e2e tests.

**Severity:** MEDIUM  
**S/M/L:** M (requires Playwright visual comparison setup, baseline image storage)  
**In-Scope Fixable:** YES (add `toHaveScreenshot()` calls to key journeys)

### 5.2 Chromium-Only Browser Coverage

**Current:** `projects: [{ name: 'chromium', ... }]`  
**Missing:** Firefox, WebKit (Safari)

**Impact:** Browser-specific CSS bugs, focus behavior differences, and Safari-specific issues will
not be caught.

**Severity:** MEDIUM  
**S/M/L:** S (add project configs in playwright.config.cjs)  
**In-Scope Fixable:** YES, but increases CI time 3x

### 5.3 No Automated A11Y Scan

**Current:** Manual ARIA assertions scattered across `accessibility.spec.ts`  
**Missing:** axe-core integration

**Evidence:** `grep -rn "axe\|@axe-core" e2e/` returns no matches in project code.

**Severity:** HIGH (for a production template)  
**S/M/L:** S (add `@axe-core/playwright`, add scan to smoke test)  
**In-Scope Fixable:** YES

### 5.4 Mobile Emulation Coverage

**Current:** Manual viewport resizing via `setViewportSize()`  
**Counts:** 28 viewport changes across tests

**Missing:** Touch emulation, device-specific viewport projects (iPhone, Android)

**Severity:** LOW  
**S/M/L:** M (add device projects to playwright config)  
**In-Scope Fixable:** YES

---

## 6. S-SIZED FIXABLES (Bounded, Low-Risk)

1. **Document parallel-safety limitation** in README or TESTING.md
2. **Add `@axe-core/playwright`** to package.json and add one smoke-test scan
3. **Create `src/shared/test/reset-state.ts`** with centralized signal reset
4. **Document jest-setup.ts mocks** with purpose comments
5. **Add Firefox/WebKit projects** to playwright.config.cjs (flag as optional for CI time)
6. **Consolidate CNY/JPY mocks** into fixtures.ts

---

## 7. DEAD CODE REGISTER CANDIDATES (Test Files)

**None identified.** All test files have corresponding live code and are exercised in CI.

---

## Appendix: Evidence Commands

```bash
# Hard sleep count
grep -rn "waitForTimeout" e2e/ --include="*.ts" | wc -l  # 48

# Focus assertion count
grep -rn "toBeFocused" e2e/journeys --include="*.ts" | wc -l  # 58

# Istanbul ignore count
grep -rn "istanbul ignore" src --include="*.ts" --include="*.tsx" | wc -l  # 11

# Test file count
find src -name "*.spec.ts" -o -name "*.spec.tsx" | wc -l  # 61

# E2E test count
cd e2e && pnpm exec playwright test --list 2>&1 | grep "spec\.ts" | wc -l  # 192
```
