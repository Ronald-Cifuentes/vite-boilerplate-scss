# Requirements Checklist — Verifiable Acceptance

**STATUS: FINAL — ALL ITEMS MET (2026-06-29).** Verified by QA cycles 1 & 2, SonarQube, and
Orchestrator re-runs.

Legend: `[x]` met · `[~]` met-with-documented-deviation · `[N/A]` out of scope (separate repo)

## A. Tooling & Package Manager

- [x] A1. **Bare `pnpm install` / `dev` / `build` / `test` / `lint` all run (exit 0, no
      flags/env).** `pnpm dev` serves http://localhost:5173 → HTTP 200 (verified live).
- [x] A2. No npm/npx anywhere (guard hook enforces; CI uses direct binaries/pnpm).
- [x] A3. pnpm@latest (11.5.1) is the working manager — fixed by setting `packageManager` to
      `pnpm@11.5.1` and deciding native build scripts in `pnpm-workspace.yaml`
      (`allowBuilds: false`).
- [~] A4. `package.json` changed by **exactly one authorized line** (`packageManager: yarn@4.9.1` →
  `pnpm@11.5.1`); no other change. (Originally locked; user authorized this one line so bare
  `pnpm dev` works.)

## B. Build, Types, Lint

- [x] B1. `tsc --noEmit` → 0 errors.
- [x] B2. `vite build` → success (185ms).
- [x] B3. ESLint → 0 errors (config rewritten to installed plugins; ESLint-10 compat fixed).
- [x] B4. Prettier clean (enforced via eslint-plugin-prettier).

## C. Scaffolding (generate-react-cli)

- [x] C1. Component scaffolding works (verified, `pnpm dlx`).
- [x] C2. Hook type present + paths feature-aware.
- [x] C3. Generated code passes tsc + lint + test.
- [x] C4. Templates aligned with architecture; `feature` type added.

## D. Internationalization & Language Selector

- [x] D1. i18n core: typed port (`Translator`) + provider adapter (`I18nProvider`).
- [x] D2. Accessible, keyboard-operable language selector (label + aria-describedby).
- [x] D3. Switching updates all visible copy live (e2e verified).
- [x] D4. Preference persists (localStorage) + restores on reload (e2e verified).
- [x] D5. Resolution: persisted → navigator → default (unit-tested, all branches).
- [x] D6. `<html lang>` reflects active locale (e2e verified).
- [x] D7. 2 locales (en, es) with proper native names (English, Español).

## E. No Hardcoding

- [x] E1. No hardcoded user-facing strings (all via `t()`; QA grep clean).
- [x] E2. No magic config; locales/default/storage-key centralized + typed.
- [x] E3. No hardcoded secrets (guard + security audit clean).

## F. Architecture & SOLID

- [x] F1. Scream architecture (top-level = features/i18n/shared, not framework).
- [x] F2. Folder-by-feature (`src/features/*`).
- [x] F3. Clean/Hexagonal (i18n behind port; deps point inward; arch test enforces no cross-feature
      imports).
- [x] F4. SOLID (SRP modules, DIP via context/ports, ISP typed interfaces).
- [x] F5. ADRs recorded (`docs/architecture/adr-0001..0004` + CONTRACTS.md).

## G. Testing & Coverage

- [x] G1. Unit coverage **100%** (87/87 stmts, 30/30 branches, 17/17 funcs, 82/82 lines).
- [x] G2. Integration tests (provider + selector live switching, persistence).
- [x] G3. Jest thresholds set to 100% (enforced).
- [x] G4. e2e (Playwright) 13/13: load, switch, persist, a11y, perf.
- [x] G5. TDD/BDD: Given/When/Then specs; spec per first-party module (79 tests total).
- [x] G6. SDD: features traceable to PRD + contracts.

## H. Performance (<500ms)

- [x] H1. Bundle 61.41KB gz (≤65KB budget).
- [x] H2. App-interactive 69–74ms (≪500ms; Playwright-measured).
- [x] H3. Locale code-split evaluated; not needed (<1KB) — documented in perf report.
- [x] H4. Performance Engineer report recorded.

## I. Accessibility & Mobile-first

- [x] I1. Mobile-first SCSS (base = mobile; `min-width` enhancements).
- [x] I2. Selector keyboard-reachable + accessible name (e2e verified).

## J. Security

- [x] J1. Dependency audit: 0 critical/high (1 moderate devDep accepted).
- [x] J2. No secrets committed.
- [x] J3. Security Auditor report recorded.

## K. SonarQube

- [x] K1. Project `vite-boilerplate-scss` analyzed (localhost:9000).
- [x] K2. Quality gate = **PASSED** (CAYC-compliant).
- [x] K3. 0 bugs / 0 vulnerabilities / 0 hotspots / **0 code smells**; ratings A/A/A; 100% coverage;
      0% duplication. **Honest config**: test files are analyzed (not excluded) for
      smells/duplication; only non-coverable files (entry/barrels/types) are coverage-excluded. The
      one real smell found (`S2004` in `useTranslation.spec.tsx`) was fixed in code, not hidden.

## L. Process / Multi-agent / Loop

- [x] L1. PRD created (`docs/PRD.md`).
- [x] L2. Checklist created (this file).
- [x] L3. Phased plan with contracts/acceptance/risks/limits (`docs/PLAN.md`).
- [x] L4. All roles engaged: Orchestrator, Architect, Backend [N/A-documented], Frontend, QA(×2),
      DevOps, Security, Performance.
- [x] L5. Every agent wrote a log (`logs/` — 7 logs + QA cycle2).
- [x] L6. loop-enforcer sign-off + Orchestrator final report (`docs/DELIVERY-REPORT.md`).

## M. Out-of-scope (documented N/A for this frontend repo)

- [N/A] M1. Backend Engineer implementation — separate repo.
- [N/A] M2. Google OAuth2 real login — separate backend repo.
- [N/A] M3. Auto-Swagger — backend repo.
- [N/A] M4. p95 backend latency <500ms under load — backend repo.
- [N/A] M5. Backend docker-compose / DB migrations — backend repo.
- [~] M6. Icons from react-icons only — not installed & package.json locked; inline accessible SVG
  used. Deviation accepted + logged.
