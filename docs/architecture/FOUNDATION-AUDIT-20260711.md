# Foundation Boilerplate Audit

**Date:** 2026-07-11  
**Auditor:** Architect  
**Task:** 10 (Foundation Audit)  
**Baseline:** 23f8a49  
**Status:** READ-ONLY audit - prioritized flaw register

---

## Executive Summary

This audit examines the vite-boilerplate-scss codebase from the perspective of "what will every
downstream project need that this template lacks or gets wrong?" The template is mature in many
areas (hexagonal structure, 100% coverage, CI/CD, ADRs, accessibility) but has several gaps that
would cause every downstream project to implement the same fixes independently.

**Flaw Counts:**

- CRITICAL: 2
- HIGH: 4
- MEDIUM: 6
- LOW: 4

---

## CRITICAL Flaws

### CRIT-001: No React Error Boundary

**Severity:** CRITICAL  
**Status:** FIXED (task 10, phase 2b)  
**Evidence:** `grep -r "ErrorBoundary\|componentDidCatch\|getDerivedStateFromError"` returns no
results in `/src`. The `App.tsx` wraps providers but has no error boundary at app root level.  
**Impact:** Any uncaught render error crashes the entire app with a blank white screen. Every
downstream project must implement their own error boundary.  
**Fix Estimate:** S (Small) - 2-4 hours  
**Fixable This Task:** YES

**Required Fix:**

- Create `src/shared/components/ErrorBoundary/ErrorBoundary.tsx` with `componentDidCatch` +
  `getDerivedStateFromError`
- Wrap `App.tsx` content in `<ErrorBoundary>`
- Localized fallback UI (uses i18n keys)
- 100% test coverage

**Resolution:** ErrorBoundary class component with functional wrapper for i18n. Localized error keys
in all 4 locales. Hardcoded fallback for boundary-of-last-resort per CONTRACTS. 100% test coverage.
Bundle: 241,000 B exactly (within limit).

---

### CRIT-002: No Lazy Chunk Load Failure Handling

**Severity:** CRITICAL  
**Evidence:** `src/i18n/translations/index.ts:45-68` shows `loadLocale()` has a try/catch that
returns `null` on failure, but there is NO user feedback. The
`src/geo-detection/hooks/useGeoDetection.ts:54-56` lazy imports with only a catch that silently
swallows errors.  
**Impact:** If locale chunk zh/ja or geo chunk fails to load (network error, chunk 404 after
deployment), user sees stale fallback (English) with no indication of failure. No retry mechanism.  
**Fix Estimate:** M (Medium) - 4-8 hours  
**Fixable This Task:** NO (requires UX decision for failure UI)

**Required Fix:**

- Define chunk load error handling strategy (retry? toast? fallback UI?)
- Implement error boundary or Suspense fallback for lazy chunks
- Add retry mechanism for transient failures
- Document the pattern in an ADR

---

## HIGH Flaws

### HIGH-001: No Global Unhandled Promise Rejection Handler

**Severity:** HIGH  
**Status:** FIXED (task 10, phase 2b)  
**Evidence:** `grep -r "unhandledrejection\|window\.onerror"` returns no results. The external API
calls (BanRep, Banxico, geo providers) fail silently with no global catch-all.  
**Impact:** Silent failures in production make debugging difficult. Downstream projects must each
add error reporting.  
**Fix Estimate:** S (Small) - 1-2 hours  
**Fixable This Task:** YES

**Resolution:** Inline handler in main.tsx: `window.addEventListener('unhandledrejection', ...)`.
Logs with `[UnhandledRejection]` prefix. Does not swallow (no preventDefault). Template seam comment
for downstream reporters. Tested via `src/shared/bootstrap/unhandled-rejection.spec.ts`.

**Required Fix:**

- Add `window.addEventListener('unhandledrejection', handler)` in `main.tsx`
- Log to console in dev, prepare hook for production error service (Sentry, etc.)

---

### HIGH-002: CI Does Not Enforce Bundle Budgets

