# Security Audit Report

**Project:** vite-boilerplate-scss (React 19 + Vite 8 + TypeScript Frontend) **Date:** 2026-06-29
**Auditor:** Security Auditor Agent **Scope:** Frontend-only React application with hand-rolled i18n
subsystem

---

## Executive Summary

**Overall Verdict: PASS-WITH-NOTES**

The frontend application demonstrates sound security practices for a client-side React application.
No critical or high-severity vulnerabilities were identified. One moderate-severity transitive
dependency vulnerability exists in devDependencies only. Minor recommendations are provided for
deployment hardening.

---

## 1. Findings Table

| ID      | Severity | Category   | Location                    | Description                                                                                                                                     | Recommendation                                                                  | Status            |
| ------- | -------- | ---------- | --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- | ----------------- |
| SEC-001 | Moderate | Dependency | js-yaml@3.15.0 (transitive) | Quadratic-complexity DoS vulnerability (GHSA-h67p-54hq-rp68) in js-yaml via Jest/Istanbul chain. DevDependency only, not shipped to production. | Update when transitive dependency chain allows (upstream Jest update).          | Accepted          |
| SEC-002 | Info     | Config     | package.json                | `packageManager: yarn@4.9.1` conflicts with mandated pnpm usage. Mitigated by `.npmrc` and `--pm-on-fail=ignore`.                               | Document in README. Already documented in ENGINEERING-NOTES.md.                 | Accepted          |
| SEC-003 | Info     | Missing    | .gitignore                  | No explicit `.env` entry but generic patterns cover it.                                                                                         | Already covered by existing patterns.                                           | Closed            |
| SEC-004 | Info     | Headers    | N/A (deployment)            | No CSP/HSTS/X-Frame-Options headers configured (handled at deployment/CDN level).                                                               | Configure security headers in production deployment (Nginx, CDN, or meta tags). | Open (Deployment) |

---

## 2. Dependency / Supply Chain Audit

### 2.1 pnpm Audit Results

```
Command: pnpm --pm-on-fail=ignore audit
Exit Code: Non-zero (1 moderate finding)
```

| Severity | Count | Notes                            |
| -------- | ----- | -------------------------------- |
| Critical | 0     | -                                |
| High     | 0     | -                                |
| Moderate | 1     | js-yaml DoS (devDependency only) |
| Low      | 0     | -                                |

**Details:**

- **Package:** js-yaml@3.15.0
- **Vulnerability:** GHSA-h67p-54hq-rp68 (CWE-407: Quadratic-complexity DoS)
- **Patched in:** >=4.1.2
- **Path:** eslint-plugin-jest > jest > @jest/core > ... > @istanbuljs/load-nyc-config > js-yaml
- **Impact:** DevDependency only. Not bundled into production output. Risk is limited to
  denial-of-service during local development/CI if attacker can supply malicious YAML to Jest config
  processing.
- **Decision:** Accepted as low practical risk. Will resolve when upstream dependencies update.

### 2.2 Supply Chain Controls

| Control                 | Status    | Evidence                                 |
| ----------------------- | --------- | ---------------------------------------- |
| pnpm lockfile           | Present   | `pnpm-lock.yaml` (220.8KB)               |
| Lockfile in .gitignore  | No (good) | Lockfile tracked in git                  |
| npm/npx blocked         | Yes       | User-defined hooks prevent npm/npx usage |
| pnpm integrity checking | Enabled   | pnpm default behavior                    |

---

## 3. Secret Scan

### 3.1 Results

```
Command: grep for password|secret|api_key|token patterns
Result: No hardcoded secrets in src/
```

| Check                  | Result |
| ---------------------- | ------ |
| .env files committed   | No     | No .env* files exist in repo                          |
| .gitignore covers .env | Yes    | `.env`, `.env.local`, `.env.*.local` patterns present |
| Secrets in source code | No     | Grep found no matches in src/                         |
| Secrets in dist/       | No     | Build output clean                                    |

---

## 4. OWASP Frontend Security Review

### 4.1 XSS Surface Analysis

| Vector                  | Searched Pattern | Found | Assessment                   |
| ----------------------- | ---------------- | ----- | ---------------------------- |
| dangerouslySetInnerHTML | grep in src/     | 0     | No direct HTML injection     |
| innerHTML               | grep in src/     | 0     | No DOM manipulation          |
| eval()                  | grep in src/     | 0     | No dynamic code execution    |
| new Function()          | grep in src/     | 0     | No dynamic function creation |
| document.write          | grep in src/     | 0     | No document.write usage      |

