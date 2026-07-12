# Performance Budgets

**Owner:** Performance Engineer **Date:** 2026-07-10 (rev. 10) **Status:** Approved (revision
approved by project owner, 2026-07-11, task-9 closeout — perf-verified chunked floor; see
PERF-ANALYSIS-20260711-task9.md)

---

## SLO Definitions

This document defines performance budgets for the `vite-boilerplate-scss` frontend application.

### Primary SLO

| Metric            | Target    | Rationale                                                                                                                                                                                                         |
| ----------------- | --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| App Interactivity | < 500ms   | PRD NFR1 requirement; user perceives app as instant                                                                                                                                                               |
| JS Bundle (gzip)  | <= 76 KB  | Rev. 10 (MAIN CHUNK): floor 75,421 B; warning 75.7 KB                                                                                                                                                             |
| JS Bundle (raw)   | <= 241 KB | Rev. 10 (MAIN CHUNK): perf-verified floor 240,096 B — lazy-loading machinery (~3.25 KB: locale loader + detection trigger + apply callback) is legitimate main weight the rev.9 estimate missed; warning 240.5 KB |
| CSS Bundle (gzip) | <= 10 KB  | Reasonable CSS overhead for mobile                                                                                                                                                                                |
| Build Time        | < 5s      | PRD NFR1; fast CI/CD feedback loop                                                                                                                                                                                |

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

| Chunk          | Max Raw  | Max Gzip | Notes                                                                          |
| -------------- | -------- | -------- | ------------------------------------------------------------------------------ |
| Main bundle    | 241 KB   | 76 KB    | Rev. 10: chunked; perf-decomposed floor 240,096/75,421                         |
| geo.js chunk   | 3 KB     | 1.5 KB   | Lazy: first visit with no stored prefs only (incl. GPS reverse-geocode client) |
| locale-zh.js   | 3 KB     | 1 KB     | Lazy: loaded when zh selected/detected                                         |
| locale-ja.js   | 3 KB     | 1 KB     | Lazy: loaded when ja selected/detected                                         |
| Vendor (React) | Included | Included | React 19 runtime dominates bundle                                              |

### CSS

| Chunk    | Max Raw | Max Gzip | Notes                                                                                                                                                      |
| -------- | ------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Main CSS | 30 KB   | 6.5 KB   | Corrected 2026-07-11 (owner-ratified): row was stale since pre-task-6 (actual 20.5 KB then); warnings 28 KB / 6 KB; enforced SLO remains CSS gzip <= 10 KB |

### Fonts (NEW — rev. 7, task 7)

| Asset                            | Max Transfer | Notes                                                                                                                    |
| -------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------ |
| Total woff2 (self-hosted, latin) | 45 KB        | Rubik Mono One 7,032 B + Roboto Mono var 400..700 32,752 B measured; font-display: swap + preload; OFL license committed |

### Translations

| Locale | Raw Size    | Impact                                                                                      |
| ------ | ----------- | ------------------------------------------------------------------------------------------- |
| en     | ~460 bytes  | Negligible                                                                                  |
| es     | ~452 bytes  | Negligible                                                                                  |
| zh     | ~1.3 KB est | Task 6; CJK strings, UTF-8 multi-byte                                                       |
| ja     | ~1.4 KB est | Task 6; CJK strings, UTF-8 multi-byte                                                       |
| Total  | < 4 KB      | Single bundle per owner decision (rev. 6); lazy chunks deferred until locale count warrants |

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

| Metric              | Warning    | Critical | Action                                            |
| ------------------- | ---------- | -------- | ------------------------------------------------- |
| JS raw size (main)  | > 240.5 KB | > 241 KB | Investigate; chunks exist — check splitting first |
| Any lazy chunk raw  | > 2.5 KB   | > 3 KB   | Re-scope chunk contents                           |
| JS gzip size (main) | > 75.7 KB  | > 76 KB  | Investigate; check splitting                      |
| Font transfer       | > 40 KB    | > 45 KB  | Re-subset, drop weights                           |
| App interactivity   | > 400ms    | > 500ms  | Profile, optimize critical path                   |
| Build time          | > 3s       | > 5s     | Check for slow transforms                         |

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

