# Performance Budgets

**Owner:** Performance Engineer **Date:** 2026-07-09 (rev. 3) **Status:** Approved (revision
approved by project owner, 2026-07-09, task-2 closeout — see PERF-ANALYSIS-20260709-task2.md)

---

## SLO Definitions

This document defines performance budgets for the `vite-boilerplate-scss` frontend application.

### Primary SLO

| Metric            | Target    | Rationale                                                                                                                                                                                                                                                                                               |
| ----------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| App Interactivity | < 500ms   | PRD NFR1 requirement; user perceives app as instant                                                                                                                                                                                                                                                     |
| JS Bundle (gzip)  | <= 70 KB  | Rev. 2 (unchanged in rev. 3): React 19.2.7 runtime floor + mandated react-icons/design-system; 3G TTI stays < 2.5s (see PERF-ANALYSIS-20260709.md)                                                                                                                                                      |
| JS Bundle (raw)   | <= 224 KB | Rev. 3: task-2 accessible dropdowns + currency domain add 7.8 KB of legitimate feature weight over the 212.9 KB pre-task baseline (react-dom alone is 175.9 KB; ESLint-mandated signals runtime is shared); only ~300 B was trimmable. 224 KB gives ~3.6 KB headroom; warning threshold stays at 220 KB |
| CSS Bundle (gzip) | <= 10 KB  | Reasonable CSS overhead for mobile                                                                                                                                                                                                                                                                      |
| Build Time        | < 5s      | PRD NFR1; fast CI/CD feedback loop                                                                                                                                                                                                                                                                      |

### Per-Endpoint/Action Budgets

| Action                         | p50 Target | p95 Target | p99 Target | Load Condition                     |
| ------------------------------ | ---------- | ---------- | ---------- | ---------------------------------- |
| Initial page load (index.html) | < 50ms     | < 100ms    | < 200ms    | Local preview, warm cache          |
| JS bundle fetch                | < 100ms    | < 200ms    | < 300ms    | Local preview, no network throttle |
| CSS bundle fetch               | < 20ms     | < 50ms     | < 100ms    | Local preview                      |
| Language switch (runtime)      | < 5ms      | < 10ms     | < 20ms     | In-memory operation                |

### Excluded from Primary SLO

The following are not subject to the < 500ms budget (per PRD 4.0):

- File processing (N/A for this frontend)
- Report generation (N/A for this frontend)
- Async jobs (N/A for this frontend)
- Third-party-dependent workflows (N/A, no external APIs)

---

## Resource Budgets

### JavaScript

| Chunk          | Max Raw  | Max Gzip | Notes                                                         |
| -------------- | -------- | -------- | ------------------------------------------------------------- |
| Main bundle    | 224 KB   | 70 KB    | Single bundle (no code-splitting needed for this minimal app) |
| Vendor (React) | Included | Included | React 19 runtime dominates bundle                             |

### CSS

| Chunk    | Max Raw | Max Gzip | Notes                        |
| -------- | ------- | -------- | ---------------------------- |
| Main CSS | 10 KB   | 3 KB     | SCSS Modules compiled to CSS |

### Translations

| Locale | Raw Size   | Impact                   |
| ------ | ---------- | ------------------------ |
| en     | ~460 bytes | Negligible               |
| es     | ~452 bytes | Negligible               |
| Total  | < 1 KB     | No code-splitting needed |

---

## Infrastructure SLOs

### Server Response (nginx production)

| Metric                | Target             |
| --------------------- | ------------------ |
| TTFB (index.html)     | < 10ms             |
| TTFB (hashed assets)  | < 5ms              |
| Gzip compression      | Enabled (level 6)  |
| Cache (hashed assets) | 1 year, immutable  |
| Cache (index.html)    | no-cache, no-store |

### Connection/Concurrency

| Metric             | Config  |
| ------------------ | ------- |
| Worker connections | 1024    |
| Keepalive timeout  | 65s     |
| TCP nodelay        | Enabled |

---

## Monitoring and Alerts

### Recommended Dashboards

1. **Bundle Size Trend** - Track JS/CSS sizes over commits
2. **Build Time Trend** - Track CI build duration
3. **E2E Interactivity** - Track measured app-interactive times from Playwright

### Alert Thresholds

| Metric            | Warning  | Critical | Action                           |
| ----------------- | -------- | -------- | -------------------------------- |
| JS raw size       | > 220 KB | > 224 KB | Investigate new deps, code-split |
| JS gzip size      | > 68 KB  | > 70 KB  | Investigate new deps, code-split |
| App interactivity | > 400ms  | > 500ms  | Profile, optimize critical path  |
| Build time        | > 3s     | > 5s     | Check for slow transforms        |

---

## Profiling Checklist

For any performance investigation:

- [ ] CPU flamegraph during build
- [ ] Bundle composition analysis (vite-bundle-visualizer)
- [ ] React DevTools Profiler for runtime
- [ ] Network waterfall in browser DevTools
- [ ] Lighthouse audit (Performance score > 90)

---

## Revision History

| Date       | Author                                                            | Change                                                                                                                                                                                                                                                                                                                                        |
| ---------- | ----------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-06-29 | Performance Engineer                                              | Initial budget definition                                                                                                                                                                                                                                                                                                                     |
| 2026-07-09 | Performance Engineer (approved by project owner via orchestrator) | JS budgets revised 200→220 KB raw, 65→70 KB gzip (DEF-001). React 19.2.7 runtime floor makes old limits structurally infeasible; react-icons tree-shaken to 4.97 KB; no real cuts without dropping constitution mandates. Full decomposition: PERF-ANALYSIS-20260709.md. Runtime unaffected: interactivity 80–147 ms vs 500 ms SLO.           |
| 2026-07-09 | Orchestrator recording project-owner approval (task-2 closeout)   | Rev. 3 (DEF-B1): raw limit 220→224 KB with warning threshold at 220 KB; gzip unchanged (70 KB critical / 68 KB warning; raw warning row added). Task-2 accessible dropdowns + currency domain added 7.8 KB legitimate weight; perf analysis found only ~300 B trimmable (applied same round). Decomposition: PERF-ANALYSIS-20260709-task2.md. |
