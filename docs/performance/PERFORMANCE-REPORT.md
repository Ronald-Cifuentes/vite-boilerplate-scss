# Performance Report

**Date:** 2026-06-29 **Iteration:** 1 **Status:** PASS

---

## Executive Summary

All performance budgets met. The application loads interactively in **74ms** (budget: 500ms) and the
JS bundle is **61.41 KB gzip** (budget: 65 KB). No performance bottlenecks detected.

---

## Budget Compliance

| Metric            | Budget    | Actual    | Margin   | Result   |
| ----------------- | --------- | --------- | -------- | -------- |
| App Interactivity | < 500ms   | 74ms      | +426ms   | **PASS** |
| JS Bundle (gzip)  | <= 65 KB  | 61.41 KB  | +3.59 KB | **PASS** |
| JS Bundle (raw)   | <= 200 KB | 194.18 KB | +5.82 KB | **PASS** |
| CSS Bundle (gzip) | <= 10 KB  | 0.97 KB   | +9.03 KB | **PASS** |
| CSS Bundle (raw)  | <= 10 KB  | 2.26 KB   | +7.74 KB | **PASS** |
| Build Time        | < 5s      | 175ms     | +4825ms  | **PASS** |

---

## Build Analysis

### Vite Build Output

```
vite v8.1.0 building client environment for production...
33 modules transformed.
dist/index.html                   0.46 kB | gzip:  0.30 kB
dist/assets/index-CXmDzS-h.css    2.26 kB | gzip:  0.97 kB
dist/assets/index-BRD4y17k.js   194.18 kB | gzip: 61.41 kB

Built in 175ms
```

### Bundle Composition

| Component        | Estimated Size | Notes                       |
| ---------------- | -------------- | --------------------------- |
| React 19 runtime | ~140 KB raw    | Dominates bundle (expected) |
| React DOM        | ~45 KB raw     | Client rendering            |
| Application code | ~9 KB raw      | i18n, components, styles    |
| Translations     | < 1 KB raw     | en.ts (460B) + es.ts (452B) |

**Analysis:** React 19 runtime represents ~95% of the bundle. Application code is minimal. No
tree-shaking opportunities identified; all code is exercised.

---

## Translation Size Analysis

| Locale    | Raw Size  | Impact on Bundle         |
| --------- | --------- | ------------------------ |
| en        | 460 bytes | Negligible               |
| es        | 452 bytes | Negligible               |
| **Total** | < 1 KB    | No code-splitting needed |

**Recommendation:** Code-splitting locales is NOT recommended. Total translation payload is under 1
KB. Dynamic import overhead would exceed the savings. This recommendation holds until translation
files exceed 10 KB per locale.

---

## Runtime Interactivity

### E2E Measurement (Primary Evidence)

- **Source:** `e2e/journeys/accessibility.spec.ts` - "App renders within performance budget" test
- **Method:** `Date.now()` before `page.goto()`, after `waitForSelector('[data-testid="app"]')`
- **Result:** **74ms** (confirmed in Frontend Engineer log:
  `logs/20260629-0753-Frontend_Engineer.md`)
- **Budget:** 500ms
- **Margin:** 426ms (85% under budget)

### Independent TTFB Verification

Server: `vite preview --port 4188`

| Asset              | TTFB   | Total Time | Size          |
| ------------------ | ------ | ---------- | ------------- |
| index.html         | 5.07ms | 5.11ms     | 464 bytes     |
| index-BRD4y17k.js  | 2.18ms | 2.40ms     | 194,181 bytes |
| index-CXmDzS-h.css | 1.18ms | 1.23ms     | 2,264 bytes   |

**Total theoretical minimum:** ~8.4ms network time + parse/hydration time.

---

## Render Path Analysis

### Critical Path

1. **HTML fetch:** 5ms (index.html, 464 bytes)
2. **CSS fetch:** 1ms (parallel with JS)
3. **JS fetch:** 2ms (194 KB)
4. **React hydration:** ~60ms (estimated from 74ms total - network)

