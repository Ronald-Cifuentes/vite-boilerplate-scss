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

| Surface      | Risk Assessment                                                               |
| ------------ | ----------------------------------------------------------------------------- |
| Input source | localStorage.getItem('app-theme') — unchanged                                 |
| Sink         | document.documentElement.setAttribute('data-theme', theme) — unchanged        |
| Validation   | **NEW**: explicit allowlist check `stored === 'light' \|\| stored === 'dark'` |
| Fallback     | matchMedia resolution for all other values (system/absent/invalid)            |

**Security Impact:**

The new code explicitly validates localStorage values against an allowlist (`'light'` or `'dark'`)
before using them directly. Invalid/absent/`'system'` values are resolved via matchMedia, never
written raw to the DOM.

**SEC-005 Status Update: REDUCED**

The prior finding stated: "FOUC script writes unvalidated localStorage to data-theme attribute."
This is no longer accurate. The script now:

1. Accepts only `'light'` or `'dark'` from localStorage (explicit allowlist)
2. Resolves all other values (including `'system'`, empty, or attacker-injected garbage) to a
   computed value from matchMedia

The only values that reach `setAttribute('data-theme', ...)` are now guaranteed to be `'light'` or
`'dark'`, both of which are static strings produced by the script itself, not arbitrary
attacker-controlled values.

### C.2 React-Side Validation

`src/theme/config/themes.ts`:

```typescript
export const SUPPORTED_PREFERENCES: readonly ThemePreference[] = [
  'light',
  'dark',
  'system',
] as const
export function isValidPreference(value: string): value is ThemePreference {
  return SUPPORTED_PREFERENCES.includes(value as ThemePreference)
}
```

`src/theme/adapters/localStorage.ts`:

```typescript
export function loadPersistedPreference(): ThemePreference | null {
  const stored = localStorage.getItem(THEME_STORAGE_KEY)
  if (stored && isValidPreference(stored)) {
    return stored
  }
  return null
}
```

React-side validation correctly includes `'system'` in the allowlist.

### C.3 Sink Analysis

| Potential Sink         | Present? | Risk |
| ---------------------- | -------- | ---- |
| innerHTML              | No       | -    |
| document.write         | No       | -    |
| eval()                 | No       | -    |
| new Function()         | No       | -    |
| URL/href interpolation | No       | -    |
| Script src             | No       | -    |

The only DOM write is `setAttribute('data-theme', theme)` where `theme` is guaranteed to be
`'light'` or `'dark'`.

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

| Gate                 | Result | Evidence                                                      |
| -------------------- | ------ | ------------------------------------------------------------- |
| secret_scan_clean    | Pass   | grep on diff: no secrets (false positive excluded)            |
| deps_scan_clean      | Pass   | package.json/pnpm-lock.yaml untouched; inherited Task 2 audit |
| fouc_script_sinkfree | Pass   | Only sink is setAttribute('data-theme', 'light'\|'dark')      |
| no_critical_vuln     | Pass   | 0 critical, 0 high                                            |

| Finding | Status Change                                                                              |
| ------- | ------------------------------------------------------------------------------------------ |
| SEC-005 | REDUCED (was INFO/Accepted, now mitigated by explicit allowlist validation in FOUC script) |

---

**Task 3 Micro-Triage Complete**

Auditor: Security Auditor Agent Date: 2026-07-09 Status: PASS (SEC-005 risk reduced; 0 critical; 0
high; 0 new findings)

---

## Appendix D: Task 4 Full Triage — External Rates Integration (2026-07-10)

**Scope:** New `src/exchange-rates/` domain introducing the app's FIRST outbound network calls — two
external APIs (BanRep SUAMECA, Banxico SIE) fetched directly from the browser.

**Trigger:** ADR-0010 implementation for currency conversion.

### D.1 Outbound Request Surface