**Severity:** HIGH  
**Evidence:** `.github/workflows/ci.yml` runs `vite build` but has NO step that checks output size
against `docs/performance/budgets.md`. The budget enforcement is manual (loop-based).  
**Impact:** CI can pass while bundle exceeds limits. Downstream projects inherit this gap.  
**Fix Estimate:** S (Small) - 2-3 hours  
**Fixable This Task:** YES

**Required Fix:**

- Add CI step after build that parses `dist/assets/*.js` sizes
- Fail CI if main chunk exceeds 241KB raw or 76KB gzip (rev.10)
- Reference budgets.md in CI comments

---

### HIGH-003: README is Outdated and Inaccurate

**Severity:** HIGH  
**Status:** FIXED (task 10, phase 2b)  
**Evidence:** `README.md` says "npm install" (line 28) - constitution mandates pnpm only. Says "npm
run dev" (line 34). No mention of i18n, theming, dropdowns, mobile menu, geo-detection, currency
conversion, CI, Docker, or any feature built since baseline.  
**Impact:** New developers get wrong instructions and no overview of the actual capabilities.  
**Fix Estimate:** M (Medium) - 2-4 hours  
**Fixable This Task:** NO (needs content writing, out of architect scope)

**Required Fix:**

- Complete rewrite reflecting actual tech stack and commands
- Document: pnpm commands, features, architecture, testing, Docker, CI

**Resolution:** Complete rewrite with: pnpm-only commands, accurate feature list (i18n 4 locales,
geo-detection, currency conversion 7 currencies, theming, mobile menu), scripts table,
folder-by-feature structure, doc pointers (budgets.md, CONTRACTS.md),
adding-a-feature/adding-a-locale recipes, VITE_BANXICO_TOKEN requirement, 5 external origins with
privacy note. Zero bundle cost.

- Add "Adding a new feature" quick-start section

---

### HIGH-004: Pre-commit vs CI Parity Gap

**Severity:** HIGH  
**Evidence:**

- Pre-commit (`.husky/pre-commit`): format, lint, ts-check, depcheck
- CI (`.github/workflows/ci.yml`): format, lint, ts-check, jest, e2e, coverage 100%, docker build,
  Trivy scan
- **Missing from pre-commit:** jest, e2e (intentional for speed)
- **Missing from CI:** depcheck

CI runs depcheck as a warning only (not present in the script), so unused deps can merge.  
**Impact:** Dependency drift can enter via CI despite passing pre-commit.  
**Fix Estimate:** S (Small) - 30 minutes  
**Fixable This Task:** YES

**Required Fix:**

- Add depcheck step to CI (after install, before lint)
- Or document intentional omission in an ADR

---

## MEDIUM Flaws

### MED-001: No Router - Structure Not Router-Ready

**Severity:** MEDIUM  
**Evidence:** `grep "react-router\|@tanstack/router"` in package.json returns nothing. `App.tsx`
renders `<Greeting>` directly with no route structure.  
**Impact:** Every downstream project adding routing must restructure App.tsx and decide where routes
live. No documented seam.  
**Fix Estimate:** S (Small) - 1-2 hours  
**Fixable This Task:** YES (document the seam, not add router)

**Required Fix:**

- Add ADR "Router Integration Point" documenting:
  - Where router provider should wrap (inside ThemeProvider, outside I18nProvider or vice versa)
  - Folder structure for routes (`src/routes/` or feature-colocated)
  - Lazy loading strategy alignment with existing chunks

---

### MED-002: No Documented "Add a Feature" Recipe

**Severity:** MEDIUM  
**Evidence:** `templates/component/` and `templates/hook/` exist with scaffolds, but NO
documentation explains the full process: create domain, add to CONTRACTS.md, update translations,
write tests.  
**Impact:** Every new team member re-discovers the pattern.  
**Fix Estimate:** S (Small) - 2-3 hours  
**Fixable This Task:** YES

**Required Fix:**

- Create `docs/CONTRIBUTING.md` or `docs/HOW-TO-ADD-FEATURE.md` with:
  - Step-by-step: domain creation, signals, hooks, providers, components
  - Checklist: translations all locales, tests, arch test update, e2e

