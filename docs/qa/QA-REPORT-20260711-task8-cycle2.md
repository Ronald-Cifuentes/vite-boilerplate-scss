# QA Report - Task 8 Cycle 2

**Date:** 2026-07-11 **Task:** Navbar Fit + Transparency (UX-001 Fix Verification) **Cycle:** 2
**Reviewer:** QA Engineer

## Scope

Cycle 2 is scope-limited to verifying the UX-001 fix (close animation restoration via JS-deferred
hide with CSS @keyframes exit animation).

---

## Verification Items

### 1. EXIT ANIMATION FIDELITY

**VERDICT: PASS**

Token-by-token comparison against pre-task-8 values (commit d16f381):

| Property       | OLD (transition)                    | NEW (@keyframes)                    | Match |
| -------------- | ----------------------------------- | ----------------------------------- | ----- |
| opacity from   | 1                                   | 1                                   | YES   |
| opacity to     | 0                                   | 0                                   | YES   |
| transform from | translateY(0)                       | translateY(0)                       | YES   |
| transform to   | translateY(-8px)                    | translateY(-8px)                    | YES   |
| duration       | t.$transition-duration-fast = 150ms | t.$transition-duration-fast = 150ms | YES   |
| timing         | t.$transition-timing-default = ease | t.$transition-timing-default = ease | YES   |

**Flip-up variant (dropdownFadeOutDown):**

| Property       | Expected        | Actual          | Match |
| -------------- | --------------- | --------------- | ----- |
| opacity from   | 1               | 1               | YES   |
| opacity to     | 0               | 0               | YES   |
| transform from | translateY(0)   | translateY(0)   | YES   |
| transform to   | translateY(8px) | translateY(8px) | YES   |

Evidence: `git diff src/shared/components/Dropdown/Dropdown.module.scss` lines 133-155

### 2. THREE NEW PROOF TESTS (non-vacuous)

**VERDICT: PASS**

| Test                         | Location | Assertion                                                            | Non-vacuous Because                                 |
| ---------------------------- | -------- | -------------------------------------------------------------------- | --------------------------------------------------- |
| Panel visible during exit    | Line 248 | `panelState.exists === true`, checks `className.includes('closing')` | Would fail on snap-hide (panel removed immediately) |
| No h-scroll during close     | Line 285 | `scrollWidth === clientWidth` immediately after close                | Would fail if closing panel overflowed              |
| Closing panel ignores clicks | Line 308 | `aria-expanded=false` after clicking where panel WAS                 | Would fail if pointer-events were auto              |

E2E execution: **29/29 passed** (tests 27-29 are the proof tests)

### 3. A11Y TIMING INTACT

**VERDICT: PASS**

| Check                             | Evidence                                                                                                       |
| --------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| aria-expanded updates IMMEDIATELY | Dropdown.tsx line 82: `isOpen.value = false` in close() callback                                               |
| Focus returns IMMEDIATELY         | Dropdown.tsx line 87: `trigRef.current?.focus()` in close() callback                                           |
| Keyboard e2e unweakened           | dropdown-keyboard-navigation.spec.ts lines 156-184: Escape test verifies aria-expanded=false + trigger focused |

E2E execution: **12/12 keyboard tests passed**

### 4. REDUCED MOTION

**VERDICT: PASS**

| Check                  | Evidence                                                                                                              |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------- |
| CSS animation disabled | Dropdown.module.scss: `@media (prefers-reduced-motion: reduce) { animation: none; }` on both `--open` and `--closing` |
| Fallback fires         | DropdownPanel.spec.tsx line 69: unit test verifies 200ms fallback fires when animationend doesn't                     |
| Instant hide correct   | With `animation: none`, panel still visible during isClosing but no visual animation - fallback completes close       |

### 5. FALLBACK TIMER (no double-fire/leak)

**VERDICT: PASS**

| Scenario               | Coverage  | Evidence                                                                                                          |
| ---------------------- | --------- | ----------------------------------------------------------------------------------------------------------------- |
| Double-fire prevention | Unit test | DropdownPanel.spec.tsx line 84: animationend clears timeout, advance 200ms, callback NOT called again             |
| Cleanup on reopen      | Unit test | DropdownPanel.spec.tsx line 119: rerender with isClosing=false clears timeout, advance 200ms, callback NOT called |
| useEffect cleanup      | Code      | DropdownPanel.tsx line 24-26: `return () => clearTimeout(fallbackRef.current!)`                                   |

The cleanup logic in the useEffect guarantees that when isClosing transitions from true to false
(reopen scenario), the stale timeout is cleared before it can fire.

### 6. NO ASSERTIONS WEAKENED

**VERDICT: PASS**

| File                                 | Change                               | Assessment                                               |
| ------------------------------------ | ------------------------------------ | -------------------------------------------------------- |
| country-selection.spec.ts            | `priceDisplay` → `priceValue` testid | Refinement to avoid loading status, same assertion logic |
| navbar-fit.spec.ts                   | +3 new tests                         | Additions only, no removals                              |
| dropdown-keyboard-navigation.spec.ts | No diff                              | Unchanged                                                |
| mobile-menu.spec.ts                  | No diff since cycle 1                | Unchanged                                                |

---

## UX-001 Status

**CLOSED**

The close animation has been restored with functionally identical behavior to the pre-task-8
implementation. The JS-deferred hide approach uses CSS @keyframes that exactly mirror the old CSS
transition values. Three new e2e tests prove the animation exists, doesn't cause overflow, and
maintains FE-005 safety.

---

## Gate Evidence Summary

| Gate                  | Result | Evidence                          |
| --------------------- | ------ | --------------------------------- |
| navbar_fit_spec       | PASS   | 29/29 pass (serial)               |
| keyboard_e2e          | PASS   | 12/12 pass                        |
| DropdownPanel_unit    | PASS   | 10/10 pass, 100% coverage         |
| exit_animation_tokens | PASS   | Exact match to pre-task-8 values  |
| reduced_motion_guard  | PASS   | CSS + fallback timeout            |
| fallback_no_leak      | PASS   | Cleanup in useEffect + unit tests |
| assertions_intact     | PASS   | No weakening, only additions      |

---

## Findings

| ID     | Severity | Status     | Description                                                                  |
| ------ | -------- | ---------- | ---------------------------------------------------------------------------- |
| UX-001 | HIGH     | **CLOSED** | Close animation restored via JS-deferred hide with @keyframes exit animation |

Zero open defects.