**i18n t() Output:** The `t(key)` function returns plain strings rendered as JSX text content (e.g.,
`{t('greeting.hello')}`), not as HTML. This is safe - React escapes text content by default.

### 4.2 localStorage Usage

| Key          | Data Stored                    | Sensitive? | Validation                                 |
| ------------ | ------------------------------ | ---------- | ------------------------------------------ |
| `app-locale` | Locale code (e.g., "en", "es") | No         | `isSupportedLocale()` validates before use |

**Assessment:** Non-sensitive preference data only. Properly validated before use.

### 4.3 Input/Trust Boundary Validation

| Input Source              | Validation Function   | Applied?                        | DOM Impact              |
| ------------------------- | --------------------- | ------------------------------- | ----------------------- |
| localStorage (app-locale) | `isSupportedLocale()` | Yes (line 37, I18nProvider.tsx) | `<html lang>` attribute |
| navigator.language        | `isSupportedLocale()` | Yes (line 48, I18nProvider.tsx) | `<html lang>` attribute |
| URL parameters            | N/A                   | N/A                             | Not used                |

**Code Evidence (I18nProvider.tsx):**

```typescript
const stored = localStorage.getItem(LOCALE_STORAGE_KEY)
if (stored && isSupportedLocale(stored)) {
  // <-- Validation
  return stored
}
// ...
if (isSupportedLocale(browserLang)) {
  // <-- Validation
  return browserLang
}
```

All external inputs are validated against the allowlist before reaching the DOM.

---

## 5. OWASP Mapping

### 5.1 ASVS Level 1 Controls (Frontend)

| Control | Requirement                      | Status | Evidence                                       |
| ------- | -------------------------------- | ------ | ---------------------------------------------- |
| V1.4    | Access control at function level | N/A    | No auth in scope (frontend boilerplate)        |
| V5.1    | Input validation                 | Pass   | `isSupportedLocale()` guards all locale inputs |
| V5.3    | Output encoding                  | Pass   | React JSX escapes text content                 |
| V8.1    | Protection of sensitive data     | Pass   | No sensitive data stored client-side           |
| V14.1   | Secure build                     | Pass   | No source maps in production                   |

### 5.2 OWASP Top 10 2021 (Frontend Relevant)

| Risk                                                | Applicability | Status                                           |
| --------------------------------------------------- | ------------- | ------------------------------------------------ |
| A03:2021 Injection                                  | XSS surface   | Pass - no innerHTML/eval/dangerouslySetInnerHTML |
| A07:2021 Identification and Authentication Failures | N/A           | No auth in this frontend                         |
| A08:2021 Software and Data Integrity Failures       | Supply chain  | Pass - pnpm lockfile, 0 critical/high vuln       |

### 5.3 OWASP API Security Top 10

Not applicable - this is a static frontend with no API calls implemented.

---

## 6. Security Headers (Deployment Recommendations)

These headers should be configured at the web server/CDN level for production deployment:

