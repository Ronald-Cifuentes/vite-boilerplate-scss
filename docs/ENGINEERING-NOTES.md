# Engineering Notes — How to Run

## TL;DR — the project runs with plain pnpm

```bash
pnpm install     # exit 0
pnpm dev         # Vite dev server on http://localhost:5173  (verified: HTTP 200)
pnpm build       # tsc && vite build  (verified: exit 0)
pnpm test        # jest, 100% coverage  (verified: 66 tests pass)
pnpm lint        # eslint  (verified: exit 0)
pnpm preview     # serve the production build
```

e2e (separate, isolated harness — see §3):

```bash
pnpm -C e2e install                 # one-time: installs @playwright/test locally
./e2e/node_modules/.bin/playwright test --config e2e/playwright.config.cjs
```

## 1. The pnpm / `packageManager` issue — RESOLVED

`package.json` originally declared `"packageManager": "yarn@4.9.1"`, which made pnpm 11 abort with
`This project is configured to use yarn`. pnpm's early guard only honors a bypass from a CLI flag
(`--pm-on-fail=ignore`) or a `pnpm_config_*` env var — **never** from `.npmrc` or `npm_config_*`. So
there was no repo-only file that fixed bare `pnpm dev`.

**Fix (authorized):** changed that one line to `"packageManager": "pnpm@11.5.1"`. No other
`package.json` change. Bare `pnpm <script>` now works with zero flags/env.

## 2. Build-script approvals (`pnpm-workspace.yaml`)

pnpm 11 blocks dependency postinstall build scripts until you decide. Two optional native deps
(`@parcel/watcher`, `unrs-resolver`) were left "undecided" by pnpm's auto-generated placeholder,
which made `pnpm install` (and therefore the `verify-deps-before-run` check that `pnpm dev`
triggers) **exit 1** with `ERR_PNPM_IGNORED_BUILDS`. Fixed by an explicit decision in
`pnpm-workspace.yaml`:

```yaml
allowBuilds:
  '@parcel/watcher': false # app builds/lints/tests/runs fine without it
  unrs-resolver: false
```

(Secure default: their postinstall scripts do not run. Flip to `true` only if you need the native
binary.)

## 3. e2e — isolated Playwright harness (no root dep)

`@playwright/test` cannot be resolved by project test files when run via `pnpm dlx` (pnpm's isolated
store is not an ancestor of the test files). To keep the **root** `package.json` free of e2e deps,
Playwright lives in its own `e2e/package.json`:

```bash
pnpm -C e2e install --ignore-workspace
```

Browsers: `./e2e/node_modules/.bin/playwright install chromium` (already installed in this env).

## 4. Node engine warning (harmless)

`engines.node` is `22.13.1`; this machine runs Node 26 → pnpm prints `Unsupported engine` WARN. It
is only a warning and does not affect anything. Use Node 22.13.1 (see `.nvmrc`) to silence it.

## 5. ESLint config

The committed `eslint.config.js` imported `@eslint/eslintrc`, `@eslint/js`, and `globals` (not
installed) — rewritten to use only installed plugins. `eslint-plugin-react`'s broad `recommended`
set was dropped because several rules use ESLint-≤9 APIs removed in ESLint 10.

## 6. react-icons deviation

The constitution mandates icons from `react-icons` only, but it is not installed and was not added
(the rest of `package.json` stayed locked). The language selector uses inline accessible SVG.
