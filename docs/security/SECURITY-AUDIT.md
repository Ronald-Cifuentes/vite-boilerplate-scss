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