```
Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; frame-ancestors 'none';
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), camera=(), microphone=()
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

Note: `'unsafe-inline'` for styles is needed for CSS modules. Consider using nonces or hashes in
production.

---

## 7. Build Output Analysis

| Check                | Result                 | Evidence                                |
| -------------------- | ---------------------- | --------------------------------------- |
| Source maps in dist/ | No                     | `find dist -name "*.map"` returns empty |
| .env bundled         | No                     | `grep .env dist/` returns empty         |
| Bundle size          | 189.6KB JS / 2.2KB CSS | Within budget (< 200KB raw)             |

---

## 8. SBOM (Software Bill of Materials)

### 8.1 Generation Command

```bash
pnpm --pm-on-fail=ignore licenses list --prod > docs/security/sbom-licenses.txt
# Or for JSON format:
# pnpm --pm-on-fail=ignore licenses list --prod --json > docs/security/sbom.json
```

### 8.2 Production Dependencies (Top-Level)

| Package    | Version | License    |
| ---------- | ------- | ---------- |
| react      | 19.2.7  | MIT        |
| react-dom  | 19.2.7  | MIT        |
| typescript | 6.0.3   | Apache-2.0 |
| vite       | 8.1.0   | MIT        |

### 8.3 License Summary (Production)

| License      | Count                       | Risk             |
| ------------ | --------------------------- | ---------------- |
| MIT          | Majority                    | Low (permissive) |
| Apache-2.0   | 2 (typescript, detect-libc) | Low (permissive) |
| BSD-3-Clause | 1 (source-map-js)           | Low (permissive) |
| ISC          | 1 (picocolors)              | Low (permissive) |

**No copyleft (GPL) licenses in production dependencies.**

---

## 9. Accepted Risks

| ID      | Risk                      | Justification                                                                                                 | Owner       |
| ------- | ------------------------- | ------------------------------------------------------------------------------------------------------------- | ----------- |
| SEC-001 | js-yaml moderate DoS      | DevDependency only, not shipped. Will update when upstream allows.                                            | Engineering |
| SEC-002 | packageManager mismatch   | Documented workaround in ENGINEERING-NOTES.md. pnpm enforced by hooks.                                        | Engineering |
| N/A     | react-icons mandate unmet | Constitution requires react-icons, but package.json is locked. Inline SVG used instead. Documented deviation. | Product     |

---

## 10. Recommendations

### Immediate (Pre-Release)

None required. All critical/high findings = 0.

### Short-Term (Next Sprint)

1. Configure security headers at deployment layer (SEC-004)
2. Add explicit CORS policy documentation for future API integration

### Long-Term

1. Monitor js-yaml for upstream patch propagation
2. Consider adding SBOM generation to CI pipeline
3. Add Dependabot/Renovate for automated dependency updates

---

## 11. Verification Commands

```bash
# Dependency audit (should show 0 critical/high)
pnpm --pm-on-fail=ignore audit --audit-level=high

# Secret scan (should return no matches)
grep -rn --include="*.ts" --include="*.tsx" --exclude-dir=node_modules \
  -E '(password|secret|api_key|auth_token|client_secret)' src/

# XSS vector scan (should return no matches)
grep -rn --include="*.ts" --include="*.tsx" --exclude-dir=node_modules \
  -E '(dangerouslySetInnerHTML|innerHTML|eval\(|new Function\()' src/

