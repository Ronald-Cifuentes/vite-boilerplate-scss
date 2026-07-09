# ADR-0008: Browser Support Matrix / Vite Build Target

- **Status:** Accepted
- **Date:** 2026-07-09
- **Deciders:** Project owner (explicit approval at task-2 closeout); recorded by Orchestrator
- **Context source:** ARCH-REG-1 finding (QA cycle 2, task 2) + PERF-ANALYSIS-20260709-task2.md

## Context

During the task-2 bundle-budget fix round, the Frontend Engineer set `build.target: 'esnext'` in
`vite.config.ts` to reduce transpilation/polyfill overhead. This changed the effective
browser-support matrix without documentation — flagged by QA as ARCH-REG-1 (INFO severity: no
previously declared browser matrix existed in CONTRACTS.md or any ADR, so nothing was violated, but
the decision was undocumented and unratified).

The performance analysis confirmed the raw-bundle pressure motivating the change is structural
(React 19 runtime floor of 175.9 KB; constitution-mandated react-icons and signals), and the project
owner was asked to either ratify or revert the target.

## Decision

**Keep `build.target: 'esnext'`** and declare the browser support matrix explicitly:

| Browser       | Minimum supported |
| ------------- | ----------------- |
| Safari / iOS  | 15.4+             |
| Chrome / Edge | 91+               |
| Firefox       | 90+               |

Approved by the project owner on 2026-07-09 (task-2 closeout decision round, together with
performance budget rev. 3).

## Rationale

1. This is a mobile-first, evergreen-browser SPA with no enterprise legacy-browser requirement on
   record.
2. The excluded versions are 2021–2022 era; their 2026 traffic share is negligible for this
   project's audience.
3. Transpiling to older targets adds bundle weight against an already structurally tight raw budget
   (see budgets.md rev. 3).

## Consequences

- Any future requirement to support browsers older than the matrix above must revisit this ADR and
  re-budget the resulting bundle growth (transpilation + polyfills).
- E2E coverage runs on evergreen Chromium; the matrix is enforced by policy, not by CI matrix
  testing. If a compatibility guarantee becomes contractual, add cross-browser CI.

## References

- vite.config.ts (`build.target`)
- docs/performance/budgets.md rev. 3
- docs/performance/PERF-ANALYSIS-20260709-task2.md
- docs/qa/QA-REPORT-20260709-task2-cycle2.md (ARCH-REG-1)
