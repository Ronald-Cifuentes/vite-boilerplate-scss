# Phased Implementation Plan

Each phase declares: **Contract** (inputs→outputs), **Acceptance criteria**, **Risks**, **Limits**.
Sequence is gated: a phase starts only when its predecessor's acceptance is met. Read-only review
phases (Security, Performance) run in parallel. Every agent writes a log under `logs/`.

---

## Phase 0 — Orchestrator (Master)

- **Contract:** repo state → verified baseline + PRD + checklist + plan + engineering notes + logs
  scaffold.
- **Acceptance:** baseline table proven by command output; `docs/PRD.md`,
  `docs/REQUIREMENTS-CHECKLIST.md`, `docs/PLAN.md` exist; pnpm install works.
- **Risks:** protected-config hook blocks edits → mitigated by reversible `.allow-test-config-edits`
  marker.
- **Limits:** Orchestrator does not implement features; it coordinates and verifies.

## Phase 1 — Architect

- **Contract:** PRD + constraints → target `src/` tree (scream/clean/hexagonal/folder-by-feature),
  i18n **port** contract (`Translator`, `Locale`, `TranslationKeys`), language-selector contract,
  SOLID mapping, ADRs.
- **Acceptance:** `docs/architecture/adr-0001..n.md` present; structure diagram; contracts are
  type-level and reviewed; no framework names at top level of `src/`.
- **Risks:** over-engineering a small app → keep ports minimal but real.
- **Limits:** no implementation; design + docs only.

## Phase 2 — Frontend Engineer

- **Contract:** Architect contracts → working code: i18n core (provider/hook/config/translations),
  `LanguageSelector` feature, `Greeting` feature (replaces hardcoded `Hi`), `<html lang>` sync,
  persistence; fixed `eslint.config.js` (installed plugins only); `jest.config.ts` thresholds →
  100%; Playwright config + e2e specs (run via `pnpm dlx`); updated `generate-react-cli.json`
  (feature-aware) without breaking existing types; unit + integration tests to 100%.
- **Acceptance:** B1–B4, C*, D*, E*, G1–G3 pass locally; no `package.json` change; no new runtime
  dep.
- **Risks:** ESLint 10 flat-config drift; ESM/ts-node config; 100% coverage of provider branches.
  Mitigate by iterating against real command output.
- **Limits:** no backend; no new npm deps; no edits to `package.json`.

## Phase 3 — QA Engineer (cycle 1)

- **Contract:** built app → validation verdict + defect list.
- **Acceptance:** runs tsc, eslint, jest(+coverage), playwright, scaffolding; verifies BDD scenarios
  & every D/E/G item; returns PASS or itemized defects.
- **Risks:** flaky e2e timing for <500ms assertion → use stable, generous-but-meaningful budget +
  retries.
- **Limits:** read-only on code; cannot modify source.

## Phase 4 — Security + Performance + DevOps (parallel where safe)

- **Security Auditor (read-only):** dependency review, secret scan, OWASP front-end mapping
  (XSS/CSP/storage), SBOM note, SonarQube security hotspots. → `logs/*-Security_Auditor.md`.
- **Performance Engineer (read-only):** bundle budget, code-split check, app-interactive <500ms
  measurement, recommendations. → `logs/*-Performance_Engineer.md`.
- **DevOps Engineer:** frontend `Dockerfile` (multi-stage, nginx), `.dockerignore`, CI workflow
  (pnpm, tsc, lint, test, e2e, sonar) — **frontend repo only**. → `logs/*-DevOps_Engineer.md`.
- **Acceptance:** H*, I*, J*, K* satisfied or documented; DevOps artifacts build-lint clean.
- **Risks:** Sonar scanner availability → use sonarqube-mcp to read results; document if scanner CLI
  absent.
- **Limits:** Security/Performance never modify code; DevOps adds infra files only.

## Phase 5 — QA cycle 2 + loop-enforcer + Orchestrator close

- **Contract:** defects fixed → green run → enforcement → final report.
- **Acceptance:** all checklist items `[x]` or justified `[N/A]/[~]`; every role has a log; enforcer
  confirms; guard hook restored + marker removed.
- **Risks:** residual defects → loop back to Phase 2.
- **Limits:** ship only on full green.

---

## Global limits / guardrails

- No `npm`/`npx`; pnpm only. No push/merge to protected branches.
- No real `.env`; `.env.example` only. No hardcoded secrets.
- `package.json` immutable → no new runtime deps.
- Backend non-negotiables are **N/A** here (separate repo) and explicitly documented.
