# QA Report: Task 2 Cycle 2 - Scope-Limited Re-Validation

**Date:** 2026-07-09 **QA Engineer:** QA-Engineer Agent **Iteration:** 7 **Status:** FAILED

---

## Executive Summary

Cycle 2 re-validation after FE fix round 3. Three of four cycle-1 defects are CLOSED. FE-005
keyboard navigation fix verified working (13/13 e2e tests pass). DEF-Q1 and DEF-Q2 resolved. DEF-B1
(bundle size) remains open per orchestrator directive (performance-engineer + human escalation).

**New critical finding: DEF-A11Y-1** - Closed dropdown panels lack aria-hidden, exposing phantom
options to screen readers.

---

## Cycle-1 Defect Closure Table

| ID     | Severity | Status | Evidence                                                                           |
| ------ | -------- | ------ | ---------------------------------------------------------------------------------- |
| FE-005 | HIGH     | CLOSED | 13/13 keyboard e2e tests pass; playwright exit 0, 56/56 total                      |
| DEF-B1 | MEDIUM   | OPEN   | 220,712 B > 220,000 limit; deferred to performance-engineer per orchestrator       |
| DEF-Q1 | MEDIUM   | CLOSED | All 4 dropdown specs have `describe('Icon presence (DEF-Q1)')` with svg assertions |
| DEF-Q2 | LOW      | CLOSED | `grep -rn "waitForTimeout" e2e/journeys/` exits 1 (no matches)                     |

---

## Adjudication: FE Test Modification (Line 310)

**File:** `e2e/journeys/dropdown-keyboard-navigation.spec.ts:310`

**Change:**

```diff
- await expect(trigger).toHaveAccessibleName(/mxn/i)
+ await expect(trigger).toHaveAccessibleName(/mexican peso/i)
```

**FE Justification:** "aria-label uses localized name per ADR-0007"

**QA Investigation:**

1. ADR-0007 Section "ARIA Attributes" specifies:

   > `aria-label: Localized, e.g., "Language, current: English"`

2. CurrencyDropdown.tsx:59-60:

   ```typescript
   const currentCurrencyName = t(`currency.${currency.toLowerCase()}` as 'currency.usd')
   const triggerLabel = `${t('navbar.selectCurrency')}, ${t('navbar.currentCurrency')}: ${currentCurrencyName}`
   ```

3. Translation verification (en.ts:37):
   ```typescript
   mxn: 'Mexican Peso',
   ```

**RULING: LEGITIMATE**

The aria-label correctly uses the localized currency name "Mexican Peso" per ADR-0007's requirement
for localized labels. The original test asserting `/mxn/i` (the currency code) was incorrect. This
is a valid test fix, not test-fitting.

---

## Adjudication: A11Y-REG-1 (Closed Panel Accessibility)

### Investigation

**DropdownPanel.tsx:15-22:**

```tsx
return (
  <div
    id={id}
    role='listbox'
    aria-labelledby={ariaLabelledby}
    className={panelClasses}
    tabIndex={-1}
    data-testid={dataTestId}
  >
    {children}
  </div>
)
```

**Dropdown.module.scss:59-71:**

```scss
.panel {
  // Hidden state - use opacity and pointer-events instead of visibility
  // This avoids focus issues with visibility: hidden transitions
  opacity: 0;
  pointer-events: none;
  transform: translateY(-8px);
  // ...
  &--open {
    opacity: 1;
    pointer-events: auto;
    transform: translateY(0);
  }
}
```

### Problem

Opacity-0 elements REMAIN in the accessibility tree. Screen reader browse mode (e.g., VoiceOver
rotor, JAWS virtual cursor, NVDA browse mode) can navigate to these "hidden" elements. With 4
dropdowns containing 2-4 options each, users encounter up to ~14 phantom listbox items in the navbar
when all dropdowns are closed.

### Evidence

- DropdownPanel.tsx: NO `aria-hidden` attribute present
- Dropdown.module.scss: Uses ONLY `opacity: 0; pointer-events: none` for closed state
- accessibility.spec.ts: NO axe-core scan that would detect this violation
- No e2e test asserts closed panels are hidden from AT

### Contract Violation

WAI-ARIA APG Listbox Pattern (referenced in ADR-0007):

> When the listbox popup is hidden, the button has aria-expanded set to false.

The popup must be semantically hidden from AT when `aria-expanded="false"`. Using only CSS opacity
does not satisfy this requirement.

### RULING: DEFECT - DEF-A11Y-1

| Field        | Value                                                                                                                               |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------------- |
| ID           | DEF-A11Y-1                                                                                                                          |
| Severity     | HIGH                                                                                                                                |
| Owner        | frontend-engineer                                                                                                                   |
| File         | `src/shared/components/Dropdown/DropdownPanel.tsx:15-22`                                                                            |
| Description  | Closed panels use opacity:0 but lack aria-hidden, exposing content to AT                                                            |
| Reproduction | 1. Load app 2. Do NOT open any dropdown 3. Use screen reader browse mode 4. Navigate navbar - phantom listbox options are reachable |
| Expected     | Closed dropdown panels should be hidden from screen readers                                                                         |
| Actual       | All options from all 4 closed dropdowns are navigable in browse mode                                                                |
| Fix          | Add `aria-hidden={!isOpen}` to the panel div in DropdownPanel.tsx                                                                   |

