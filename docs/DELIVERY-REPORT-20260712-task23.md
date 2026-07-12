# Delivery Report — Task 23: Full CI Audit (2026-07-12)

**Request:** `/debug everything in ci and take care not break anything`

**Scope:** every step of both `ci.yml` jobs, executed or proven locally with CI-verbatim commands.
Several defects were masked because recent CI runs died at earlier steps (depcheck, then the trivy
action-resolution pre-flight failure, which kills the whole docker-build job before any step runs) —
the broken steps behind them had **never executed** in CI.

## Defects found and fixed (each reproduced before fixing, re-verified after)

| #   | Defect                                             | Root cause                                                                                                                                                                                                                           | Fix                                                                                                      | Proof                                                                                                                                                                     |
| --- | -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Coverage enforcement could never fail              | `grep -oP 'Statements\s+:\s+\K[0-9.]+'` matches nothing in istanbul's HTML (`strong">100% </span>`); empty vars made `bc` comparisons no-ops                                                                                         | `json-summary` reporter added to `jest.config.ts`; step reads `coverage/coverage-summary.json` with node | Pass-direction: exit 0 at 100%×4 on fresh summary. Fail-direction: doctored 97.3% branches → exit 1 naming the metric                                                     |
| 2   | e2e in CI: guaranteed port collision + wrong build | ci.yml pre-started `vite preview` on 4173; `playwright.config.cjs` has `reuseExistingServer: false` in CI and `--strictPort`, and its webServer builds **with** the e2e mock token (the pre-started server served a tokenless build) | Removed pre-start/stop steps and the dead `BASE_URL` env (config hardcodes `baseURL`)                    | 215/215 e2e green locally via the exact CI command at `--workers=1`                                                                                                       |
| 3   | SBOM step doubly broken                            | `cyclonedx/cyclonedx-node:latest` CLI (`make-bom`) accepts **neither** `--output-file` nor `--spec-version`; and the docker-build job never installs `node_modules` for it to analyze                                                | Replaced with the already-SHA-pinned trivy-action, `format: cyclonedx` against the built image           | `--help` of the image shows the args don't exist; `action.yaml` at the pinned SHA installs trivy v0.70.0 and passes `TRIVY_FORMAT` through verbatim (cyclonedx supported) |
| 4   | Trivy SARIF suppressed exactly when it matters     | Upload gated `outcome == 'success'`, but `exit-code: '1'` fails the scan step **when findings exist** — SARIF never reached GitHub Security on findings                                                                              | Gate on `hashFiles('trivy-results.sarif') != ''` (trivy writes the file before exiting non-zero)         | Expression-level fix; YAML parses; no scan-gate semantics changed                                                                                                         |
| 5   | `prettier --check .` (CI command) failed           | prettier 3 falls back to `.gitignore`; task 16 un-ignored `pnpm-lock.yaml`, and `state.json` is machine-written loop state — both git-tracked, so both got checked                                                                   | `.prettierignore` for the two generated files                                                            | CI command exits clean; masked until now only because CI died at depcheck first                                                                                           |
| 6   | Three no-op `--pm-on-fail=ignore` flags            | Not a pnpm flag; silently accepted                                                                                                                                                                                                   | Removed (install ×2 + `pnpm dlx sonarqube-scanner`)                                                      | pnpm behavior identical without them                                                                                                                                      |

## Verified-sound (no change needed)

- Both lockfiles (`pnpm-lock.yaml`, `e2e/pnpm-lock.yaml`) are git-tracked → both `--frozen-lockfile`
  installs safe.
- Secret-scan grep: local image build + the verbatim `docker history | grep` → no matches (this step
  had never run in CI).
- Non-root check, budgets gate, css gate, depcheck, artifact paths, SonarQube conditional skip: all
  exercised locally, all green.
- Trivy pin `ed142fd…` resolves (manifest fetched at that SHA).

## Full validation at sign-off (CI-verbatim commands)

eslint / tsc / check:css / depcheck / prettier — all exit 0 · jest 900/900, 100%×4 · vite build +
budgets: main 241,015 / 244,000 raw, 75,837 / 76,000 gzip, 3 chunks in caps · e2e **215/215** at
`--workers=1` (exact CI parity).

## Open item for the owner (QA-ADV-1) — deliberately not changed

`e2e/journeys/accessibility.spec.ts:59` asserts wall-clock page load **< 500 ms**. Best case on fast
local hardware is 306 ms (61% of budget); under load it failed 2 of 4 local full runs (different
timing-sensitive tests failed per run, never the same one twice — each passed in other runs). CI's
single worker + 2 retries make it likely-pass, but a systematically slower runner could exceed 500
ms on all three attempts. Options: raise the CI threshold, or move the assertion into a dedicated
performance gate with proper methodology. Changing a gate threshold is an owner decision per loop
rules.

## Git state

No commits, no staging (INC-005 standing rule). Note for committing: `ci.yml` shows staged **and**
unstaged changes — re-stage it, plus `jest.config.ts` and the new `.prettierignore`, to include this
task's fixes.