| Date       | Author                                                            | Change                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| ---------- | ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 2026-06-29 | Performance Engineer                                              | Initial budget definition                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| 2026-07-09 | Performance Engineer (approved by project owner via orchestrator) | JS budgets revised 200→220 KB raw, 65→70 KB gzip (DEF-001). React 19.2.7 runtime floor makes old limits structurally infeasible; react-icons tree-shaken to 4.97 KB; no real cuts without dropping constitution mandates. Full decomposition: PERF-ANALYSIS-20260709.md. Runtime unaffected: interactivity 80–147 ms vs 500 ms SLO.                                                                                                                                                                                                                    |
| 2026-07-09 | Orchestrator recording project-owner approval (task-2 closeout)   | Rev. 3 (DEF-B1): raw limit 220→224 KB with warning threshold at 220 KB; gzip unchanged (70 KB critical / 68 KB warning; raw warning row added). Task-2 accessible dropdowns + currency domain added 7.8 KB legitimate weight; perf analysis found only ~300 B trimmable (applied same round). Decomposition: PERF-ANALYSIS-20260709-task2.md.                                                                                                                                                                                                          |
| 2026-07-10 | Orchestrator recording project-owner approval (task-4 intake)     | Rev. 4: raw 224→228 KB (warning 224), gzip 70→72 KB (warning 70). Task-4 exchange-rates feature (banrep SUAMECA + banxico SIE adapters, conversion, UI states, dropdown positioning engine, COP) estimated +3.5–4 KB raw by ADR-0010; approved via decision round together with the MXN-via-Banxico source decision. Verified post-implementation by the perf gate check.                                                                                                                                                                              |
| 2026-07-10 | Orchestrator recording project-owner approval (task-4 closeout)   | Rev. 5: raw 228→229 KB (warning 228); gzip limit unchanged at 72 KB (warning raised 70→71.8 KB). Measured task-4 floor 228,192 B raw / 71,826 B gzip; perf verified NO trims ≥100 B remain (fx domain ~9 KB minified legitimate); terser lever rejected (2.3–4.6 KB gain vs 6–15× slower minify). Decomposition: PERF-ANALYSIS-20260710-task4.md.                                                                                                                                                                                                      |
| 2026-07-10 | Orchestrator recording project-owner approval (task-6 intake)     | Rev. 6: raw 229→233 KB (warning 232), gzip 72→74 KB (warning 73.5). Task-6 CJK expansion (zh/ja 56-key translation files, CN/JP regions, CNY/JPY currencies via curl-verified SUAMECA series 28/33). Owner ratified single-bundle over lazy locale chunks (architect quantified both; chunks deferred until locale count warrants). Estimates: +3.4 KB raw / +1.1 KB gzip; to be verified by perf gate post-implementation. See ADR-0011.                                                                                                              |
| 2026-07-10 | Orchestrator recording project-owner approval (task-7 intake)     | Rev. 7: raw 233→237 KB (warning 236), gzip 74→75.5 KB (warning 75); NEW font budget row ≤45 KB woff2 transfer (self-host ratified over Google CDN — no external origins). Task-7 mobile fullscreen menu (CodePen OJLMgYY fidelity contract per ADR-0012) estimated +4 KB raw / +1.4 KB gzip JS. To be verified by perf gate post-implementation.                                                                                                                                                                                                       |
| 2026-07-11 | Orchestrator recording project-owner approval (task-7 closeout)   | Rev. 8: raw 237→240 KB (warning 239.5); gzip UNCHANGED 75.5 KB (passes at 75,312). Perf decomposed the full +7,446 B MobileMenu delta (components, focus trap, localized labels ×4, a11y announcers); real trims only ~178 B (icon/label dedup, applied); architect estimate gap attributed (translations+announcers+interface overhead not estimated). Same round: CSS resource row corrected 10/3→30/6.5 KB (stale since pre-task-6; enforced CSS gzip ≤10 KB SLO unchanged). Decomposition: PERF-ANALYSIS-20260710-task7.md.                        |
| 2026-07-11 | Orchestrator recording project-owner approval (task-9 intake)     | Rev. 9: CHUNKED structure ratified over single-bundle raise — main tightened 240→237 KB raw / 75.5→75 KB gzip (lazy locale chunks per ADR-0011 Option A activated + lazy geo chunk per ADR-0014); per-chunk caps 3 KB raw / 1-1.5 KB gzip (geo, locale-zh, locale-ja). Owner also approved: geo providers api.country.is + get.geojs.io fallback (new origins, curl-verified twice) and GPS inclusion (override of architect recommendation; adds api.bigdatacloud.net reverse-geocode origin, coords sent only after user grants the browser prompt). |
| 2026-07-11 | Orchestrator recording project-owner approval (task-9 closeout)   | Rev. 10: main 237→241 KB raw (warning 240.5) / 75→76 KB gzip (warning 75.7); chunk caps unchanged (all chunks green: geo 2,726 / ja 1,685 / zh 1,359). Perf decomposition: CJK move-out saved 3,044 B as planned but the lazy-loading machinery (locale loader + fallback, detection trigger hook, apply callback) is ~3,250 B of legitimate main weight missed by the rev.9 estimate; 0 B relocatable. Decomposition: PERF-ANALYSIS-20260711-task9.md.                                                                                                |
