# Delivery Report — Task 8: Navbar Fit (Pixel Perfect) + Transparency

**Date:** 2026-07-11 **Orchestrator sign-off:** 20260711-0150 **Status:** ✅ DELIVERED

---

## Scope (user requirement, verbatim)

> "The navigation bar isn't fitting correctly on the site; it needs to be pixel perfect. The
> navigation bar needs to be transparent. Run quality assurance and front-end agents to perform the
> validation, checking, and correction cycle until it's literally perfect and usable by users. UX is
> non-negotiable."

## What was delivered

- **The "isn't fitting" complaint was reproduced before it was touched** (probe across 12
  viewport×theme combinations): a permanent horizontal scrollbar existed at EVERY desktop width in
  both themes (+84 px at 1024: scrollWidth 1108). Culprit proven by full-DOM sweep: CLOSED dropdown
  panels — parked invisible in layout by the task-2 visibility pattern, 160 px wide, left-aligned to
  their triggers, never receiving flip positioning (it only computed on open). **Latent since task 2
  and never gated** (positioning e2e measured only OPEN panels; the no-horizontal-scroll check only
  ran at 375px, where the task-7 hamburger removed the dropdowns entirely).
- **Fix:** closed panels no longer occupy layout (`display: none`); entrance animation converted to
  CSS `@keyframes` (which fire on display change) with identical tokens; both prior incident
  countermeasures held and were proven: FE-005 click-through is structurally impossible now, and the
  POS-RACE-1 measure-on-open path is untouched (19/19 hook unit tests + positioning suite).
- **Transparent navbar** in both themes (`background-color: transparent`), controls keep contrast
  via theme foreground tokens; verified by computed-style assertions (rgba(0,0,0,0)) light + dark.
- **New permanent "Pixel Perfect" gate** — `e2e/journeys/navbar-fit.spec.ts`, 29 tests:
  `scrollWidth === clientWidth` (strict equality) at 375/768/820/1024/1280/1440 × light+dark,
  re-checked after open→close cycles of every dropdown and the mobile menu, plus during the
  closing-animation window; navbar transparency computed-style checks; all controls within viewport.
  **Confirmed failing on the pre-fix tree** (proof of change).
- **The user-mandated FE↔QA cycle caught a third defect neither requirement named:** the overflow
  fix silently removed the dropdown CLOSE animation (snap instead of the 150 ms fade-out). QA found
  it and escalated; the orchestrator ruled it blocking under this task's UX bar and rejected an
  off-screen-parking workaround that would have re-created the overflow. FE attempt 2 restored the
  exit animation via a deferred hide: aria-expanded and focus-return update IMMEDIATELY on close;
  the panel plays `dropdownFadeOut` (exact mirror of the old transition: opacity 1→0, translateY
  0→-8px, 150 ms, same tokens; flip-up variant mirrored); `animationend` + 200 ms fallback then
  removes it; `pointer-events: none` while closing; instant hide under reduced motion; timer cleanup
  covers reopen-during-close (unit-tested). QA cycle 2: **zero defects, UX-001 closed** with
  token-level evidence.

## Final gate evidence (independently re-run by orchestrator, 20260711-0147)

| Gate                             | Result | Evidence                                                                                  |
| -------------------------------- | ------ | ----------------------------------------------------------------------------------------- |
| lint / typecheck / build         | ✅     | all exit 0                                                                                |
| Unit+integration                 | ✅     | 52 suites / 749 tests; 100% ×4 (1089/379/211/1001)                                        |
| E2E (full, serial)               | ✅     | **163/163** (134 prior + 29 fit-gate incl. 3 close-animation proofs)                      |
| No horizontal scroll (any width) | ✅     | 29/29 fit gate; strict equality; 6 widths × 2 themes; post-cycle + during-close re-checks |
| Navbar transparent               | ✅     | computed rgba(0,0,0,0) light + dark; contrast token-based                                 |
| Dropdowns still correct          | ✅     | positioning + keyboard suites green; FE-005 + POS-RACE-1 countermeasures proven intact    |
| Close animation (UX-001)         | ✅     | keyframes token-identical to old transition; proof test fails on snap behavior            |
| Bundle (rev.8)                   | ✅     | raw 239,967 ≤ 240,000; gzip 75,479 ≤ 75,500; CSS gzip 5,436 ≤ 6,500                       |
| Hygiene + traceability           | ✅     | 0 TODO/FIXME; TASK-8 checklist rows QA-verified                                           |

## Notes and limitations (with evidence)

- **JS bundle headroom is effectively ZERO: 33 B raw / 21 B gzip.** This is the end of the
  single-bundle road — ADR-0011 Option A (lazy locale chunks) or equivalent code-splitting is
  MANDATORY before any next feature that adds JavaScript. Recorded as the first line of the next
  intake.
- The exit-animation timing (150 ms + 200 ms fallback) is asserted via class-state e2e, not
  frame-capture video; Chromium-only as with the whole suite.
- The latent overflow existed across tasks 2–7 because no gate measured desktop scrollWidth — the
  new 29-test gate closes that class of blind spot permanently.

## Acceptance status

**ACCEPTED** — both named requirements delivered and proven; the mandated validation/correction
cycle ran two FE rounds and two QA cycles, ending at zero open defects with every gate green. QA
reports: docs/qa/QA-REPORT-20260711-task8-cycle1.md + -cycle2.md. Sign-off log
`logs/20260711-0150-Orchestrator_Master.md`.