| Aspect                  | Finding                                                                                                                                                   | Status |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| HTTPS-only URLs         | `series.ts` defines `SUAMECA_BASE_URL` (https://suameca.banrep.gov.co/...) and `BANXICO_BASE_URL` (https://www.banxico.org.mx/...). Both HTTPS.           | PASS   |
| Static URL construction | URLs built from constants + static `idSerie` param (1/30/31) or `BANXICO_SERIES` constant. No user/attacker-influenced path segments.                     | PASS   |
| AbortController timeout | `http.ts:12` sets 8000ms timeout via `FETCH_TIMEOUT_MS` constant.                                                                                         | PASS   |
| No credentials sent     | `http.ts:14` `fetch(url, { ...options, signal })` — no `credentials: 'include'`. Defaults to `'same-origin'` which does NOT send cookies to cross-origin. | PASS   |
| Limited endpoints       | Only 2 external hosts callable: `suameca.banrep.gov.co`, `banxico.org.mx`. No dynamic host injection path.                                                | PASS   |

**Evidence:** `src/exchange-rates/config/series.ts`, `src/exchange-rates/adapters/http.ts`

### D.2 Response Handling (Critical)

| Check                              | Implementation                                                                                                                                      | Status |
| ---------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| Strict shape validation            | BanRep: `Array.isArray(data) && data.length` before access. Banxico: Navigation `?.bmx?.series?.[0]` with null checks.                              | PASS   |
| Numeric guards                     | `http.ts:39-40` `parseNum()`: `Number.isFinite(n) && n > 0` — reject NaN, Infinity, <=0, non-numeric.                                               | PASS   |
| Orientation assertion (BanRep)     | `BanrepRatesAdapter.ts:24-25` regex `UNIDAD_RE = /^COP\/([A-Z]{3})$/` MUST match exactly; mismatched `unidad` → returns `null` (fail-closed).       | PASS   |
| Orientation assertion (Banxico)    | `BanxicoRatesAdapter.ts:16` `s?.idSerie === BANXICO_SERIES` — rejects wrong series (fail-closed).                                                   | PASS   |
| No eval/Function/innerHTML         | `grep -r 'dangerouslySetInnerHTML\|innerHTML\|eval\(' src/exchange-rates/` returns 0 matches (test cleanup `innerHTML = ''` is in spec files only). | PASS   |
| Rendered via React text nodes      | `Greeting.tsx:49` `{price}` — string rendered as JSX text content, auto-escaped by React.                                                           | PASS   |
| aria-labels are post-parse numbers | Rate status uses `t('rates.stale')` with age calculated from `staleAgeMs` (number). No raw JSON injected into aria.                                 | PASS   |

**Fail-Closed Verification:**

- BanRep malformed `unidad` → `fetchBanrepRate()` returns `null`
- BanRep non-positive rate → `parseNum()` returns `null`
- Banxico wrong series ID → `extractSeries()` returns `null`
- Banxico `N/E` holiday marker → `parseBxResponse()` returns `null`
- Both → `status: 'unavailable'` or `status: 'partial'`, COP fallback displayed

### D.3 localStorage Cache Audit

| Key                  | Data Type        | Sensitive         | Validation |
| -------------------- | ---------------- | ----------------- | ---------- |
| `app-exchange-rates` | CachedRates JSON | No (public rates) | Yes        |

**Validation Evidence (`rates-signal.ts:29-50`):**

1. `JSON.parse()` wrapped in try-catch → corrupted JSON → returns `null`
2. Checks `p.rates && p.cachedAt` exist
3. Validates `at.getTime()` is finite (reject invalid dates)
4. Iterates entries checking `typeof v.copPerUnit === 'number'`
5. Staleness bound: 24h (`STALENESS_BOUND_MS = 86400000`)
6. Corrupted/expired cache → discarded, not crash

**Namespace:** `app-exchange-rates` (distinct from `app-locale`, `app-theme`, `app-currency`)

**Nothing sensitive stored:** Only exchange rates (public data). No tokens, no PII.

### D.4 Token Handling — SEC-006 Formal Record

**Finding ID:** SEC-006 **Severity:** MEDIUM (pre-accepted) **Category:** Token Exposure **Status:**
ACCEPTED (owner decision 2026-07-10)

**Description:** The Banxico SIE API token (`VITE_BANXICO_TOKEN`) is embedded in the production
bundle via Vite's `import.meta.env` mechanism. Any user can extract it via browser DevTools or
bundle inspection.

**Why Accepted:**

1. Token is READ-ONLY — cannot modify data at Banxico
2. Token accesses FREE PUBLIC DATA — exchange rate publication (Tipo de cambio FIX)
3. No financial transactions or sensitive operations possible
4. Abuse ceiling is API quota exhaustion (Banxico's problem, not ours)
5. Token is revocable and rotatable via Banxico portal without deployment

**Mitigations Verified:**

- Token read from `process.env.VITE_BANXICO_TOKEN` via `env.ts` abstraction (line 15)
- Token ONLY sent to `banxico.org.mx` over HTTPS as query param (`?token=...`)
- Token passed through `encodeURIComponent()` (`BanxicoRatesAdapter.ts:38`)
- `.gitignore` covers `.env`, `.env.local`, `.env.*.local` (lines 94-98)
- `.env.example` contains placeholder `your_banxico_token_here`, not real token
- No real-looking tokens (64-hex, base64, JWT, AWS key patterns) committed anywhere in repo

**Operational Guidance:**

- Obtain token: https://www.banxico.org.mx/SieAPIRest/service/v1/token
- Revoke/rotate: Same portal (login → manage tokens)
- Deployment: Set `VITE_BANXICO_TOKEN` at build time
- If compromised: Rotate token; no user data exposed

**Owner Acceptance Date:** 2026-07-10 (per Architect log 20260710-0821)

### D.5 Denial/Abuse Posture

| Concern                | Assessment                                                                                                          | Status |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------- | ------ |
| Privacy: IP disclosure | User IP visible to BanRep/Banxico servers. Acceptable for feature (public central bank sites).                      | INFO   |
| Retry/backoff          | `refreshRates()` called once on init. No automatic retry loop. Manual refresh via hook `refresh()`. No tight loops. | PASS   |
| Failure degradation    | Failures → `status: 'unavailable'` or `status: 'partial'`. UI shows COP fallback. No crash loops.                   | PASS   |
| Resource exhaustion    | 8s timeout prevents hung connections. 4 parallel fetches max (USD/EUR/GBP + MXN).                                   | PASS   |

### D.6 Dependency Delta

```
pnpm audit --prod:  exit 0 (No known vulnerabilities)
pnpm audit:         exit 0 (No known vulnerabilities)
git diff HEAD --stat -- package.json pnpm-lock.yaml: (no changes)
```

No new dependencies added in Task 4.

### D.7 E2E Network Hygiene

**File:** `e2e/journeys/currency-conversion.spec.ts`

| Check                   | Finding                                                   | Status |
| ----------------------- | --------------------------------------------------------- | ------ |
| Real tokens in fixtures | No — mock uses literal numbers (`3284.6715`, `'17.4749'`) | PASS   |
| Token patterns in e2e   | grep found 0 matches for real token patterns              | PASS   |
| Mocking before navigate | `page.route()` called BEFORE `page.goto()`                | PASS   |

### D.8 Summary

| Gate                           | Result | Evidence                                                  |
| ------------------------------ | ------ | --------------------------------------------------------- |
| secret_scan_clean              | PASS   | grep patterns on src/, e2e/: 0 matches; no .env committed |
| deps_scan_clean                | PASS   | `pnpm audit` exit 0 (0 critical, 0 high, 0 moderate)      |
| no_critical_vuln               | PASS   | 0 critical vulnerabilities                                |
| no_unaccepted_high             | PASS   | SEC-006 (medium) accepted per owner decision              |
| response_validation_failclosed | PASS   | All parsers return null on malformed input                |
| xss_vectors_clean              | PASS   | 0 dangerouslySetInnerHTML/innerHTML/eval in non-test code |
| credentials_not_sent           | PASS   | fetch() uses default credentials (same-origin)            |
| urls_static                    | PASS   | All URLs from constants, no attacker-controlled segments  |

| Finding | Severity | Status   | Description                                                               |
| ------- | -------- | -------- | ------------------------------------------------------------------------- |
| SEC-006 | Medium   | Accepted | Banxico token in bundle; read-only public data; owner-accepted 2026-07-10 |

### D.9 Recommendations

1. **CSP Update (SEC-004 addendum):** Add `connect-src` directive for the two external APIs:

   ```
   connect-src 'self' https://suameca.banrep.gov.co https://www.banxico.org.mx;
   ```

2. **Token Rotation Schedule:** Quarterly rotation recommended even though no breach evidence.

3. **Monitoring:** Log `status: 'unavailable'` events to detect upstream API issues.

---

**Task 4 Full Triage Complete**

Auditor: Security Auditor Agent Date: 2026-07-10 Status: PASS (0 critical, 0 high, 1 medium
accepted)

---

## Appendix E: Task 6 Incremental Triage — CJK Locales and CNY/JPY Rates (2026-07-10)

**Scope:** BanRep SUAMECA series 28 (COP/CNY) and 33 (COP/JPY) added to exchange-rates domain; zh/ja
translation files; CN/JP regions; CNY/JPY currencies.

**Trigger:** Task 6 extended the outbound rates surface with two new SUAMECA series for CJK markets.

### E.1 Outbound Surface Verification

| Check             | Finding                                                                        | Status |
| ----------------- | ------------------------------------------------------------------------------ | ------ |
| New hosts         | None — SUAMECA series 28/33 use existing `https://suameca.banrep.gov.co` host  | PASS   |
| Protocol          | HTTPS only — no HTTP URLs in production code (`http://` only in test fixtures) | PASS   |
| Token for CNY/JPY | None required — BanRep SUAMECA is tokenless (unlike Banxico for MXN)           | PASS   |
| SEC-006 unchanged | Banxico token still only used for MXN cross-rate; no new bundle exposure       | PASS   |

**Evidence:** `src/exchange-rates/config/series.ts` lines 6-7 add CNY:28/JPY:33 to existing
BANREP_SERIES constant; `BanrepRatesAdapter.ts` contains no token handling (grep exit 1).

### E.2 Fail-Closed Validation Extended

| Assertion                | Implementation                                                                     | Status |
| ------------------------ | ---------------------------------------------------------------------------------- | ------ |
| Unidad regex for CNY     | `UNIDAD_RE = /^COP\/([A-Z]{3})$/` matches `COP/CNY`, `m[1] !== 'CNY'` fails closed | PASS   |
| Unidad regex for JPY     | Same regex matches `COP/JPY`, `m[1] !== 'JPY'` fails closed                        | PASS   |
| Numeric guard            | `parseNum()` requires `Number.isFinite(n) && n > 0` — unchanged                    | PASS   |
| Existing USD/EUR/GBP/MXN | No relaxation in diff — same strict validation                                     | PASS   |

**Evidence:** `src/exchange-rates/adapters/BanrepRatesAdapter.ts` lines 5, 24-25.

### E.3 Injection Sinks

| Vector                  | grep Result                                      | Status |
| ----------------------- | ------------------------------------------------ | ------ |
| dangerouslySetInnerHTML | 0 in non-test src/                               | PASS   |
| innerHTML               | 0 in non-test src/ (only test cleanup)           | PASS   |
| eval(                   | 0                                                | PASS   |
| new Function(           | 0                                                | PASS   |
| zh.ts content           | Plain text strings only; no HTML/script patterns | PASS   |
| ja.ts content           | Plain text strings only; no HTML/script patterns | PASS   |

**Evidence:** grep across `src/` excluding spec files returns empty.

### E.4 Allowlist Validation Extended

| Domain     | Allowlist            | Includes New Values               | Status |
| ---------- | -------------------- | --------------------------------- | ------ |
| Locales    | SUPPORTED_LOCALES    | en, es, zh, ja                    | PASS   |
| Regions    | SUPPORTED_REGIONS    | US, ES, GB, MX, CO, CN, JP        | PASS   |
| Currencies | SUPPORTED_CURRENCIES | COP, USD, EUR, GBP, MXN, CNY, JPY | PASS   |

**Evidence:** Unit tests in locales.spec.ts, regions.spec.ts, currencies.spec.ts verify all 4/7/7
values.

### E.5 Dependencies

| Check          | Finding                                   | Status |
| -------------- | ----------------------------------------- | ------ |
| package.json   | Unchanged in task 6 diff                  | PASS   |
| pnpm-lock.yaml | Unchanged in task 6 diff                  | PASS   |
| pnpm audit     | `No known vulnerabilities found` (exit 0) | PASS   |

### E.6 Secrets

| Target       | Pattern                                             | Result |
| ------------ | --------------------------------------------------- | ------ |
| zh.ts        | password, secret, token, api_key, JWT, AWS keys     | Clean  |
| ja.ts        | password, secret, token, api_key, JWT, AWS keys     | Clean  |
| series.ts    | password, secret, token, api_key, JWT, AWS keys     | Clean  |
| .env.example | Contains placeholder `your_banxico_token_here` only | PASS   |
| .gitignore   | .env, .env.local, .env.*.local covered              | PASS   |

### E.7 SEC-006 Status

**Status:** UNCHANGED

The Banxico token (SEC-006) remains accepted and scoped to MXN only. The new CNY/JPY rates use
BanRep SUAMECA which requires no authentication. No additional token exposure introduced.

### E.8 Summary

| Gate                      | Result | Evidence                                       |
| ------------------------- | ------ | ---------------------------------------------- |
| outbound_surface_verified | PASS   | No new hosts; HTTPS only; no token for CNY/JPY |
| fail_closed_extended      | PASS   | Unidad assertion covers COP/CNY and COP/JPY    |
| injection_sinks_clean     | PASS   | 0 dangerous sinks in non-test code             |
| allowlists_extended       | PASS   | zh/ja, CN/JP, CNY/JPY in validation functions  |
| deps_unchanged            | PASS   | package.json/pnpm-lock.yaml untouched          |
| secret_scan_clean         | PASS   | No secrets in new files                        |
| SEC-006_unchanged         | PASS   | Banxico token scope unchanged (MXN only)       |

**No new findings opened.** SEC-006 (medium, accepted) remains the only tracked finding.

---

**Task 6 Incremental Triage Complete**

Auditor: Security Auditor Agent Date: 2026-07-10 Status: PASS (0 critical, 0 high, 0 new findings;
SEC-006 unchanged)

---

## Appendix F: Task 7 Incremental Triage — Self-Hosted Fonts and MobileMenu (2026-07-11)

**Scope:** Self-hosted font binaries (public/fonts/), preload links in index.html, MobileMenu
feature (pure frontend), e2e helper.

**Trigger:** Task 7 responsive navbar with fonts (Rubik Mono One + Roboto Mono) for CodePen OJLMgYY
fidelity.

### F.1 External Origin Verification

| Check                        | Finding                                              | Status |
| ---------------------------- | ---------------------------------------------------- | ------ |
| fonts.googleapis.com         | Not present in src/, index.html, or dist/            | PASS   |
| fonts.gstatic.com            | Not present                                          | PASS   |
| @import url(http...) in SCSS | Not present                                          | PASS   |
| Only approved external hosts | BanRep SUAMECA and Banxico unchanged; no new origins | PASS   |

**Evidence:** `grep -rn` on src/, index.html, dist/ returned clean for external font patterns.

### F.2 Font Binary Provenance

| Asset                      | Magic Bytes               | Size (bytes) | Expected | Status |
| -------------------------- | ------------------------- | ------------ | -------- | ------ |
| rubik-mono-one-latin.woff2 | wOF2                      | 7,032        | 7,032    | PASS   |
| roboto-mono-latin.woff2    | wOF2                      | 32,752       | 32,752   | PASS   |
| OFL.txt                    | SIL Open Font License 1.1 | present      | present  | PASS   |

**Provenance claim:** Google Fonts API download (latin subset), per ADR-0012 Section 5.1.

**Supply-chain note:** Binary font files committed to repo. OFL license permits redistribution. No
executable code in woff2 format.

### F.3 Preload Correctness

| Element             | Attribute   | Value        | Required                  | Status |
| ------------------- | ----------- | ------------ | ------------------------- | ------ |
| link rel="preload"  | crossorigin | present      | Yes (CORS mode for fonts) | PASS   |
| link rel="preload"  | as          | "font"       | Yes                       | PASS   |
| link rel="preload"  | type        | "font/woff2" | Yes                       | PASS   |
| Font paths in dist/ | Exist       | Both present | Yes                       | PASS   |

**Evidence:** index.html lines 9-22; dist/fonts/ contains both files.

### F.4 MobileMenu XSS Surface

| Vector                  | Grep Result | Status |
| ----------------------- | ----------- | ------ |
| dangerouslySetInnerHTML | 0           | PASS   |
| innerHTML               | 0           | PASS   |
| eval(                   | 0           | PASS   |
| new Function(           | 0           | PASS   |
| document.write          | 0           | PASS   |

**Note:** Focus trap (useFocusTrap.ts) manipulates focus via `.focus()` method only, no HTML
injection.

### F.5 Dependencies

| Check                         | Finding                    | Status |
| ----------------------------- | -------------------------- | ------ |
| package.json                  | Unchanged in task 7        | PASS   |
| pnpm-lock.yaml                | Unchanged in task 7        | PASS   |
| pnpm audit --audit-level=high | Exit 0, no vulnerabilities | PASS   |

### F.6 Secrets

| Target                    | Pattern                               | Result                                 |
| ------------------------- | ------------------------------------- | -------------------------------------- |
| public/fonts/             | password, secret, api_key, token, JWT | Clean (binary files)                   |
| src/features/mobile-menu/ | password, secret, api_key, token, JWT | Clean                                  |
| e2e/helpers/              | password, secret, api_key, token, JWT | Clean                                  |
| .env files tracked        | git ls-files                          | Only .env.example (placeholder)        |
| .gitignore                | .env patterns                         | .env, .env.local, .env.*.local covered |

**SEC-006 unchanged:** Banxico token posture unchanged (read-only public data, accepted).

### F.7 Summary

| Gate                     | Result | Evidence                                        |
| ------------------------ | ------ | ----------------------------------------------- |
| no_external_font_origins | PASS   | grep src/, index.html, dist/ clean              |
| font_binary_valid        | PASS   | wOF2 magic bytes, sizes match ADR-0012          |
| ofl_license_present      | PASS   | public/fonts/OFL.txt exists with SIL 1.1 text   |
| preload_correct          | PASS   | crossorigin attr present, fonts in dist/        |
| no_xss_sinks             | PASS   | 0 dangerous patterns in mobile-menu/e2e helpers |
| deps_unchanged           | PASS   | package.json/pnpm-lock.yaml untouched           |
| secret_scan_clean        | PASS   | No secrets in new files                         |
| SEC-006_unchanged        | PASS   | Banxico token scope unchanged                   |

**No new findings opened.** SEC-006 (medium, accepted) remains the only tracked finding.

---

**Task 7 Incremental Triage Complete**

Auditor: Security Auditor Agent Date: 2026-07-11 Status: PASS (0 critical, 0 high, 0 new findings;
SEC-006 unchanged)

---

## Appendix G: Task 9 Geo Auto-Detection Triage — Three New External Origins (2026-07-11)

**Scope:** New geo-detection module (`src/geo-detection/`) adding THREE external origins for IP
geolocation (2 providers) and GPS reverse geocoding (1 provider). Owner-approved external origins
per state.json `humanDecisions_20260711_task9`.

**Trigger:** ADR-0014 implementation with owner GPS override (Q2).

### G.1 Origin Inventory Verification

| Origin                  | Purpose                   | Protocol | Token/Key     | Status   |
| ----------------------- | ------------------------- | -------- | ------------- | -------- |
| `api.country.is`        | IP geolocation (primary)  | HTTPS    | None          | APPROVED |
| `get.geojs.io`          | IP geolocation (fallback) | HTTPS    | None          | APPROVED |
| `api.bigdatacloud.net`  | GPS reverse geocode       | HTTPS    | None          | APPROVED |
| `suameca.banrep.gov.co` | Exchange rates (existing) | HTTPS    | None          | EXISTING |
| `banxico.org.mx`        | Exchange rates (existing) | HTTPS    | SEC-006 token | EXISTING |

**Verification:**

- grep `https?://` across `src/` (non-spec): Found exactly 5 origins (2 existing rates, 3 new geo)
- All origins use HTTPS exclusively
- No API keys/tokens in geo-detection URLs or headers
- Fetches use default credentials mode (no cookies sent cross-origin)

**Evidence:** `src/geo-detection/config/providers.ts` lines 7-13,
`src/exchange-rates/config/series.ts` lines 15-19

### G.2 Fail-Closed Validation

| Provider             | Response Field     | Validation                                   | Fail-Closed Behavior       |
| -------------------- | ------------------ | -------------------------------------------- | -------------------------- |
| api.country.is       | `data.country`     | `typeof === 'string' && /^[A-Z]{2}$/.test()` | Returns `{success: false}` |
| get.geojs.io         | `data.country`     | Same regex                                   | Returns `{success: false}` |
| api.bigdatacloud.net | `data.countryCode` | Same regex                                   | Returns `{success: false}` |

**Verification:**

- `IpGeoAdapter.ts:26-28`: Strict type check + regex before returning countryCode
- `ReverseGeocodeAdapter.ts:29-31`: Same pattern for countryCode
- `GeoDetectionAdapter.ts:64-68, 72-75`: `getPrefsForCountry()` returns null for non-7-country codes
- No `eval()`, `new Function()`, `innerHTML`, or `dangerouslySetInnerHTML` in geo-detection module
- Dynamic property access `COUNTRY_TO_PREFS[countryCode]` uses nullish coalescing (`?? null`)
- Timeouts enforced: IP 3000ms (`IP_TIMEOUT_MS`), GPS 5000ms (`GPS_TIMEOUT_MS`), reverse-geocode
  3000ms (`REVERSE_GEOCODE_TIMEOUT_MS`)

**Injection Vectors:**

- No announcer interpolation of raw provider values — `useGeoDetection.ts:56` announces static
  string with `result.region` which is already validated via `getPrefsForCountry()` allowlist
- `App.tsx:31-55` validates all callback parameters against allowlists (`isSupportedLocale`,
  `isValidRegion`, `isValidCurrency`) before calling setters

**Evidence:** `IpGeoAdapter.ts`, `ReverseGeocodeAdapter.ts`, `GeoDetectionAdapter.ts`, `App.tsx`

### G.3 Privacy Posture

| Check                                         | Implementation                                                                                                    | Status |
| --------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- | ------ |
| GPS permission required                       | `GpsAdapter.ts:24` calls `navigator.geolocation.getCurrentPosition()` which triggers browser permission prompt    | PASS   |
| Reverse geocode unreachable without GPS grant | `GeoDetectionAdapter.ts:100-117`: `runGpsPath()` only calls `reverseGeocode()` after `gpsResult.success === true` | PASS   |
| IP-geo sends only implicit IP                 | `IpGeoAdapter.ts:17`: `fetch(url, { signal })` — no credentials, no headers, no cookies                           | PASS   |
| Detection guard for returning users           | `useGeoDetection.ts:14-17`: `hasStoredPrefs()` checks ALL THREE keys; if ANY set, detection skipped entirely      | PASS   |
| No extra identifiers in requests              | grep for `credentials`, `cookie`, `Cookie`, `header` in geo-detection: 0 matches                                  | PASS   |

**Evidence:** `GpsAdapter.ts`, `GeoDetectionAdapter.ts:100-117`, `IpGeoAdapter.ts:17`,
`useGeoDetection.ts:39-41`

### G.4 New Storage Verification

| Check                                    | Finding                                                                        | Status |
| ---------------------------------------- | ------------------------------------------------------------------------------ | ------ |
| Raw localStorage writes in geo-detection | 0 — module only reads via `localStorage.getItem()`                             | PASS   |
| Persistence via App.tsx                  | `App.tsx:40-53` writes to `app-region`, `app-currency` ONLY after validation   | PASS   |
| Allowlist validation                     | `isSupportedLocale()`, `isValidRegion()`, `isValidCurrency()` guard all writes | PASS   |

**Evidence:** `useGeoDetection.ts:14-16` (read-only), `App.tsx:33-48` (validated writes)

### G.5 Dependency Status

```
git diff HEAD -- package.json pnpm-lock.yaml: (no diff)
pnpm audit --audit-level=high: exit 0 (No known vulnerabilities found)
```

| Severity | Count |
| -------- | ----- |
| Critical | 0     |
| High     | 0     |

**Evidence:** pnpm audit exit code 0

### G.6 Secret Scan

| Target                  | Pattern                                                               | Result |
| ----------------------- | --------------------------------------------------------------------- | ------ |
| src/geo-detection/      | password, secret, api_key, auth_token, client_secret, AKIA, ghp_, eyJ | Clean  |
| e2e/helpers/geo-mock.ts | Same patterns                                                         | Clean  |
| .env.example            | Contains `your_banxico_token_here` placeholder (SEC-006 unchanged)    | PASS   |
| .gitignore              | .env, .env.local, .env.*.local covered                                | PASS   |

**SEC-006 Status:** UNCHANGED (Banxico token for MXN rates, not geo-detection)

### G.7 Formal Finding Record

**SEC-007: IP Geolocation External Origins**

- Severity: LOW (accepted 2026-07-11)
- Surface: Client IP transmitted to `api.country.is` (primary) / `get.geojs.io` (fallback)
- Mitigation: HTTPS only, no credentials, no cookies, timeout 3s, fail-closed validation (ISO
  alpha-2 regex)
- Privacy: IP address is inherent in HTTP; no extra identifiers sent; documented in ADR-0014
- Condition: First visit with no stored prefs only (returning users make zero requests)
- Owner Approval: `state.json` Q1 providers approved 2026-07-11

**SEC-008: GPS Reverse Geocoding External Origin**

- Severity: LOW (accepted 2026-07-11)
- Surface: GPS coordinates (lat/lng) transmitted to `api.bigdatacloud.net`
- Mitigation: HTTPS only, no credentials, timeout 3s, fail-closed validation (ISO alpha-2 regex)
- Privacy: Coordinates sent ONLY after explicit browser permission grant; documented in ADR-0014
- Condition: GPS path only (user must grant permission); returning users make zero requests
- Owner Approval: `state.json` Q2 GPS included per owner override 2026-07-11

### G.8 Summary

| Gate                   | Result | Evidence                                                                    |
| ---------------------- | ------ | --------------------------------------------------------------------------- |
| origin_inventory       | PASS   | 5 approved origins only (2 rates + 3 geo); all HTTPS; no tokens in geo URLs |
| fail_closed_validation | PASS   | `^[A-Z]{2}$` regex + type checks; timeouts enforced; allowlist lookup       |
| privacy_posture        | PASS   | GPS requires permission; IP-geo has no credentials; returning users skipped |
| no_new_raw_storage     | PASS   | geo-detection reads only; writes via validated setters in App.tsx           |
| deps_unchanged         | PASS   | package.json/pnpm-lock.yaml untouched; audit exit 0                         |
| secret_scan_clean      | PASS   | No secrets in geo-detection or e2e mocks                                    |
| SEC-006_unchanged      | PASS   | Banxico token scope unchanged (MXN rates only)                              |

**New Findings:**

- SEC-007 (LOW, accepted): IP geolocation origins
- SEC-008 (LOW, accepted): GPS reverse geocode origin

**Total Open Findings:** SEC-006 (medium, accepted), SEC-007 (low, accepted), SEC-008 (low,
accepted) = 0 critical, 0 high

---

**Task 9 Geo Auto-Detection Triage Complete**

Auditor: Security Auditor Agent Date: 2026-07-11 Status: PASS (0 critical, 0 high, 2 new low
findings accepted with owner approval)

### G.9 Addendum: SEC-006 Latent Bug Correction (2026-07-11, Task 9)

**Issue Discovered:** During task 9 triage, the orchestrator identified an UNAUTHORIZED change to
`vite.config.ts` and `src/exchange-rates/config/env.ts` that adds a Vite `define` block to inject
`VITE_BANXICO_TOKEN` at build time.

**Investigation Result: LATENT BUG FIX, NOT NEW EXPOSURE**

The original SEC-006 acceptance (Appendix D, 2026-07-10) stated:

> "The Banxico SIE API token (`VITE_BANXICO_TOKEN`) is embedded in the production bundle via Vite's
> `import.meta.env` mechanism."

**This statement was incorrect.** The original task 4 code NEVER used `import.meta.env`. It used:

```typescript
process?.env?.VITE_BANXICO_TOKEN
```

In browser builds:

1. `process` does not exist
2. `typeof process !== 'undefined'` evaluates to `false`
3. The fallback returns `undefined`
4. **The token NEVER reached production bundles**

**Consequence:** MXN live rates (Banxico API) may have NEVER worked in prior production builds
because the token was unreachable. The SEC-006 "accepted exposure" was theoretical - the exposure
never actually occurred.

**Current Fix:** The new `define` block:

```typescript
define: {
  'globalThis.__VITE_BANXICO_TOKEN__': JSON.stringify(process.env.VITE_BANXICO_TOKEN),
}
```

This RESTORES the SEC-006-accepted design by actually making the token available in the browser
(when set at build time).

**Verification:**

| Check                               | Finding                                                           | Status |
| ----------------------------------- | ----------------------------------------------------------------- | ------ |
| Token with VITE_BANXICO_TOKEN unset | `Ln=void 0` in dist (define injected undefined)                   | PASS   |
| No token-like strings in dist       | Only `your_banxico_token_here` (PH rejection constant)            | PASS   |
| Define scope                        | Only `globalThis.__VITE_BANXICO_TOKEN__` key (no other env leaks) | PASS   |
| Mock precedence                     | `m ?? v ?? ...` chain; mock always wins                           | PASS   |
| process.env fallback preserved      | For Node.js test environments                                     | PASS   |

**Verdict: (a) RESTORES ACCEPTED DESIGN**

SEC-006 status: UNCHANGED (the fix makes reality match the already-accepted design).

**Flag for Delivery Report:** MXN live rates via Banxico API may have been non-functional in all
prior production builds due to this latent bug. This should be noted in the task 9 delivery report.
