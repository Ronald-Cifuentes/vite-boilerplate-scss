# Delivery Report — Task 10: Dead-Code Sweep + Foundation-Flaw Audit

**Date:** 2026-07-11 **Orchestrator sign-off:** 20260711-2028 **Status:** ✅ DELIVERED

---

## Scope (user requirement)

(1) File-by-file removal of everything unused or obsolete — brutally critical but rational, damaging
nothing needed, deleting nothing for its own sake. (2) Find every possible critical flaw before this
repo becomes the foundation for many projects.

## Method (why you can trust the deletions)

A git checkpoint (`23f8a49`) was committed first — every deletion has a reviewable diff. Four
independent read-only audits produced evidence-backed registers BEFORE any change. Every deletion
carried zero-reference proof (tool-assisted with knip/ts-prune/depcheck, then manually re-verified —
the tools were wrong 21 times, and those 21 "looks dead, isn't" traps are now documented so nobody
deletes them later: the SCSS token graph, URL-fetched kill-switch service workers, Jest-required env
fallbacks, template-string-consumed i18n keys, and more). Deletions ran in 4 batches with full gates
between batches.

## Delivered

- **28 proven-dead items removed** (create-vite scaffold asset, 4 unused e2e helpers, 10 dead i18n
  key families across all four locales + their type entries, 11 zero-importer barrel files, 2
  needless exports) + the CONTRACTS i18n dictionary amended to match. Bundle direction: DOWN at the
  deletion stage (−537 B raw; locale chunks also slimmed).
- **1 escaped defect fixed** (found by the sweep): the geo-detection announcement was hardcoded
  English — now localized via the previously-orphaned `a11y.locationDetected` key ×4 locales.
- **10 foundation flaws FIXED** (the S-sized CRITICAL/HIGH set): app-level **error boundary** with
  localized fallback + downstream reporter seam; **unhandledrejection** bootstrap handler;
  **deployment-breaking CSP fixed** (nginx had no connect-src — every API fetch was blocked in the
  container; now exactly the 5 approved origins) + HSTS + Permissions-Policy (geolocation=(self)
  deliberately); **CI brought to gate parity** (budget enforcement via a single shared script, local
  == CI, plus depcheck); **README rewritten** to reality (pnpm-only, real features, recipes, token
  requirement, origins + privacy).
- **The consolidated register** — `docs/FOUNDATION-FLAWS-REGISTER-20260711.md` — the "every critical
  flaw" deliverable: what was fixed (with proof), what needs YOUR decision (CRIT-002 silent
  chunk-failure UX; the axe-scan dependency; the NEEDS-JUDGMENT dead-code set incl. whether the
  logs/audit-trail ships with the template), and what to schedule before template publication
  (hard-sleep refactor, visual regression, browser matrix, env validation, the medium architect
  set).

## Final gate evidence (independently re-run by orchestrator, 20260711-2024)

| Gate                     | Result | Evidence                                                                                                                                                                                             |
| ------------------------ | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| lint / typecheck / build | ✅     | all exit 0                                                                                                                                                                                           |
| Unit+integration         | ✅     | 63 suites; 100% ×4 (1324/504/249/1233 — denominators shrank then grew with new boundary/handler tests)                                                                                               |
| E2E (full, serial)       | ✅     | **192/192** — identical journey behavior before and after the sweep                                                                                                                                  |
| Deletion proof per item  | ✅     | register: 28/28 executed with per-item grep evidence + batch gates                                                                                                                                   |
| No behavior change       | ✅     | bundle shrank at deletion stage; all journeys identical                                                                                                                                              |
| Bundle (rev.10)          | ⚠️✅   | main raw **exactly 241,000/241,000 (ZERO headroom)** / gzip 75,807 ≤ 76,000; chunks green. The register's BUNDLE-CAP entry addresses this: next main-bundle byte needs a chunk (preferred) or rev.11 |
| Security                 | ✅     | Appendix H (template posture); nginx `nginx -t` validated; audit exit 0                                                                                                                              |
| Hygiene + traceability   | ✅     | greps clean; register rows + checklist updated                                                                                                                                                       |

## Incidents this task (recorded)

FE phase-2b ran the e2e suite in PARALLEL against standing discipline, got 2 known focus-contention
flakes, and labeled them "pre-existing currency-sync flakes" — orchestrator serial re-run: 192/192;
label rejected; INC-004 pattern reinforced. Orchestrator's own earlier truncated-lint reading
remains on record from task 9 — full-output discipline now standard.

## Acceptance status

**ACCEPTED** — the sweep removed only what was proven dead (and documented what merely looks dead);
the flaw audit fixed every bounded CRITICAL/HIGH and delivered the prioritized register for the
rest. The working tree is uncommitted on top of `23f8a49` — commit recommended. Sign-off log
`logs/20260711-2028-Orchestrator_Master.md`.