---

### MED-003: No ADR Template

**Severity:** MEDIUM  
**Evidence:** `find . -name "adr-template*"` returns nothing. Existing ADRs follow a pattern but
it's not templated.  
**Impact:** ADR quality varies; new developers guess the format.  
**Fix Estimate:** S (Small) - 30 minutes  
**Fixable This Task:** YES

**Required Fix:**

- Create `docs/architecture/ADR-TEMPLATE.md` with standard sections:
  - Title, Date, Status, Context, Decision, Consequences, Alternatives Considered

---

### MED-004: localStorage Keys Not Inventoried in One Place

**Severity:** MEDIUM  
**Evidence:** Storage keys are scattered across domain configs:

- `src/i18n/config/locales.ts`: `app-locale`
- `src/theme/config/themes.ts`: `app-theme`
- `src/region/config/regions.ts`: `app-region`
- `src/currency/config/currencies.ts`: `app-currency`
- `src/exchange-rates/config/series.ts`: `app-exchange-rates`

No single file lists all keys.  
**Impact:** Key collision risk in downstream projects; migration scripts must hunt for keys.  
**Fix Estimate:** S (Small) - 1 hour  
**Fixable This Task:** YES

**Required Fix:**

- Create `src/shared/config/storage-keys.ts` re-exporting all keys with comments
- Or add section to CONTRACTS.md listing all keys

---

### MED-005: No i18n Scaling Documentation

**Severity:** MEDIUM  
**Evidence:** Adding locale #5 requires:

1. Add to `SupportedLocale` type union
2. Add to `SUPPORTED_LOCALES` array
3. Add to `LOCALE_METADATA`
4. Create translation file
5. Add lazy loader in `translations/index.ts`
6. Update FOUC allowlist (none exists for locales, only theme)
7. Update tests (arch tests, integration tests)
8. Update CONTRACTS.md

None of this is documented.  
**Impact:** Each locale addition is error-prone.  
**Fix Estimate:** S (Small) - 1-2 hours  
**Fixable This Task:** YES

**Required Fix:**

- Add "Adding a New Locale" section to CONTRACTS.md or separate guide
- Include: type union, config, metadata, translation file, lazy loading, tests

---

### MED-006: nginx Missing Brotli Compression

**Severity:** MEDIUM  
**Evidence:** `docker/nginx.conf` has gzip but NO brotli. Modern browsers support brotli with
~15-25% better compression.  
**Impact:** Suboptimal transfer sizes in production.  
**Fix Estimate:** S (Small) - 1 hour  
**Fixable This Task:** YES

**Required Fix:**

- Add brotli_static or brotli module config
- Or document as intentional (alpine image may not have brotli module)

---

## LOW Flaws

### LOW-001: .env.example is Minimal

**Severity:** LOW  
**Evidence:** `.env.example` contains only `VITE_BANXICO_TOKEN`. No documentation of whether other
env vars might be needed.  
**Impact:** Minor - the token is the only env var currently.  
**Fix Estimate:** S (Small) - 15 minutes  
**Fixable This Task:** YES

**Required Fix:**

- Add comments in .env.example explaining what the token is for
- Note that it's optional (app works without MXN rates)

---

### LOW-002: No Runtime Env Validation

**Severity:** LOW  
**Evidence:** `src/exchange-rates/config/env.ts` reads the token but doesn't validate format. No
zod/valibot schema.  
**Impact:** Invalid token silently fails at runtime.  
**Fix Estimate:** M (Medium) - 2-3 hours  
**Fixable This Task:** NO (needs schema library decision)

**Required Fix:**

- Add build-time or runtime env validation
- Document required format

---

### LOW-003: CONTRACTS.md vs Checklist Portability

**Severity:** LOW  
**Evidence:** `docs/REQUIREMENTS-CHECKLIST.md` is 51KB of task-specific rows (TASK-X prefixes).
`CONTRACTS.md` is authoritative architecture. Checklist is operational, not template-portable.  
**Impact:** Downstream projects would need to delete all rows and start fresh.  
**Fix Estimate:** S (Small) - 1 hour  
**Fixable This Task:** YES

