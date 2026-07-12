# Delivery Report — Task 11: Mobile-Menu Scroll Reachability (479×537)

**Date:** 2026-07-11 **Orchestrator sign-off:** 20260711-2358 **Status:** ✅ DELIVERED

---

## Scope (user requirement)

At 479×537, expanding "Currency" made "Language" unreachable by scroll. "Scrolling must work
properly regardless of screen size." (The request's other two items — the dead-code sweep and the
foundation-flaw audit — were delivered in task 10; see `docs/FOUNDATION-FLAWS-REGISTER-20260711.md`
and `DELIVERY-REPORT-20260711-task10.md`. They were not re-run; this bug was treated as evidence of
a verification blind spot in that prior work and the gap is closed here.)

## Root cause (reproduced at your exact resolution before fixing)

The menu overlay was a column-flex container with `justify-content: center`. When expanded content
overflows (Currency's 7 options at a 537px-high viewport), flexbox distributes the overflow ABOVE
flex-start — a region `scrollTop` can never reach (probe: Language at top −29.5px with scrollTop
pinned at its 0 minimum). Task 9's `overflow-y: auto` only ever worked downward. The prior tests
never caught it because they asserted only LAST-item reachability (scrolling down); nobody asserted
the FIRST item stays reachable.

## Fix + the generalized gate

- **CSS-only** (the JS bundle is at its exact cap — zero bytes were available, zero were used): the
  standard margin-auto pattern — container stops flex-centering; the inner menu gets
  `margin-block: auto`, which centers when content fits and top-aligns when it overflows, keeping
  the top reachable. Visual parity verified when content fits (centered, 0.0px offset).
- **Fail-before/pass-after proven** at 479×537 + Currency: Language unreachable → reachable at
  scrollTop 0.
- **New permanent gate** `e2e/journeys/menu-scroll-reachability.spec.ts`: FIRST and LAST menu items
  reachable after expanding EACH of the 3 submenus at 479×537, 320×480, 667×375, 375×667 (13 tests)
  — the blind-spot class (top-overflow) can't recur silently.

## Final gate evidence (orchestrator-verified, 20260711-2356)

| Gate                     | Result | Evidence                                                                       |
| ------------------------ | ------ | ------------------------------------------------------------------------------ |
| lint / typecheck / build | ✅     | all exit 0                                                                     |
| Unit+integration         | ✅     | 893 tests, 100% ×4 (unchanged denominators — CSS-only fix)                     |
| E2E (full, serial)       | ✅     | **205/205** (192 prior + 13 reachability matrix) — orchestrator run            |
| Scroll reachability      | ✅     | 12-combination matrix green incl. the user's exact 479×537+Currency case       |
| Bundle                   | ✅     | main JS unchanged at 241,000/75,825; CSS 29,249/5,529 within caps              |
| Hygiene + traceability   | ✅     | greps clean; probe deleted; CONTRACTS scroll note updated; checklist row added |

## Incident note

FE's report again attached a false "pre-existing currency-sync flakes" label to intermediate run
noise (fourth INC-004-pattern occurrence — the phrase now refers to an incident record, not any real
flake); the authoritative serial run is 205/205 with zero failures.

## Acceptance status

**ACCEPTED.** Task-10 + task-11 work remains uncommitted on top of `23f8a49` — commit recommended.
Sign-off log `logs/20260711-2358-Orchestrator_Master.md`.
