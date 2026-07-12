# QA Report - Task 8 Cycle 1

**Date:** 2026-07-11 **Task:** Navbar Fit + Transparency **Cycle:** 1 **Reviewer:** QA Engineer

## Verification Summary

All 7 verification items have been reviewed. One UX finding requires orchestrator adjudication.

---

## Item-by-Item Verdicts

### 1. FIT GATE QUALITY

**VERDICT: PASS**

The `navbar-fit.spec.ts` (246 lines) correctly implements all requirements:

| Check                                         | Result | Evidence                                                                                       |
| --------------------------------------------- | ------ | ---------------------------------------------------------------------------------------------- |
| Strict equality (scrollWidth === clientWidth) | PASS   | Line 31: `.toBe(clientWidth)` - no tolerance                                                   |
| 6 widths tested                               | PASS   | VIEWPORTS = [375, 768, 820, 1024, 1280, 1440]                                                  |
| Both themes tested                            | PASS   | THEMES = ['light', 'dark'] - 12 combinations                                                   |
| Post-open-close re-checks real                | PASS   | Lines 139-144: click trigger, wait aria-expanded=true, click outside, wait aria-expanded=false |
| Transparency uses computed style              | PASS   | Line 43: `getComputedStyle(nav).backgroundColor`                                               |
| Transparency check is rgba(0,0,0,0)           | PASS   | Line 46: expects `rgba(0,0,0,0)                                                                | transparent` |

E2E execution: **26/26 passed** (exit 0)

### 2. UX OF NEW ANIMATION

**VERDICT: PARTIAL PASS with finding for adjudication**

**Entrance animation analysis:**

| Token           | Old Value                           | New Keyframe Value                  | Match |
| --------------- | ----------------------------------- | ----------------------------------- | ----- |
| opacity from    | 0                                   | 0                                   | YES   |
| opacity to      | 1                                   | 1                                   | YES   |
| transform from  | translateY(-8px)                    | translateY(-8px)                    | YES   |
| transform to    | translateY(0)                       | translateY(0)                       | YES   |
| duration        | t.$transition-duration-fast = 150ms | t.$transition-duration-fast = 150ms | YES   |
| timing          | t.$transition-timing-default = ease | t.$transition-timing-default = ease | YES   |
| flip-up variant | translateY(8px)                     | translateY(8px)                     | YES   |
| reduced-motion  | @media guard in mixin               | @media guard inline                 | YES   |

**Exit animation analysis:**

| Behavior        | Old Pattern                               | New Pattern                   | Regression |
| --------------- | ----------------------------------------- | ----------------------------- | ---------- |
| Close animation | 150ms fade-out + slide via CSS transition | Instant snap via display:none | **YES**    |

**Finding UX-001:** The old visibility+opacity+pointer-events pattern animated the close transition
(150ms fade-out with translateY slide). The new display:none pattern removes the panel instantly
with no exit animation. This is a factual UX polish regression.

**Classification:** MEDIUM severity - UX polish regression, not broken functionality. Per gate
definitions in state.json, `dropdowns_still_correct` specifies functionality (positioning, keyboard,
click-through) not animation polish. However, user mandate states "UX is non-negotiable" -
**requires orchestrator adjudication**.

### 3. FE-005 NON-REINTRODUCTION

**VERDICT: PASS**

With `display: none`, elements are completely removed from layout and cannot receive pointer events.
This is structurally stronger than the old `pointer-events: none` approach.

The positioning e2e (currency-conversion.spec.ts lines 237-302) validates panels stay within
viewport. The navbar-fit.spec.ts validates closed panels don't overflow. No explicit "click-through"
spec exists (FE-005 was a design defect from task 2, fixed architecturally).

Evidence: `display: none` on closed panels (line 66 of Dropdown.module.scss)

### 4. POS-RACE-1 NON-REINTRODUCTION

**VERDICT: PASS**

| Check                          | Result | Evidence                                          |
| ------------------------------ | ------ | ------------------------------------------------- |
| Viewport safety e2e            | PASS   | currency-conversion.spec.ts "Viewport Safety" 3/3 |
| useDropdownPosition unit tests | PASS   | 19/19 tests, 100% coverage on file                |
| Synchronous measurement intact | PASS   | useLayoutEffect runs when isOpen becomes true     |

The fix comment in Dropdown.module.scss (lines 63-65) correctly documents that useLayoutEffect
measures after React renders with display:block but before paint.

### 5. TRANSPARENCY UX

**VERDICT: PASS**