**Note:** Options already have `tabindex=-1` when closed, so focus-trap risk from aria-hidden is
nil.

---

## Adjudication: ARCH-REG-1 (Build Target Change)

### Investigation

**vite.config.ts:7-10:**

```typescript
build: {
  // Target modern browsers to reduce polyfills
  target: 'esnext',
},
```

### Check for Browser Support Documentation

- `.browserslistrc`: Does not exist
- `package.json`: No `browserslist` field
- `docs/architecture/CONTRACTS.md`: No browser support matrix defined
- `README.md`: Not checked (not in scope)

### RULING: FINDING (INFO) - ARCH-REG-1

| Field       | Value                                                                  |
| ----------- | ---------------------------------------------------------------------- |
| ID          | ARCH-REG-1                                                             |
| Severity    | INFO                                                                   |
| Owner       | architect/human                                                        |
| File        | `vite.config.ts:9`                                                     |
| Description | Undocumented `build.target: 'esnext'` change affects browser support   |
| Impact      | ES2024+ syntax only; older browsers (Safari 16-, Chrome 114-) may fail |
| Action      | Document browser support matrix in CONTRACTS.md or ADR, or revert      |

No explicit contract violation since no browser support matrix was declared. However, implicit
production expectations typically include Safari 15+ / Chrome 90+. This finding is informational for
architect/human decision.

---

## Requirements Checklist Delta

### Updated Rows (Post Cycle 2)

| ID          | Previous | New | Evidence                                                              |
| ----------- | -------- | --- | --------------------------------------------------------------------- |
| DDL-08      | [~]      | [x] | All Enter/Space tests pass (13/13 keyboard e2e)                       |
| DDL-09      | [FAIL]   | [x] | Arrow navigation works in real browser (keyboard e2e)                 |
| DDL-10      | [FAIL]   | [x] | Home/End work in real browser (keyboard e2e)                          |
| DDL-11      | [FAIL]   | [x] | Escape closes + returns focus (keyboard e2e)                          |
| DDL-14      | [~]      | [x] | Icon assertions added per DEF-Q1 fix                                  |
| QUALITY2-02 | [FAIL]   | [x] | All 56 e2e tests pass (playwright exit 0)                             |
| QUALITY2-05 | [~]      | [~] | 220,712 B raw > 220,000 limit; gzip 68,947 B < 70,000 OK; DEF-B1 open |

### New Finding Added

| ID           | Status | Evidence                                   |
| ------------ | ------ | ------------------------------------------ |
| DDL-18 (new) | [FAIL] | DEF-A11Y-1: Closed panels lack aria-hidden |

---

## Final Defect Summary

| ID         | Severity | Status | Owner             | Description                      |
| ---------- | -------- | ------ | ----------------- | -------------------------------- |
| DEF-B1     | MEDIUM   | OPEN   | perf-eng/human    | Bundle 220,712 B > 220,000 limit |
| DEF-A11Y-1 | HIGH     | OPEN   | frontend-engineer | Closed panels lack aria-hidden   |
| ARCH-REG-1 | INFO     | OPEN   | architect/human   | Undocumented esnext build target |

---

## DEF-Q1 Evidence (Icon Assertions)

All four dropdown specs now contain DEF-Q1 regression tests:

1. **LanguageDropdown.spec.tsx:179-205**
   - Line 187: `expect(trigger.querySelector('svg')).toBeInTheDocument()`
   - Line 188: `expect(trigger.textContent).toBe('')`
   - Lines 202-203: `expect(enOption.querySelector('svg')).toBeInTheDocument()`

2. **ThemeDropdown.spec.tsx:211-236**
   - Line 219: `expect(trigger.querySelector('svg')).toBeInTheDocument()`
   - Line 220: `expect(trigger.textContent).toBe('')`
   - Lines 234-235: `expect(lightOption.querySelector('svg'))...`

3. **CountryDropdown.spec.tsx:172-200**
   - Line 180: `expect(trigger.querySelector('svg')).toBeInTheDocument()`
   - Line 181: `expect(trigger.textContent).toBe('')`
   - Lines 197-200: All 4 country options svg assertions

4. **CurrencyDropdown.spec.tsx:200-230**
   - Line 208: `expect(trigger.querySelector('svg')).toBeInTheDocument()`
   - Line 209: `expect(trigger.textContent).toBe('')`
   - Lines 225-228: All 4 currency options svg assertions

---

## Exit Gate Status

| Gate                | Result | Evidence                                       |
| ------------------- | ------ | ---------------------------------------------- |
| tsc --noEmit exit 0 | PASS   | Exit code 0                                    |
| pnpm test exit 0    | PASS   | 39 suites, 445 tests, 100% coverage            |
| playwright exit 0   | PASS   | 56/56 tests pass                               |
| QA/report.md empty  | FAIL   | DEF-A11Y-1 (HIGH), DEF-B1 (MEDIUM), ARCH-REG-1 |
| Sonar clean         | N/A    | sonarqube-mcp not configured                   |

**Overall Status: FAILED**

Handoff to frontend-engineer to fix DEF-A11Y-1 (aria-hidden on closed panels).
