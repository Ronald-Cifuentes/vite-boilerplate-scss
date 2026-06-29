# Product Requirements Document — `vite-boilerplate-scss`

- **Owner:** Orchestrator (Master)
- **Date:** 2026-06-29
- **Status:** Approved for phased implementation
- **Repo type:** Frontend only (React 19 + Vite 8 + TypeScript 6 + SCSS Modules). Backend lives in a
  **separate repository** per the project constitution and is **out of scope** here.

---

## 1. Purpose & Vision

Elevate the existing "renders `Hi`" boilerplate into a **production-grade, internationalized React
starter** that demonstrates and enforces the project constitution: SOLID, Scream + Clean +
Hexagonal + DDD architecture, folder-by-feature, mobile-first, fully tested (unit + integration +
e2e), performant (<500ms first load), with a working component scaffolding system
(`generate-react-cli`) and zero hardcoded user-facing strings.

## 2. Problem Statement

The boilerplate currently:

- Refuses to run under `pnpm` (declares `packageManager: yarn@4.9.1`).
- Has a **broken Jest config** (CommonJS `module.exports` in an ESM package) — no tests can run.
- Has a **broken ESLint config** (imports `@eslint/eslintrc`, `@eslint/js`, `globals` which are not
  installed).
- Renders a **hardcoded** `Hi` string — no i18n, no language selector.
- Has **no e2e** layer (no Playwright).
- Coverage thresholds are 90%, not the mandated 100%.

## 3. Goals (in-scope)

| #   | Goal                                                                                                             |
| --- | ---------------------------------------------------------------------------------------------------------------- |
| G1  | Project installs and runs end-to-end with **pnpm@latest** (no npm/npx, no yarn).                                 |
| G2  | `generate-react-cli` scaffolding works for components **and** hooks (+ feature-aware).                           |
| G3  | **i18n** subsystem (hexagonal: contract/port + provider/adapter) with **language selector** UI.                  |
| G4  | **Zero hardcoded** user-facing strings — all via i18n keys; all config via typed constants/env, no magic values. |
| G5  | **100%** unit, integration, and e2e (Playwright) coverage of first-party code.                                   |
| G6  | **Mobile-first**, accessible (WCAG AA), responsive UI.                                                           |
| G7  | First meaningful paint / app-interactive **< 500ms** locally (build budget + runtime).                           |
| G8  | SOLID + Scream/Clean/Hexagonal/DDD + folder-by-feature throughout.                                               |
| G9  | Quality gates green: `tsc --noEmit`, ESLint, Jest, Playwright, SonarQube.                                        |

## 4. Non-Goals (out-of-scope for this repo)

- Backend services, Google OAuth2, auto-Swagger, p95<500ms **backend** latency, DB migrations,
  docker-compose for backend — these belong to the **separate backend repository**.
- Editing `package.json` (locked by the engagement) — therefore **no new runtime dependencies**;
  i18n is hand-rolled with React context, Playwright is executed via `pnpm dlx`.

## 5. Users & Use Cases

- **App end-user:** opens the app, sees content in their language, switches language via a selector;
  preference persists.
- **Developer (consumer of the boilerplate):** scaffolds new features/components/hooks with one
  command; gets tests, types, styles, and i18n wiring for free.

## 6. Functional Requirements

- **FR1 — Language selector:** visible control listing supported locales; switching updates all
  visible copy immediately and persists (localStorage). Keyboard + screen-reader accessible.
- **FR2 — i18n core:** `useTranslation()` hook returns a typed `t(key)` function and current locale;
  missing keys fail type-checking (compile-time safety), not at runtime.
- **FR3 — Default locale resolution:** from persisted preference → browser language → configured
  default (no hardcoded default in components).
- **FR4 — Greeting feature:** the former hardcoded `Hi` becomes a translated greeting rendered
  through the i18n contract.
- **FR5 — Scaffolding:** `pnpm gen` (or documented `pnpm dlx generate-react-cli`) generates
  component/hook with test + style + index + interfaces; generated code passes tsc/lint/test.

## 7. Non-Functional Requirements

- **NFR1 Performance:** production JS ≤ 200KB raw / ≤ 65KB gzip for the baseline; build < 5s;
  app-interactive < 500ms on a warm local preview. Code-split locales.
- **NFR2 Accessibility:** all interactive elements labeled; color contrast AA; `lang` attribute
  reflects active locale.
- **NFR3 Quality:** 100% coverage thresholds enforced in Jest; SonarQube quality gate = Passed; 0
  ESLint errors; 0 TS errors.
- **NFR4 Security:** no secrets in repo; deps audited; pnpm used for supply-chain safety.
- **NFR5 Maintainability:** SOLID; each module single-responsibility; dependencies point inward
  (Clean/Hexagonal).

## 8. Success Metrics / Acceptance (summary)

See `REQUIREMENTS-CHECKLIST.md` for the line-item, verifiable acceptance list. Release is accepted
only when **every** checklist item is checked and the loop-enforcer signs off.

## 9. Constraints & Assumptions

- `package.json` is immutable → workarounds documented in `docs/ENGINEERING-NOTES.md` and `.npmrc`.
- `react-icons` is mandated by the constitution but is **not installed** and cannot be added
  (package.json lock) → language selector uses accessible inline SVG/text; logged as an accepted
  deviation.
- pnpm 11 enforces the `packageManager` field; bypass via `--pm-on-fail=ignore` (documented).

## 10. Risks (high-level; detailed in plan)

| Risk                                             | Severity | Mitigation                                               |
| ------------------------------------------------ | -------- | -------------------------------------------------------- |
| Can't add deps (package.json lock)               | High     | Hand-roll i18n; `pnpm dlx` for Playwright/grc; document. |
| 100% coverage brittleness                        | Medium   | Keep logic small/pure; test behavior not implementation. |
| pnpm/yarn manager conflict confuses contributors | Medium   | `.npmrc` + ENGINEERING-NOTES.md.                         |
| react-icons mandate unmet                        | Low      | Documented deviation, inline SVG.                        |