**Required Fix:**

- Add note in checklist header: "This file is project-specific. For template use, clear all rows."
- Or move to docs/qa/ to signal it's not part of template

---

### LOW-004: Component Template Outdated

**Severity:** LOW  
**Evidence:** `templates/component/TemplateName.tsx` uses `default export` (line 14) but actual
components use named exports. Uses `className='templateName'` instead of CSS modules pattern.  
**Impact:** Generated components need manual fixes.  
**Fix Estimate:** S (Small) - 30 minutes  
**Fixable This Task:** YES

**Required Fix:**

- Update template to use named export
- Update to use `styles.templateName` pattern matching actual codebase

---

## Items Verified as GOOD

The following areas were audited and found satisfactory:

1. **CI Workflow Completeness:** Runs lint, tsc, jest (100% enforced), e2e, Docker build, Trivy
   scan, SBOM. Missing only depcheck (noted above).

2. **Docker/nginx for Chunked Build:**
   - Immutable caching for hashed assets: YES
     (`expires 1y; add_header Cache-Control "public, immutable"`)
   - MIME types: Uses `/etc/nginx/mime.types` which includes woff2
   - Gzip: Enabled with correct types
   - SPA fallback: YES (`try_files $uri $uri/ /index.html`)
   - Healthcheck: YES (`/health` endpoint + Docker HEALTHCHECK)

3. **C4 Diagrams:** All exist (`docs/diagrams/C4-*.md`)

4. **Bounded Context Map:** Exists (`docs/diagrams/bounded-context-map.md`)

5. **ADRs:** 14 ADRs covering all major decisions

6. **Architecture Tests:** `src/shared/test/arch/` contains architecture.spec.ts and
   design-system.spec.ts validating module boundaries

7. **Network Failure Handling:** Exchange rates adapter has try/catch with stale cache fallback. Geo
   detection has try/catch. (But no user feedback - see CRIT-002)

8. **Storage Key Convention:** All use `app-*` prefix consistently

9. **Scaffold Templates:** Exist in `templates/component/` and `templates/hook/`

---

## Recommendations by Priority

### Fixable This Task (S-sized)

1. CRIT-001: Add ErrorBoundary component
2. HIGH-001: Add unhandledrejection handler
3. HIGH-002: Add bundle budget check to CI
4. HIGH-004: Add depcheck to CI
5. MED-001: Document router integration point (ADR)
6. MED-002: Create "Add a Feature" guide
7. MED-003: Create ADR template
8. MED-004: Inventory localStorage keys
9. MED-005: Document i18n scaling process
10. MED-006: Add brotli or document omission
11. LOW-001: Enhance .env.example
12. LOW-003: Mark checklist as project-specific
13. LOW-004: Update component template

### Register-Only (Needs Decision or Larger Scope)

1. CRIT-002: Lazy chunk failure UX (needs design decision)
2. HIGH-003: README rewrite (content creation)
3. LOW-002: Runtime env validation (needs library decision)

---

## Fix Sequencing (If Approved)

If owner approves fixes for S-sized items:

1. **First:** CRIT-001 (ErrorBoundary) - highest impact
2. **Second:** HIGH-001, HIGH-002, HIGH-004 (CI/resilience)
3. **Third:** MED-* documentation items (can be batched)
4. **Last:** LOW-* polish items

Estimated total: 12-16 hours of implementation + testing.

---

## Appendix: Evidence Commands

```bash
# Error boundary search
grep -r "ErrorBoundary\|componentDidCatch\|getDerivedStateFromError" src/

# Unhandled rejection search
grep -r "unhandledrejection\|window\.onerror" src/

# Storage key inventory
grep -r "STORAGE_KEY\s*=" src/ --include="*.ts" | grep "export"

# CI depcheck check
grep "depcheck" .github/workflows/ci.yml

# Budget enforcement check
grep -A10 "Build production bundle" .github/workflows/ci.yml
```