### React Configuration

- `React.StrictMode`: Enabled (development double-render, production single)
- Single render pass
- No Suspense boundaries (not needed for this minimal app)
- No lazy loading (bundle is already small)

### i18n Resolution Cost

- **localStorage read:** O(1), ~0.1ms (once on mount)
- **Object lookup:** O(depth), depth=2, ~0.01ms per translation
- **Total i18n overhead:** < 1ms

---

## Infrastructure Configuration (Already Satisfied)

### nginx.conf (via DevOps Engineer)

| Feature              | Status     | Evidence                                              |
| -------------------- | ---------- | ----------------------------------------------------- |
| Gzip compression     | CONFIGURED | `gzip_comp_level 6`, includes JS/CSS/JSON             |
| Hashed asset caching | CONFIGURED | `expires 1y; Cache-Control "public, immutable"`       |
| index.html no-cache  | CONFIGURED | `Cache-Control "no-cache, no-store, must-revalidate"` |
| Security headers     | CONFIGURED | CSP, X-Frame-Options, etc.                            |
| Health endpoint      | CONFIGURED | `/health` returns 200                                 |

---

## Recommendations

### Already Satisfied

1. **Gzip compression** - Enabled in nginx.conf (level 6)
2. **Immutable asset caching** - 1 year for hashed JS/CSS
3. **No-cache for index.html** - Ensures fresh deployments
4. **Minimal bundle** - Under 65 KB gzip
5. **Fast build** - 175ms (well under 5s budget)
6. **Efficient i18n** - O(1) lookups, memoized hooks

### Future Optimizations (Not Required Now)

| Priority | Optimization          | When to Implement                     | Expected Gain          |
| -------- | --------------------- | ------------------------------------- | ---------------------- |
| Low      | Preconnect hints      | When adding CDN/external assets       | 50-100ms DNS/TLS       |
| Low      | Bundle analyzer in CI | When bundle exceeds 60 KB gzip        | Early warning          |
| Low      | Lazy-load locales     | When translations exceed 10 KB/locale | Reduce initial payload |
| Low      | Service Worker        | When offline support needed           | Instant repeat loads   |

---

## Bottleneck Analysis

### No Critical Bottlenecks Found

| Category              | Check                                | Result |
| --------------------- | ------------------------------------ | ------ |
| N+1 queries           | N/A (frontend)                       | N/A    |
| Unbounded queries     | N/A (frontend)                       | N/A    |
| Missing indexes       | N/A (frontend)                       | N/A    |
| Unbounded memory      | No arrays/objects grow unbounded     | PASS   |
| Unbounded concurrency | Single render, no concurrent fetches | PASS   |
| Oversized responses   | All assets < 200 KB raw              | PASS   |
| Synchronous blocking  | No blocking operations in render     | PASS   |
| Heavy computation     | No loops/recursion in render path    | PASS   |

---

## Evidence Artifacts

| Artifact              | Path                                       |
| --------------------- | ------------------------------------------ |
| E2E performance test  | `e2e/journeys/accessibility.spec.ts:54-64` |
| Frontend Engineer log | `logs/20260629-0753-Frontend_Engineer.md`  |
| DevOps Engineer log   | `logs/20260629-0759-DevOps_Engineer.md`    |
| nginx config          | `docker/nginx.conf`                        |
| Performance budgets   | `docs/performance/budgets.md`              |

---

## Conclusion

The application meets all performance requirements with significant margin:

- **Interactivity:** 74ms actual vs 500ms budget (85% under)
- **Bundle size:** 61.41 KB gzip vs 65 KB budget (5.5% under)
- **Build time:** 175ms actual vs 5s budget (96% under)

No performance regressions detected. No critical bottlenecks found. All infrastructure optimizations
(gzip, caching) are already configured.

**VERDICT: PASS**
