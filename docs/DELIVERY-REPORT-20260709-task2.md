# Delivery Report — Task 2: Icon-Triggered Navbar Dropdowns

**Date:** 2026-07-09 **Orchestrator sign-off:** 20260709-1842 **Status:** ✅ DELIVERED

---

## Scope (user requirements, verbatim intent)

1. Navbar controls that open dropdowns must be **icons, not text** — language, dark mode, country,
   and currency. They cannot be simple buttons (task-1 cycle buttons rejected).
2. Every button/link in the navbar or anywhere on the site must **work — nothing decorative**.
3. The design system must be **100% mobile-first**.
4. Dropdown popups must show **icons accompanying the text** of every option.

## What was delivered

- **Generic accessible Dropdown** (`src/shared/components/Dropdown/`): WAI-ARIA APG listbox pattern
  — icon-only trigger (`aria-haspopup`, `aria-expanded`, `aria-controls`, localized `aria-label`
  with current value), popup `role="listbox"`, options `role="option"` with roving tabindex, full
  keyboard contract (Enter/Space/ArrowDown/ArrowUp open; Arrow wrap, Home/End, Enter select + focus
  return, Escape cancel + focus return, Tab close), outside-click close, `aria-hidden` on closed
  panels, reduced-motion-aware animation.
- **Four navbar wrappers**: LanguageDropdown, ThemeDropdown, CountryDropdown, CurrencyDropdown —
  every option renders a react-icons icon + localized text (per CONTRACTS §7 icon tables).
- **New `src/currency` domain** (hexagonal: ports/adapters/signals/hooks/config) with
  user-override > region-default precedence, localStorage persistence, `formatCurrency` consumed by
  Greeting (migration off the region domain completed per CONTRACTS v3 §5.4).
- **Deleted** the rejected task-1 cycle buttons (LanguageCycleButton, ThemeModeToggle,
  CountryCycleButton) — no dead code.
- **Docs/architecture**: ADR-0007 (dropdown supersession), ADR-0008 (browser matrix / esnext build
  target, owner-ratified), CONTRACTS v3.0.0, budgets.md rev. 3, PERF-ANALYSIS-20260709-task2.md, QA
  reports cycles 1–3.

## Final gate evidence (all independently re-run by orchestrator)

| Gate                          | Result | Evidence                                                                                                              |
| ----------------------------- | ------ | --------------------------------------------------------------------------------------------------------------------- |
| lint / typecheck / build      | ✅     | all exit 0                                                                                                            |
| Unit+integration tests        | ✅     | 39 suites, 442 tests pass                                                                                             |
| Coverage                      | ✅     | 100% statements (618/618), branches (148/148), functions (129/129), lines (587/587)                                   |
| E2E (Playwright, Chromium)    | ✅     | **58/58** — incl. 13 keyboard-contract tests + 2 aria-hidden regression tests                                         |
| A11y                          | ✅     | keyboard contract proven in real browser; closed panels aria-hidden; touch targets ≥44px; announcements via aria-live |
| Mobile-first                  | ✅     | 0 `max-width` media queries (arch-test enforced); e2e at 375/768/1440                                                 |
| Nothing decorative            | ✅     | QA sweep: every interactive element has a real handler/effect                                                         |
| Bundle budget (rev. 3)        | ✅     | 220,599 B raw ≤ 224,000; 68,939 B gzip ≤ 70,000                                                                       |
| Security                      | ✅     | 0 vulns (prod+dev audit); devDep-only delta; localStorage adapters allowlist-validated                                |
| No hardcoded / TODO / secrets | ✅     | greps 0/0/0                                                                                                           |
| Traceability                  | ✅     | task-2 checklist 53/53 passed (project total 142 passed / 0 failed / 5 superseded)                                    |

## Failed-and-fixed during the loop (honest account)

1. **FE-005 (HIGH)** — keyboard focus never landed in a real browser (worked in jsdom). Root cause:
   `visibility: hidden` panels are unfocusable; browsers silently no-op `focus()`. Found because QA
   wrote 13 keyboard e2e tests that the first implementation had omitted.
2. **DEF-A11Y-1 (HIGH)** — the FE-005 fix (opacity-only hiding) exposed closed-panel options to
   screen-reader browse mode; fixed with `aria-hidden={!isOpen}` + regression tests.
3. **DEF-B1 (MED)** — bundle exceeded the 220 KB rev.2 raw budget by 712 B. Perf analysis showed the
   7.8 kB task-2 growth legitimate and only ~300 B trimmable. **Resolved by explicit owner
   decision**: budget rev. 3 (224 KB raw, warning at 220) + trims (−113 B).
4. **DEF-Q1/Q2** — missing icon assertions in specs; `waitForTimeout` hacks — both fixed.
5. Two session-limit kills (architect, first FE run) were recovered by artifact verification — no
   work lost.

## Risks / limitations (with evidence)

- **Raw bundle sits in the warning band** (220,599 > 220,000 warning threshold) by design of rev. 3;
  the next feature will likely need code-splitting or another owner decision (budgets.md rev. 3
  rationale).
- **Gzip near alert line** (68.9 KB vs 68 KB warning): monitored, not blocking.
- **Browser matrix** now Safari ≥15.4 / Chrome ≥91 / Firefox ≥90 (ADR-0008, owner-ratified);
  enforced by policy, not CI matrix testing.
- **E2E runs Chromium-only**; keyboard/SR semantics validated per APG patterns, not against real
  screen readers.

## Owner decisions recorded

- Budget rev. 3 (224 KB raw / 70 KB gzip) — budgets.md revision history, 2026-07-09.
- Keep `build.target: 'esnext'` + document matrix — ADR-0008.
- One human-approved FE round beyond maxAttempts for DEF-A11Y-1 — state.json
  `humanDecisions_20260709`.

## Acceptance status

**ACCEPTED** — all CONTRACTS v3 §10 criteria pass (QA-REPORT-20260709-task2-cycle3-FINAL.md); QA
report empty; security triage clean; loop closed at iteration 9/10 with sign-off log
`logs/20260709-1842-Orchestrator_Master.md`.
