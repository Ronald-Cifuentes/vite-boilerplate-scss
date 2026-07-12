# Delivery Report — Task 4: Real Currency Conversion + Viewport-Safe Dropdowns

**Date:** 2026-07-10 **Orchestrator sign-off:** 20260710-1315, corrective addendum 20260710-1333
**Status:** ✅ DELIVERED (with one post-sign-off corrective fix, see Incident below)

---

## Scope (user requirement)

Real currency conversion via central-bank rates — banrep SUAMECA for USD/EUR/GBP and Banxico SIE MXN
via cross-composition (COP/MXN = banrep TRM ÷ banxico FIX) — COP added to the selector, fixed en-US
amount formatting, viewport-safe dropdown positioning (closing the ADR-0007 gap the user caught),
and responsive completeness. User asked for these adjustments "for all projects, including this one"
— this loop delivered **this repo only**; cross-project rollout remains with the user.

## What was delivered

- **`src/exchange-rates/`** — new bounded context: banrep SUAMECA + Banxico SIE adapters (endpoints
  curl-verified incl. CORS before implementation), fail-closed orientation assertions (banrep
  `unidad` regex, banxico `idSerie`), numeric guards, N/E handling, 24h-bounded validated-on-read
  localStorage cache, graceful degradation across live / partial / stale / loading / unavailable
  states (all five localized en+es and functional).
- **Conversion correctness** — QA re-derived the math from fixtures: $4,500 COP → $1.37 USD
  (÷3284.6715), €1.20 EUR (÷3750), £1.02 GBP (÷4411.7647), $23.94 MXN (÷187.9699 via TRM÷FIX) — the
  exact user example asserted per currency; distinct numerics prove real conversion, not symbol
  swap.
- **COP in the currency selector**; fixed en-US amount format (`$1,234.56 USD` style).
- **`useDropdownPosition`** (`src/shared/components/Dropdown/`) — viewport-safe positioning; e2e
  bounding-box suite asserts panels ⊆ viewport at 375/768/1440 incl. the rightmost trigger at 375px
  (the user-reported overflow case).
- **Secrets**: `VITE_BANXICO_TOKEN` env-only (`.env.example` added, `.env*` gitignored); SEC-006
  (client-bundle token exposure) formally owner-accepted with rotation guidance (Security Appendix
  D).
- **Docs**: ADR-0010, CONTRACTS v3.2.0, budgets.md rev.5, 69 checklist rows,
  QA-REPORT-20260710-task4-cycle1.md, PERF-ANALYSIS-20260710-task4.md.

## Final gate evidence (independently re-run by orchestrator, 20260710-1333)

| Gate                                | Result | Evidence                                                                                             |
| ----------------------------------- | ------ | ---------------------------------------------------------------------------------------------------- |
| lint / typecheck / build            | ✅     | all exit 0 (lint re-verified after corrective fix below); build 309ms < 5s SLO                       |
| Unit+integration                    | ✅     | 46 suites / 629 tests pass                                                                           |
| Coverage                            | ✅     | 100% ×4 — 889/889 / 286/286 / 168/168 / 812/812                                                      |
| E2E                                 | ✅     | 87/87 at sign-off (2 parallel + QA serial); currency-conversion journey re-run 12/12 serial post-fix |
| Conversion correctness              | ✅     | exact user example asserted per currency (QA re-derivation)                                          |
| Popups within viewport              | ✅     | bounding-box suite green 375/768/1440 incl. rightmost trigger                                        |
| Rates fail closed                   | ✅     | security-verified orientation assertions; failure/stale/partial journeys green                       |
| Bundle (rev.5, human-approved)      | ✅     | raw 228,192 ≤ 229,000; gzip(-6) 71,826 ≤ 72,000 — byte-identical before/after corrective rename      |
| Security                            | ✅     | full first-outbound-surface triage PASSED; 0 crit/high; SEC-006 Medium accepted (Appendix D)         |
| Mobile-first / decorative / statics | ✅     | 0 max-width @media; all 5 rate states functional; 0 TODO/FIXME; no secrets                           |
| Traceability                        | ✅     | task-4 rows 69/69 with evidence; project 252/264 pass + 11 superseded + legend                       |

## Incident: post-sign-off gate reopening (corrected)

The 20260710-1315 sign-off recorded `lint_clean` from iteration-4 evidence, but a re-verification
run at 13:29 found `pnpm lint` failing with 3 `react-hooks/rules-of-hooks` errors in
`src/exchange-rates/signals/rates-signal.ts`: a module-private plain function named `useStaleCache`
(mtime 09:59, i.e. present when the it4 evidence was recorded — the recorded evidence was wrong; no
eslint cache or config change explains it). Additionally, this delivery report — referenced by the
sign-off log — had not actually been written.

**Corrective fix (orchestrator, trivial class):** renamed `useStaleCache` → `applyStaleCache` (4
occurrences, one file, module-private, no spec references, no behavior change — minified raw bundle
byte-identical at 228,192). Re-ran the full minimum gate set plus the affected e2e journey: all
green (table above). This mirrors the FE gate-glossing pattern from tasks 2/4 but occurred in the
orchestrator's own evidence chain — recorded in state.json `incidentsCarriedOver` as a
countermeasure reminder: **evidence must be re-run at sign-off time, not carried forward from
earlier iterations.**

## Notes and limitations (with evidence)

- **FLAKE-1 (INFO, not a defect):** full-suite parallel e2e runs intermittently fail focus-return
  assertions (~1/3 runs); serial + isolated runs 100% green; product focus path verified correct.
  Mitigation: `--workers=1` for gate runs; backlog: serialize keyboard specs or poll
  `document.activeElement`.
- **Bundle headroom is nearly exhausted:** 808 B raw / 174 B gzip remain under rev.5. Perf verified
  the 228,192 floor honest (no trims ≥100 B remain); terser lever rejected (6-15× slower minify for
  2.3-4.6 KB). The next feature will force code-splitting or another owner budget decision.
- **SEC-006 (Medium, accepted):** `VITE_BANXICO_TOKEN` is embedded in the client bundle by design
  (Vite static site, no backend proxy available); owner accepted with rotation guidance.
- E2E runs Chromium-only.
- Cross-project rollout of these adjustments remains with the user (this repo only).

## Acceptance status

**ACCEPTED** — all CONTRACTS v3.2.0 acceptance criteria pass
(docs/qa/QA-REPORT-20260710-task4-cycle1.md); QA report zero product defects; security triage clean;
perf gate green under human-ratified rev.5. Sign-off logs:
`logs/20260710-1315-Orchestrator_Master.md` + corrective
`logs/20260710-1334-Orchestrator_Master.md`.