# Source map check (should return nothing)
find dist -name "*.map"
```

---

**Audit Complete**

Auditor: Security Auditor Agent Date: 2026-06-29 Status: PASS-WITH-NOTES

---

## Appendix A: Phase 2 Incremental Audit (2026-07-09)

**Scope:** Design system, theming (light/dark), region/country selector, navbar controls
**Trigger:** Added react-icons@^5.7.0, inline FOUC prevention script in index.html

### A.1 Dependency Review

#### react-icons@5.7.0

| Attribute         | Value                                    |
| ----------------- | ---------------------------------------- |
| Installed version | 5.7.0                                    |
| License           | MIT (permissive)                         |
| Transitive deps   | 0 (peer dep on react only)               |
| Install scripts   | None (no postinstall/preinstall/prepare) |
| pnpm allowBuilds  | Not required (no build scripts)          |

**Verdict:** Safe addition. No new transitive dependencies introduced.

#### pnpm audit

```
Command: pnpm audit --audit-level=high
Exit Code: 0
Result: No known vulnerabilities found
```

| Severity | Count |
| -------- | ----- |
| Critical | 0     |
| High     | 0     |
| Moderate | 0     |
| Low      | 0     |

Note: The previous js-yaml moderate finding (SEC-001) appears resolved in the current dependency
tree.

### A.2 Secret Scan (Phase 2 Diff)

| Target      | Pattern                                      | Result |
| ----------- | -------------------------------------------- | ------ |
| src/        | password, secret, api_key, client_secret     | Clean  |
| e2e/        | password, secret, api_key, client_secret     | Clean  |
| index.html  | password, secret, api_key, client_secret     | Clean  |
| src/ + e2e/ | encoded tokens (eyJ..., AKIA..., ghp_, etc.) | Clean  |

### A.3 OWASP Review: Changed Surface

#### A.3.1 index.html FOUC Prevention Script

```javascript
;(function () {
  var STORAGE_KEY = 'app-theme'
  var stored = null
  try {
    stored = localStorage.getItem(STORAGE_KEY)
  } catch (e) {}
  var theme =
    stored || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
  document.documentElement.setAttribute('data-theme', theme)
})()
```

| Risk                          | Assessment                                         |
| ----------------------------- | -------------------------------------------------- |
| XSS via interpolation         | None - no user/attacker-controllable interpolation |
| localStorage injection to DOM | Low - value written to `data-theme` attribute only |
| Prototype pollution           | None - no object property access patterns          |

**Analysis:** The script reads `localStorage.getItem('app-theme')` and writes it directly to
`document.documentElement.setAttribute('data-theme', theme)`. The value is NOT sanitized/validated
in the inline script itself. However:

1. The attribute is `data-theme` (custom data attribute), not `onclick` or `href`
2. CSS selectors match `[data-theme="light"]` / `[data-theme="dark"]` only
3. Invalid values simply don't match any CSS rule (no visual effect, no code execution)
4. The React ThemeProvider re-validates on mount with `isValidTheme()` (allowlist)

**Finding:** SEC-005 (INFO) - FOUC script does not validate localStorage value before DOM write.
Mitigated by: (a) data attribute is CSS-only, not executable, (b) React layer validates
subsequently. Accepted.

#### A.3.2 Theme/Region/i18n localStorage Adapters

| Adapter                         | Validation Function   | Allowlist                | Status |
| ------------------------------- | --------------------- | ------------------------ | ------ |
| theme/adapters/localStorage.ts  | `isValidTheme()`      | ['light', 'dark']        | Pass   |
| region/adapters/localStorage.ts | `isValidRegion()`     | ['US', 'ES', 'GB', 'MX'] | Pass   |
| i18n/signals/translator.ts      | `isSupportedLocale()` | ['en', 'es']             | Pass   |

All localStorage reads are validated against strict allowlists before use in application logic.

#### A.3.3 XSS Vectors

| Pattern                 | grep result | Assessment           |
| ----------------------- | ----------- | -------------------- |
| dangerouslySetInnerHTML | 0           | No HTML injection    |
| innerHTML               | 0           | No DOM manipulation  |
| eval(                   | 0           | No dynamic execution |
| new Function(           | 0           | No dynamic functions |
| document.write          | 0           | No document.write    |

#### A.3.4 Announcer Component

The `Announcer` component renders `{message}` as JSX text content. Message sources:

- `t('a11y.countryChangedTo')` - static translation string
- `REGION_METADATA[region].englishName` - static config object
- `t('a11y.themeChangedTo')` / `t('a11y.languageChangedTo')` - static translation strings

**Verdict:** No untrusted strings rendered. All sources are internal/static.

#### A.3.5 External Links

Link component at `src/shared/components/Link/Link.tsx`:

```typescript
const externalProps = external
  ? {
      target: '_blank',
      rel: 'noopener noreferrer',
    }
  : {}
