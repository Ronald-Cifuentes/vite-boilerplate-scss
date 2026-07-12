# Delivery Report — Task 24: Lockfiles Never Committed (2026-07-12)

**Request:** remove `pnpm-lock.yaml` from Git and CI; lockfiles must never be committed — the
template must stay usable with Bun, Yarn, pnpm, or any other package manager. Save the directive
permanently. Nothing may depend on the lock files.

## Done

| Change                   | Detail                                                                                                                                                                                 |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Git tracking removed     | `git rm --cached pnpm-lock.yaml e2e/pnpm-lock.yaml` (explicitly user-ordered) — deletions **staged, not committed**; local working copies remain on disk for fast local installs       |
| `.gitignore`             | Ignores every lockfile form: `pnpm-lock.yaml`, `pnpm-lock.yml`, `package-lock.json`, `yarn.lock`, `bun.lock`, `bun.lockb` — with the PM-agnostic rationale (supersedes task-16 policy) |
| CI (`ci.yml`)            | Both installs lose `--frozen-lockfile`; pnpm-store cache key now hashes `package.json` + `e2e/package.json` instead of the lockfile                                                    |
| `Dockerfile`             | `COPY pnpm-lock.yaml` removed; plain `pnpm install`                                                                                                                                    |
| `.prettierignore`        | Slimmed to `state.json` only (gitignored lockfiles are auto-skipped by prettier 3)                                                                                                     |
| `SECURITY-AUDIT.md` §2.2 | Supply-chain control row updated: lockfiles-not-committed is an owner-ratified control change with the residual risk stated                                                            |
| Memory                   | Directive saved to persistent memory (`lockfiles-never-committed`) and indexed — applies to future sessions and projects                                                               |

## Proof that nothing depends on lockfiles

- **Docker:** `docker build --no-cache` → exit 0, with `pnpm install` resolving **fresh from the
  registry** (`reused 0, downloaded …`) and no lockfile in the build context.
- **CI install commands:** `pnpm install` (root) and `pnpm install --ignore-workspace` (e2e) both
  exit 0.
- **Repo-wide sweep** (including extensionless `.husky` hooks, scripts, configs, docs): the only
  remaining mentions are dated historical records (task-16/23 reports, state history, audit
  appendices) — no active configuration references a lockfile.

## Validation at sign-off

eslint / tsc / check:css / depcheck / prettier — all exit 0 · jest **900/900**, 100%×4 · vite
build + budgets ALL PASS. No runtime code changed (task-23 e2e baseline 215/215 stands).

## Accepted trade-off (recorded, owner-ratified)

Without a committed lockfile, every CI/Docker build resolves semver ranges at install time: builds
are not bit-reproducible and transitive dependencies are unpinned. Remaining mitigations: pnpm
integrity checks, Trivy CRITICAL/HIGH gate (exit-code 1), depcheck, and the per-build SBOM generated
from the built image, which records exactly what each build installed.

## Git state

Staged: the two lockfile deletions (as ordered). Unstaged: `ci.yml`, `.gitignore`, `Dockerfile`,
`.prettierignore`, `SECURITY-AUDIT.md`, logs, `state.json`, this report. No commits made.
