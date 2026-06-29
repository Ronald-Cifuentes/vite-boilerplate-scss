# Performance Budgets

**Owner:** Performance Engineer **Date:** 2026-06-29 **Status:** Approved

---

## SLO Definitions

This document defines performance budgets for the `vite-boilerplate-scss` frontend application.

### Primary SLO

| Metric            | Target    | Rationale                                           |
| ----------------- | --------- | --------------------------------------------------- |
| App Interactivity | < 500ms   | PRD NFR1 requirement; user perceives app as instant |
| JS Bundle (gzip)  | <= 65 KB  | PRD NFR1; keeps Time-to-Interactive low on 3G       |
| JS Bundle (raw)   | <= 200 KB | PRD NFR1; fast parsing on low-end devices           |
| CSS Bundle (gzip) | <= 10 KB  | Reasonable CSS overhead for mobile                  |
| Build Time        | < 5s      | PRD NFR1; fast CI/CD feedback loop                  |

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
| Main bundle    | 200 KB   | 65 KB    | Single bundle (no code-splitting needed for this minimal app) |
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

| Metric            | Warning | Critical | Action                           |
| ----------------- | ------- | -------- | -------------------------------- |
| JS gzip size      | > 60 KB | > 65 KB  | Investigate new deps, code-split |
| App interactivity | > 400ms | > 500ms  | Profile, optimize critical path  |
| Build time        | > 3s    | > 5s     | Check for slow transforms        |

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

| Date       | Author               | Change                    |
| ---------- | -------------------- | ------------------------- |
| 2026-06-29 | Performance Engineer | Initial budget definition |