| Check                          | Result | Evidence                                                       |
| ------------------------------ | ------ | -------------------------------------------------------------- |
| Navbar bg transparent light    | PASS   | navbar-fit.spec.ts line 207 + getComputedStyle                 |
| Navbar bg transparent dark     | PASS   | navbar-fit.spec.ts line 213 + getComputedStyle                 |
| Controls use foreground tokens | PASS   | Navbar.module.scss line 10: `color: var(--color-text-primary)` |
| Hamburger visible mobile       | PASS   | navbar-fit.spec.ts mobile menu tests (lines 156-188)           |

E2E evidence: transparency tests pass in navbar-fit.spec.ts (tests 25-26)

### 6. TEST INTEGRITY

**VERDICT: PASS**

| Check                                | Result         | Evidence                                       |
| ------------------------------------ | -------------- | ---------------------------------------------- |
| Probe specs deleted                  | PASS           | `ls e2e/journeys/_probe*` returns "no matches" |
| No weakened assertions               | PASS           | `git diff e2e/journeys/` shows only additions  |
| country-selection.spec.ts            | UNCHANGED      | No git diff                                    |
| dropdown-keyboard-navigation.spec.ts | UNCHANGED      | No git diff                                    |
| mobile-menu.spec.ts                  | ADDITIONS ONLY | +34 lines (font loading tests)                 |

### 7. CHECKLIST TRUTHFULNESS

**VERDICT: PASS**

All TASK 8 rows in docs/REQUIREMENTS-CHECKLIST.md (lines 898-960) accurately reflect implemented
state:

- FIT8-01 through FIT8-15: All navbar-fit tests pass
- TRANS8-01 through TRANS8-04: All transparency requirements verified
- FIX8-01 through FIX8-06: All fix details accurate
- QUALITY8-01 through QUALITY8-14: All quality gates met

---

## Open Findings

| ID     | Severity | Status                       | Description                                  |
| ------ | -------- | ---------------------------- | -------------------------------------------- |
| UX-001 | MEDIUM   | OPEN - REQUIRES ADJUDICATION | Close animation removed (snap vs 150ms fade) |

### UX-001 Detail

**File:** `src/shared/components/Dropdown/Dropdown.module.scss` **Lines:** 62-76 (new), vs removed
lines 56-70 (old)

**Old behavior:**

```scss
opacity: 0;
pointer-events: none;
transform: translateY(-8px);
@include anim.transition-fast(opacity, transform);

&--open {
  opacity: 1;
  pointer-events: auto;
  transform: translateY(0);
}
```

When `--open` class removed, CSS transitions animate 150ms fade-out + slide.

**New behavior:**

```scss
display: none;

&--open {
  display: block;
  animation: dropdownFadeIn 150ms ease both;
}
```

When `--open` class removed, `display: none` applied immediately - no exit animation.

**Reproduction:** Open any dropdown, close it. Old: smooth fade-out. New: instant snap.

**Expected:** Smooth close animation matching open animation (150ms fade-out).

**Actual:** Instant disappearance.

**Impact:** UX polish regression. Not a functional defect. User mandate "UX is non-negotiable"
creates ambiguity on whether this blocks sign-off.

**Gate analysis:** `dropdowns_still_correct` gate definition in state.json specifies "OPEN panel
positioning", "keyboard suite", "FE-005 click-through" - does NOT explicitly require close
animation. Per INC-003, I classify against gate definitions - this is NOT a gate blocker, but
requires orchestrator adjudication given user mandate.

---

## Gate Evidence Summary

| Gate                | Result | Evidence                             |
| ------------------- | ------ | ------------------------------------ |
| typecheck_clean     | PASS   | `pnpm exec tsc --noEmit` exit 0      |
| unit_tests_pass     | PASS   | 745/745 pass, 100% coverage x4       |
| navbar_fit_spec     | PASS   | 26/26 pass (verified independently)  |
| keyboard_e2e        | PASS   | 12/12 pass                           |
| viewport_safety_e2e | PASS   | 3/3 pass                             |
| full_e2e            | PASS   | 160/160 pass (serial)                |
| probe_specs_deleted | PASS   | `ls e2e/journeys/_probe*` no matches |

---

## Recommendation

If the orchestrator determines UX-001 is acceptable (given that the gate definitions don't require
close animation and the fix is necessary to prevent overflow), then Task 8 can proceed to sign-off.

If the user mandate "UX is non-negotiable" is interpreted strictly, a workaround would be needed -
potentially using `visibility: hidden` + absolute positioning with `left: 100vw` to park closed
panels off-screen (preserving transitions) while preventing overflow. This would require additional
implementation work.