```

**Verdict:** Correctly applies `rel="noopener noreferrer"` on `target="_blank"` links.

### A.4 CSP Consideration

The inline FOUC script requires `'unsafe-inline'` for `script-src` in CSP, or a nonce/hash.
Recommendation: For production deployment, compute a hash of the script and add to CSP header:

```
script-src 'self' 'sha256-<computed-hash>'
```

This is an existing deployment recommendation (SEC-004), now more relevant with the added script.

### A.5 Summary

| Gate              | Result | Evidence                                               |
| ----------------- | ------ | ------------------------------------------------------ |
| deps_scan_clean   | Pass   | `pnpm audit --audit-level=high` exit 0                 |
| secret_scan_clean | Pass   | grep patterns returned clean on src/, e2e/, index.html |
| no_critical_vuln  | Pass   | 0 critical, 0 high vulnerabilities                     |

| New Finding | Severity | Status   | Description                                                                                                              |
| ----------- | -------- | -------- | ------------------------------------------------------------------------------------------------------------------------ |
| SEC-005     | Info     | Accepted | FOUC script writes unvalidated localStorage to data-theme attribute; mitigated by CSS-only usage and React re-validation |

### A.6 Updated SBOM (Production Dependencies)

| Package               | Version | License    |
| --------------------- | ------- | ---------- |
| react                 | 19.2.7  | MIT        |
| react-dom             | 19.2.7  | MIT        |
| react-icons           | 5.7.0   | MIT        |
| @preact/signals-react | 3.10.2  | MIT        |
| typescript            | 6.0.3   | Apache-2.0 |
| vite                  | 8.1.0   | MIT        |

**License compliance:** All production dependencies use permissive licenses (MIT, Apache-2.0). No
copyleft licenses present.

---

**Phase 2 Incremental Audit Complete**

Auditor: Security Auditor Agent Date: 2026-07-09 Status: PASS (0 critical, 0 high, 1 info finding
accepted)

---

## Appendix B: Task 2 Phase 2 Incremental Triage (2026-07-09)

**Scope:** New Dropdown component (WAI-ARIA listbox), 4 navbar wrappers, currency domain
(localStorage persistence), e2e tests, dependency changes (devDependency only). **Trigger:**
@testing-library/user-event added to devDependencies.

### B.1 Dependency Delta

| Change | Package                     | Version | Target          | Notes                                   |
| ------ | --------------------------- | ------- | --------------- | --------------------------------------- |
| Added  | @testing-library/user-event | ^14.6.1 | devDependencies | Test utility, not shipped to production |

**Verification:** No new runtime dependencies appeared in this phase.

- react-icons@5.7.0 was added in Task 2 Phase 1 (already audited in Appendix A)

### B.2 pnpm Audit Results

```
pnpm audit --prod:  No known vulnerabilities found (exit 0)
pnpm audit (all):   No known vulnerabilities found (exit 0)
```

| Severity | Production | Dev | Notes                                  |
| -------- | ---------- | --- | -------------------------------------- |
| Critical | 0          | 0   | -                                      |
| High     | 0          | 0   | -                                      |
| Moderate | 0          | 0   | js-yaml issue resolved in current tree |
| Low      | 0          | 0   | -                                      |

### B.3 localStorage Adapters Review

| Adapter                           | Key                   | Data Stored                        | Sensitive | Validation                  |
| --------------------------------- | --------------------- | ---------------------------------- | --------- | --------------------------- |
| currency/adapters/localStorage.ts | app-currency          | Currency code (USD, EUR, GBP, MXN) | No        | isValidCurrency() allowlist |
| currency/adapters/localStorage.ts | app-currency-override | Boolean flag 'true'                | No        | === 'true' strict check     |
| region/adapters/localStorage.ts   | (existing)            | Region code (US, ES, GB, MX)       | No        | isValidRegion() allowlist   |
| theme/adapters/localStorage.ts    | (existing)            | Theme mode (light, dark)           | No        | isValidTheme() allowlist    |

**Security Analysis:**

- No JSON.parse on localStorage values (simple string reads only - no prototype pollution vector)
- All values validated against strict allowlists before use
- try/catch wrapping for SSR/private browsing edge cases
- Namespaced keys (app-currency, app-currency-override)
- No sensitive data stored (preferences only)

### B.4 XSS Vector Scan

| Pattern                 | Result              | Assessment                                            |
| ----------------------- | ------------------- | ----------------------------------------------------- |
| dangerouslySetInnerHTML | 0                   | Clean                                                 |
| innerHTML               | 4 (test files only) | document.body.innerHTML = '' for cleanup - not a risk |
| eval(                   | 0                   | Clean                                                 |
| new Function(           | 0                   | Clean                                                 |
| document.write          | 0                   | Clean                                                 |
| href="javascript:"      | 0                   | Clean                                                 |

### B.5 index.html Review

No changes from Phase 1 audit. FOUC prevention script unchanged (already accepted as SEC-005).

### B.6 Secret Scan

| Target                | Pattern                                              | Result |
| --------------------- | ---------------------------------------------------- | ------ |
| src/ (non-test files) | password, secret, api_key, client_secret, auth_token | Clean  |
| e2e/journeys/         | password, secret, api_key, client_secret, auth_token | Clean  |
| src/ + e2e/           | Encoded tokens (JWT, AWS keys, GitHub tokens)        | Clean  |

### B.7 Summary

| Gate              | Result | Evidence                                                      |
| ----------------- | ------ | ------------------------------------------------------------- |
| deps_scan_clean   | Pass   | pnpm audit --prod exit 0; pnpm audit exit 0                   |
| secret_scan_clean | Pass   | grep patterns on src/, e2e/journeys/ returned clean           |
| no_critical_vuln  | Pass   | 0 critical, 0 high vulnerabilities                            |
| localStorage_safe | Pass   | Strict allowlist validation, no JSON.parse, no sensitive data |

No new findings opened. SEC-005 (FOUC script) remains accepted from Phase 1.

---

**Task 2 Phase 2 Incremental Triage Complete**

Auditor: Security Auditor Agent Date: 2026-07-09 Status: PASS (0 critical, 0 high, 0 new findings)

---

## Appendix C: Task 3 Micro-Triage — FOUC Tri-State (2026-07-09)

**Scope:** ThemeModeButton supersession (dropdown -> tri-state cycle button: light/dark/system).
**Focus:** FOUC prevention script in index.html (only security-relevant change in Task 3).

### C.1 index.html FOUC Script Analysis

**Previous (Task 2):**
```javascript
var theme = stored || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
```

**Current (Task 3):**
```javascript
var theme
if (stored === 'light' || stored === 'dark') {
  // Explicit user preference
  theme = stored
} else {
  // 'system' or absent/invalid -> resolve from OS
  theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}
```

| Surface | Risk Assessment |
|---------|-----------------|
| Input source | localStorage.getItem('app-theme') — unchanged |
| Sink | document.documentElement.setAttribute('data-theme', theme) — unchanged |
| Validation | **NEW**: explicit allowlist check `stored === 'light' \|\| stored === 'dark'` |
| Fallback | matchMedia resolution for all other values (system/absent/invalid) |

**Security Impact:**

The new code explicitly validates localStorage values against an allowlist (`'light'` or `'dark'`) before using them directly. Invalid/absent/`'system'` values are resolved via matchMedia, never written raw to the DOM.

**SEC-005 Status Update: REDUCED**

The prior finding stated: "FOUC script writes unvalidated localStorage to data-theme attribute."
This is no longer accurate. The script now:
1. Accepts only `'light'` or `'dark'` from localStorage (explicit allowlist)
2. Resolves all other values (including `'system'`, empty, or attacker-injected garbage) to a computed value from matchMedia

The only values that reach `setAttribute('data-theme', ...)` are now guaranteed to be `'light'` or `'dark'`, both of which are static strings produced by the script itself, not arbitrary attacker-controlled values.

### C.2 React-Side Validation

`src/theme/config/themes.ts`:
```typescript
export const SUPPORTED_PREFERENCES: readonly ThemePreference[] = ['light', 'dark', 'system'] as const
export function isValidPreference(value: string): value is ThemePreference {
  return SUPPORTED_PREFERENCES.includes(value as ThemePreference)
}
```

`src/theme/adapters/localStorage.ts`:
```typescript
export function loadPersistedPreference(): ThemePreference | null {
  const stored = localStorage.getItem(THEME_STORAGE_KEY)
  if (stored && isValidPreference(stored)) { return stored }
  return null
}
```

React-side validation correctly includes `'system'` in the allowlist.

### C.3 Sink Analysis

| Potential Sink | Present? | Risk |
|----------------|----------|------|
| innerHTML | No | - |
| document.write | No | - |
| eval() | No | - |
| new Function() | No | - |
| URL/href interpolation | No | - |
| Script src | No | - |

The only DOM write is `setAttribute('data-theme', theme)` where `theme` is guaranteed to be `'light'` or `'dark'`.

### C.4 Other Changed Files

44 files changed in Task 3 diff. Filtered for security patterns:
- `e2e/journeys/dropdown-keyboard-navigation.spec.ts`: Test adjustments (theme dropdown removed)
- `src/i18n/types/TranslationKeys.ts`: Added aria-label translation keys for theme button

No auth, OAuth, secrets, SQL, CORS, CSP, or sensitive patterns detected.

### C.5 Dependency Status

`package.json` and `pnpm-lock.yaml` unchanged in Task 3. Inherited clean audit from Task 2.

### C.6 Secret Scan

```
git diff HEAD -- . | grep -iE '(password|secret|api_key|...|ghp_)'
Result: Clean (one false positive: 'no_secrets' key in state.json)
```

### C.7 Summary

| Gate | Result | Evidence |
|------|--------|----------|
| secret_scan_clean | Pass | grep on diff: no secrets (false positive excluded) |
| deps_scan_clean | Pass | package.json/pnpm-lock.yaml untouched; inherited Task 2 audit |
| fouc_script_sinkfree | Pass | Only sink is setAttribute('data-theme', 'light'\|'dark') |
| no_critical_vuln | Pass | 0 critical, 0 high |

| Finding | Status Change |
|---------|---------------|
| SEC-005 | REDUCED (was INFO/Accepted, now mitigated by explicit allowlist validation in FOUC script) |

---

**Task 3 Micro-Triage Complete**

Auditor: Security Auditor Agent
Date: 2026-07-09
Status: PASS (SEC-005 risk reduced; 0 critical; 0 high; 0 new findings)
