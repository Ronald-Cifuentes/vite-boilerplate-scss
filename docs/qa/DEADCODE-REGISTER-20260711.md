# DEAD-CODE REGISTER — 2026-07-11

**Task 10, Phase 2a — execution complete. 28 SAFE-DELETE items removed + NJ-11 defect fixed.**

**Execution summary (2026-07-11):**

- BATCH 1: SD-01 (react.svg + src/assets/), SD-16..SD-26 (11 barrel files) — DELETED
- BATCH 2: SD-02..SD-05 (4 e2e helper functions) — DELETED
- BATCH 3: SD-06..SD-15 (10 i18n keys x4 locales) — DELETED; NJ-11 defect FIXED (hardcoded English
  announcement wired to a11y.locationDetected); CONTRACTS.md i18n dictionary amended
- BATCH 4: SD-27..SD-28 (2 de-exports) — DELETED (export keyword removed)
- Bundle delta: 240,933/75,687 -> 240,396/75,594 (-537/-93 bytes)
- All gates green: lint 0, tsc 0, jest 879 100%x4, e2e 192/192

---

**Phase 1 — read-only inventory (original audit, preserved for traceability):**

- Baseline: commit `23f8a49` ("docs: task-9 closeout records"), tree clean.
- Auditor: dead-code inventory agent (not the QA profile; no pipeline log written per task
  instructions — this register is the deliverable).
- Tools: `pnpm dlx knip` (ephemeral), `pnpm dlx ts-prune` (ephemeral), `pnpm dlx depcheck`
  (ephemeral; `npx depcheck` is blocked by the pnpm-only policy hook, and depcheck is not an in-repo
  binary — the root `depcheck` script itself shells out to npx and cannot run under the hook). Every
  tool hit was then manually verified with ripgrep (`/opt/homebrew/bin/rg`) across `src/`, `e2e/`,
  `index.html`, `vite.config.ts`, `jest-setup.ts`, `jest.config.ts`, `docs/` (CONTRACTS/ADRs),
  `Dockerfile`, `.husky/`, `generate-react-cli.json`, including string references, dynamic imports,
  template-literal i18n keys, SCSS `@use`/`@forward` chains, and barrel re-export chains.

## Totals

| Class                     | Count                                                                                                                                                                 |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| SAFE-DELETE               | **28** entries (1 asset file, 4 e2e helper functions, 10 i18n keys [x4 locales = 40 dictionary entries], 11 zero-importer barrel files, 2 needless `export` keywords) |
| NEEDS-JUDGMENT            | **12** items                                                                                                                                                          |
| KEEP (looks dead, is not) | **21** items                                                                                                                                                          |
| Unused npm dependencies   | **0** (depcheck clean + full manual verification below)                                                                                                               |
| Unused public/ assets     | **0** provable (2 service workers are NEEDS-JUDGMENT by design)                                                                                                       |

Import-graph context used throughout: there are **no tsconfig path aliases**; runtime imports use
relative paths and domain-root barrels (`from '../../../../i18n'` etc.). Jest maps only
`^@/(.*)$ → <rootDir>/$1` and sets `moduleDirectories: ['node_modules', 'src']`. Coverage
**excludes** `src/**/index.ts`, `src/main.tsx`, `*.d.ts`, `*.spec.*`, `src/shared/test/**`
(jest.config.ts:34-41) — which is why pure-re-export barrels and comment-only files can be dead
without failing the 100% gate.

---

## 1. SAFE-DELETE — zero references proven

### SD-01. `src/assets/react.svg` (whole file)

- **Why it exists:** Vite `create-vite` React template scaffold leftover (pre-task-1 era). The
  template's `App.tsx` imported it; this repo's `App.tsx` never has.
- **Evidence:**
  - `rg -rn "react.svg" .` (excluding node_modules/coverage/dist/pnpm-lock) → **0 hits**. Not in
    `index.html` (only `/vite.svg` at line 5), not in any `.tsx/.scss`, not in docs.
- **Drag-along:** none. Leaves `src/assets/` empty (delete the directory too).

### SD-02..SD-05. Unused e2e helper exports (4 functions)

| #     | Symbol                  | Location                        | Era                             |
| ----- | ----------------------- | ------------------------------- | ------------------------------- |
| SD-02 | `mockGpsFirstVisit`     | `e2e/helpers/geo-mock.ts:90`    | task-8 geo-detection e2e matrix |
| SD-03 | `mockIpOnlyFirstVisit`  | `e2e/helpers/geo-mock.ts:105`   | task-8                          |
| SD-04 | `closeMobileMenuIfOpen` | `e2e/helpers/mobile-menu.ts:43` | task-7 mobile-menu              |
| SD-05 | `isMobileViewport`      | `e2e/helpers/mobile-menu.ts:61` | task-7                          |

- **Evidence:** `rg -c "<symbol>" e2e/journeys e2e/helpers` → each matches **only its own definition
  file** (count 1). The only journey importing geo-mock is
  `e2e/journeys/geo-detection.spec.ts:2-11`, whose import list is exactly
  `mockIpCountry, mockIpFailure, mockReverseGeocode, mockReverseGeocodeFailure, mockGpsGranted, mockGpsDenied, createGeoRequestTracker, mockSlowDetection`
  — the two `*FirstVisit` wrappers are absent. `e2e/journeys/mobile-menu.spec.ts:2` imports exactly
  `openMobileMenuIfNeeded, getMobileMenu, getHamburgerButton`. All other geo-mock/mobile-menu
  exports are used (counts verified per symbol; table in §4 K-notes).
- **Why they exist:** convenience composites written speculatively during the task-7/8 e2e
  build-out; the journeys ended up composing the primitives directly.
- **Drag-along:** none — e2e has no coverage gate and no spec-of-helpers.

### SD-06..SD-15. Dead i18n keys — 10 keys, present in all 4 locales (40 dictionary entries)

A key was declared dead **only** if unused in `src` AND `e2e` (per mandate), checked as exact-quoted
string, template-literal construction
(`t(\`currency.${...}\`)`, `labelKey=`, `PREFERENCE_LABEL_KEYS`, `localizedNameKey`), and constant
indirection.

| #     | Key                                | Created by / superseded by                                                                                                                                                        |
| ----- | ---------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| SD-06 | `languageSelector.label`           | ADR-0003 `LanguageSelector` (task-1); superseded by `LanguageDropdown` (task-2), which uses `navbar.selectLanguage` + `LOCALE_METADATA.nativeName` (`LanguageDropdown.tsx:31,50`) |
| SD-07 | `languageSelector.changeLanguage`  | same                                                                                                                                                                              |
| SD-08 | `navbar.language`                  | pre-task-2 control-label era; live code uses `navbar.selectLanguage`/`navbar.currentLanguage`                                                                                     |
| SD-09 | `navbar.theme`                     | pre-ADR-0009 ThemeDropdown era (task-3 replaced it with ThemeModeButton)                                                                                                          |
| SD-10 | `navbar.country`                   | pre-task-2                                                                                                                                                                        |
| SD-11 | `navbar.currency`                  | pre-task-2                                                                                                                                                                        |
| SD-12 | `navbar.lightMode`                 | pre-ADR-0009 binary theme toggle; superseded by `navbar.themeModeLight/Dark/System`                                                                                               |
| SD-13 | `navbar.darkMode`                  | same                                                                                                                                                                              |
| SD-14 | `a11y.languageSelectorDescription` | ADR-0003 era (`aria-describedby` of the old selector)                                                                                                                             |
| SD-15 | `a11y.currentLanguage`             | superseded by `navbar.currentLanguage` (used at `LanguageDropdown.tsx:50`)                                                                                                        |

- **Evidence (each key):**
  `rg -c "'<key>'" src e2e --glob '!node_modules' --glob '!src/i18n/translations/*'` → **0 hits**
  outside `src/i18n/types/TranslationKeys.ts` for every key above. Full literal-key inventory of
  `t('...')` calls in src plus all dynamic key sites (`CurrencyDropdown.tsx:44,56,62`,
  `MobileMenuItem.tsx:85` via `labelKey`, `ThemeModeButton.tsx:37,42` + `MobileMenu.tsx:164` via
  `PREFERENCE_LABEL_KEYS`) accounts for every other key in the dictionary. e2e asserts UI
  text/test-ids, never these keys (`rg "'<key>'" e2e` → 0).
- **Why they survive the 100% gate:** the dictionaries are plain data objects — importing the module
  covers every line; `src/i18n/translations/translations.spec.ts` asserts dictionary structure, not
  consumption.
- **Drag-along per key:** the entry in each of `src/i18n/translations/en.ts`, `es.ts`, `zh.ts`,
  `ja.ts` (e.g. en.ts:13-16 `languageSelector` block, en.ts:59 `languageSelectorDescription`); the
  corresponding line in `src/i18n/types/TranslationKeys.ts` (interface at lines 11-14, 24-37,
  57-59); **and a contract amendment** — `docs/architecture/CONTRACTS.md:323-360` still lists
  `languageSelector.*`, `navbar.language/theme/country/currency`, `lightMode/darkMode`,
  `a11y.languageSelectorDescription/currentLanguage` in the dictionary contract. Docs are contracts:
  the CONTRACTS §i18n dictionary must be amended in the same change. (Note: CONTRACTS' currency
  block already drifted — it omits `currency.cop` which the code has and uses — precedent that the
  dictionary contract tracks code.)
- Deleting empties the `languageSelector` namespace entirely (remove the whole block in the 4
  locales + type).

### SD-16..SD-26. Zero-importer barrel files (11 pure re-export files)

All are pure re-export `index.ts` files with **zero importers anywhere** (src, e2e, configs). All
are coverage-excluded (`!src/**/index.ts`). All exist from the folder-by-feature scaffold convention
(every layer got an `index.ts`); consumers standardized on direct file paths and the domain-ROOT
barrels instead, so these mid-layer barrels never acquired importers.

| #     | File                                   | Live symbols reachable elsewhere via                                                                                                                                                      |
| ----- | -------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| SD-16 | `src/currency/config/index.ts`         | `currency/config/currencies` (direct: `localStorage.ts:2`, `App.tsx:11`) + root barrel                                                                                                    |
| SD-17 | `src/currency/types/index.ts`          | `currency/types/Currency` (6 direct importers) + root barrel                                                                                                                              |
| SD-18 | `src/i18n/config/index.ts`             | `i18n/config/locales` (7 direct importers, e.g. `App.tsx:9`) + root barrel                                                                                                                |
| SD-19 | `src/i18n/types/index.ts`              | `i18n/types/Locale`, `i18n/types/TranslationKeys` (direct) + root barrel                                                                                                                  |
| SD-20 | `src/region/config/index.ts`           | `region/config/regions` (8 direct importers) + root barrel                                                                                                                                |
| SD-21 | `src/region/types/index.ts`            | `region/types/Region` (6 direct importers) + root barrel                                                                                                                                  |
| SD-22 | `src/theme/config/index.ts`            | `theme/config/themes` (7 direct importers) + root barrel                                                                                                                                  |
| SD-23 | `src/theme/types/index.ts`             | `theme/types/Theme` (7 direct importers) + root barrel                                                                                                                                    |
| SD-24 | `src/exchange-rates/types/index.ts`    | `exchange-rates/types/Rate` (direct: `ports/ExchangeRates.ts:2`, `rates-signal.ts:2`, both adapters, root barrel `index.ts:3`)                                                            |
| SD-25 | `src/exchange-rates/adapters/index.ts` | adapters imported by concrete file: `rates-signal.ts:5-6` (`from '../adapters/BanrepRatesAdapter'`, `'../adapters/BanxicoRatesAdapter'`); root barrel does **not** re-export `./adapters` |
| SD-26 | `src/features/navbar/signals/index.ts` | `announcement-signal` imported directly by 8 files (`from '../../signals/announcement-signal'`)                                                                                           |

- **Evidence:** `rg -n "from '(\.\./)*config'|from '\./config'" src` matches only
  `exchange-rates/index.ts:15` and geo-detection files (their own live config barrels — see K-14);
  `rg -n "from '\.\./types'|from '\./types'" src` matches only geo-detection (live, K-14);
  `rg "navbar/signals'" src` → 0; `rg "from './adapters'" src/exchange-rates` → 0. knip
  independently flagged all 11 as "Unused files"; manual grep confirms (knip's other 36 unused-file
  flags were false or judgment calls — see §3/§4).
- **Drag-along:** none — nothing imports them; `tsc --noEmit`, jest, and vite build are unaffected.
  (Counter-argument recorded: scaffold symmetry — sibling barrels
  `exchange-rates/config|signals|hooks/index.ts` and `geo-detection/config|types/index.ts` ARE used.
  If the team prefers symmetry over minimalism, reclassify to NEEDS-JUDGMENT; the deletion itself is
  provably safe today.)

### SD-27. `export` keyword on `dictionaryVersionSignal` — `src/i18n/signals/locale-signal.ts:25`

- **Evidence:** `rg -n "dictionaryVersionSignal" src e2e` → only `locale-signal.ts` itself
  (definition :25, doc-comment :29, in-module reads :34, :53). Not imported by any spec or module;
  knip: "unused export", ts-prune: "used in module".
- **Action shape:** remove only the `export` keyword (the signal itself is load-bearing for locale
  reactivity).
- **Drag-along:** none.

### SD-28. `export` keyword on `initializeCurrency` — `src/currency/adapters/CurrencyProvider.tsx:18`

- **Evidence:** `rg -n "initializeCurrency" src e2e` → only `CurrencyProvider.tsx` (definition :18,
  in-module call :51). No spec imports it (CurrencyProvider.spec.tsx exercises it through the
  component). knip: "unused export".
- **Action shape:** de-export only.
- **Drag-along:** none.

---

## 2. NEEDS-JUDGMENT — technically unused / test-only, arguably intentional

### NJ-01 / NJ-02. `public/sw.js` and `public/service-worker.js`

- **Status:** zero references in src/index.html/docs/e2e/scripts/docker/vite.config
  (`rg -in "service-worker|serviceWorker|sw\.js|navigator\.serviceWorker" src index.html docs e2e scripts docker vite.config.ts`
  → **0 hits**) — and that is **by design**. They are self-destructing "kill-switch" service
  workers: a stale SW registered on this origin by a previous project update-fetches these URLs
  directly from the browser; no code reference is possible or intended. Both self-document: _"Safe
  to delete once your browser no longer has a stale registration."_ Introduced at commit `f9abec1`
  (dev-environment hygiene, the :5173 "wrong app on this port" fix, cf. vite.config.ts strictPort
  comment).
- **Judgment needed:** deleting them re-exposes any developer/CI browser profile that still has a
  stale SW registered at `/sw.js` or `/service-worker.js`. Cheap to keep; the app itself registers
  no SW.

### NJ-03. `src/shared/test/test-utils.tsx` (`renderWithProviders`, whole file)

- **Status:** zero importers (`rg -rn "test-utils" src` → 0; `renderWithProviders` appears only in
  its own file). Coverage-excluded (`!src/shared/test/**`).
- **Intent argument:** canonical boilerplate test API (wraps Theme/Region/I18n providers). Meanwhile
  two specs hand-roll a local `renderWithI18n` duplicate (see NJ-12) — evidence the affordance is
  wanted but not adopted.
- **Judgment:** adopt it (refactor the duplicated local helpers to use it) or delete it. Do not
  leave both.

### NJ-04. `src/region/signals/side-effects.ts` (comments-only placeholder)

- **Content:** 3 comment lines, zero statements: _"Currently empty — region doesn't sync to DOM like
  locale or theme. This file exists for architectural consistency and future extensibility."_
- **Evidence:** `rg -n "side-effects" src` → importers exist only for currency/theme/i18n
  side-effects; region's has none. Zero statements = invisible to the 100% coverage gate.
- **Judgment:** explicitly self-declared intentional (arch symmetry: theme/i18n/currency each have a
  real `side-effects.ts`). Deleting is safe today but breaks the declared domain-layout symmetry.

### NJ-05. Geo-detection barrel cluster: `src/geo-detection/index.ts` + `src/geo-detection/adapters/index.ts` + `src/geo-detection/hooks/index.ts`

- **Status:** the root barrel has **zero importers** (`rg -n "geo-detection'" src e2e` → 0). Its two
  child barrels are imported **only by the dead root** (`geo-detection/index.ts:4,13`). Live
  consumers deliberately deep-import: `App.tsx:13-14` → `geo-detection/hooks/useGeoDetection`;
  `useGeoDetection.ts:56` → `await import('../adapters/GeoDetectionAdapter')` (the task-9 lazy
  chunk, REQUIREMENTS-CHECKLIST CHUNK9-03: `dist/assets/GeoDetectionAdapter-*.js` 2,726 B).
- **Era:** the barrel was the domain's public API until task-9 split geo into a lazy chunk;
  importers switched to deep/dynamic paths so the barrel lost all consumers.
- **Judgment:** this barrel is now a **perf trap** — any future
  `import { x } from '.../geo-detection'` statically links `./adapters` (which the root barrel
  re-exports) into the main bundle and silently defeats CHUNK9-03. Deleting all three protects the
  budget; keeping them preserves domain-barrel symmetry with the other 6 domains (whose root barrels
  are used and pinned by `src/shared/test/arch/architecture.spec.ts`). Recommendation if kept: strip
  the `./adapters` re-export at minimum.

### NJ-06. Test-only exports in a prod file: `setMockBanxicoToken` / `resetMockBanxicoToken` — `src/exchange-rates/config/env.ts:2,5`

- **Status:** NOT dead — imported by 3 spec files (`env.spec.ts:1`, `BanxicoRatesAdapter.spec.ts`,
  `rates-signal.spec.ts`; `rg -ln "setMockBanxicoToken" src`). Listed because they are
  production-file exports that exist purely as a test seam (mock override of the SEC-006 token).
- **Judgment:** intentional DI seam; the alternative (jest module mocks) trades explicitness for
  indirection. Recommend KEEP; recorded here per mandate.

### NJ-07. Unused barrel re-export lines in LIVE barrels (~40 export lines across 8 barrels)

Every underlying symbol was verified alive via direct-path imports (per-symbol usage table run over
all 35 knip/ts-prune flags; e.g. `currencySignal` 63 refs in 11 non-barrel files, `regionSignal` 53
refs, `GPS_TIMEOUT_MS` 8 refs). Only the **re-export lines** have zero importers:

- `src/currency/index.ts:8,10,22-26` — `CURRENCY_STORAGE_KEY`, `isValidCurrency`, and the 5 signal
  fns (comment says "Signals (for testing)", but every spec imports `./currency-signal` directly)
- `src/exchange-rates/index.ts:7-13,19-22,25-27` — series/URL/timeout constants, `ratesStateSignal`,
  `lastRefreshSignal`, `refreshRates`, `convertCopTo`, `getLastRefresh`, `CURRENCY_DECIMALS`,
  `CURRENCY_SYMBOLS` (live root exports: `formatAmount`, `BASE_PRICE_COP`, `initializeRates`,
  `useExchangeRates` — used by `Greeting.tsx:5`, `App.tsx:12`)
- `src/exchange-rates/signals/index.ts:2-5,8-10` — same symbols one layer down (file itself is live
  via root `index.ts:28`)
- `src/exchange-rates/config/index.ts:2-8,13` — same constants + the 3 env fns (file live via root
  `index.ts:15`)
- `src/region/index.ts:7,22` — `DEFAULT_REGION`, `regionSignal`
- `src/i18n/index.ts:8` — `DEFAULT_LOCALE`
- `src/features/mobile-menu/index.ts:7-13` — `MobileMenuItem(+Props)`,
  `MobileMenuSubmenu(+Props, SubmenuOption)`, `useFocusTrap` (barrel's live exports: `MobileMenu`,
  `HamburgerButton` — `Navbar.tsx:7`)
- `src/features/navbar/index.ts:7-14` — `ThemeModeButton(+Props)`, `CountryDropdown(+Props)`,
  `CurrencyDropdown(+Props)` (live: `Navbar`, `LanguageDropdown` — App + integration specs)
- `src/shared/components/Dropdown/index.ts:2-4` — `DropdownTrigger`, `DropdownPanel`,
  `DropdownOptionItem` (live: `Dropdown`, `DropdownOption` type — 3 navbar dropdowns)
- `src/geo-detection/config/index.ts:7-9,14-15` — `GPS_*`, `COUNTRY_TO_PREFS`, `SUPPORTED_COUNTRIES`
  (file live via `IpGeoAdapter.ts:1`, `GeoDetectionAdapter.ts:1`, `ReverseGeocodeAdapter.ts:1`)
- **Judgment:** these lines are the boilerplate's domain public-API surface; `architecture.spec.ts`
  and `design-system.spec.ts` pin _sibling_ exports from the same barrels (so the convention is
  contractual, selectively). Pruning is provably safe today (tsc/jest/build) but narrows the
  template's API. Decide a policy: "barrels export the full domain API" vs "barrels export only
  what's consumed".

### NJ-08. Dual default+named export convention (~17 unused `default` exports)

- **Pattern:** every component exports both named and `export default`; component `index.ts`
  templates re-export both (`templates/component/index.ts`:
  `export { default } from './TemplateName'`). knip flags the unused half in each case: `.tsx`
  defaults (Greeting:61, HamburgerButton:37, MobileMenu:274, MobileMenuItem:92,
  MobileMenuSubmenu:72, CountryDropdown:71, CurrencyDropdown:85, LanguageDropdown:72, Navbar:61,
  ThemeModeButton:59, Announcer:31, Button:26, Dropdown:214, IconButton:45, Link:28,
  I18nProvider:25, RegionProvider:52, ThemeProvider:51) and/or the `default` re-export in their
  `index.ts`.
- **The one live default:** `src/main.tsx:3` `import App from './shared/components/App'` — App's
  default chain is used; its **named** re-export (`App/index.ts:1`) is the unused half there.
- **Judgment:** this is the generate-react-cli template convention (`generate-react-cli.json` →
  `templates/component/index.ts`). Removing defaults piecemeal breaks symmetry with generated
  components; removing wholesale requires touching templates + 17 components + main.tsx. Style
  decision, not dead-code cleanup.

### NJ-09. i18n key `common.appName` ("Vite Boilerplate")

- **Status:** used ONLY by a spec assertion — `src/i18n/hooks/useTranslation.spec.tsx:26`
  `expect(result.current.t('common.appName')).toBe('Vite Boilerplate')`. No UI renders it (Navbar
  has no brand element: `rg "brand|appName|title" Navbar.tsx` → 0). Textbook "survives only because
  a dedicated spec exercises it".
- **Judgment:** a boilerplate's app-name key is a template affordance consumers will want. If
  deleted: 4 locale entries + `TranslationKeys.ts:3-5` + the spec assertion + CONTRACTS.md:315 come
  along, and `common` becomes an empty namespace.

### NJ-10. i18n key `a11y.skipToContent`

- **Status:** zero usage in src/e2e (`rg -in "skip.?to.?content|skip.?link" src e2e` → only
  translations + one DS comment). No skip-link component exists. BUT:
  `src/shared/ds/tools/_accessibility.scss:22` explicitly provides the focus-reveal tool "for skip
  links", and CONTRACTS.md:360 lists the key — this reads as a **planned a11y affordance never
  built**, not a superseded leftover.
- **Judgment:** building the skip link (mobile-first a11y win) is at least as defensible as deleting
  the key.

### NJ-11. i18n key `a11y.locationDetected` — plus a live defect found during verification

- **Status:** zero runtime usage; kept alive by `translations.spec.ts:13`
  (`expect(inlineTranslations.en.a11y.locationDetected).toBeDefined()`).
- **Root cause found:** `src/geo-detection/hooks/useGeoDetection.ts:79` announces with a **hardcoded
  English string**: `options.onAnnounce(\`Detected location:
  ${result.region}\`)`— the key this string should have been. Additionally the`onAnnounce` option is never passed by the app (`App.tsx:63-65`passes only`onDetected`),
  so the branch is spec-only.
- **Judgment:** the likely correct action is to WIRE the key (fixes the "No hardcoded values"
  violation), not delete it. Flag to task-10 implementer.

### NJ-12. Duplicated local test helper `renderWithI18n` (src specs, ties to NJ-03)

- `src/features/mobile-menu/components/HamburgerButton/HamburgerButton.spec.tsx:5` and
  `src/features/mobile-menu/components/MobileMenuItem/MobileMenuItem.spec.tsx:5` each define an
  identical private `renderWithI18n` while `test-utils.tsx` sits unused. (The e2e helpers proper —
  `fixtures.ts`, `geo-mock.ts`, `mobile-menu.ts` — have no duplicate implementations of each other;
  the "duplicate e2e helpers" suspect resolves to this src-side duplication.)
- **Judgment:** consolidation refactor, not deletion.

---

## 3. KEEP — looks dead (tools flagged it), is not

### K-01. All 26 DS SCSS partials knip flagged as "unused files"

knip does not trace SCSS. The full graph is reachable from the app entry: `main.tsx:4` →
`main.scss:8` `@use 'shared/ds/all'` → `_all.scss:16-34` `@use` settings/fonts, themes, generic,
elements, objects, components, utilities → each layer `_index.scss` `@use`/`@forward`s every partial
knip flagged (`components/_index.scss:5-9` pulls `_button/_icon-button/_link/_navbar/_dropdown`;
`themes/_index.scss:5-6` pulls `_light/_dark` which `@use '../settings/palette'`;
`tools/_responsive.scss:7` pulls `_breakpoints`; `settings/_index.scss:5-8` `@forward`s
tokens/palette/breakpoints/z-index and is consumed by `ThemeModeButton.module.scss:1`
`@use '.../shared/ds/settings' as *`; `utilities/_index.scss:5-6` pulls `_spacing/_visibility`;
`elements/_index.scss:5-6` pulls `_typography/_forms`; `objects/_index.scss:5-8` pulls
container/grid/stack/cluster; `generic/_index.scss:5` pulls `_reset`). Additionally every
`*.module.scss` `@use`s tokens/tools directly (28 `@use` sites enumerated). **Zero DS partials are
orphaned.**

### K-02. `templates/component/*` and `templates/hook/*` (knip: "unused files")

Referenced as **strings** in `generate-react-cli.json` (`"customTemplates"` blocks) and driven by
the `gen` script (`package.json:15`). Also excluded from jest (`jest.config.ts` IgnorePatterns
`<rootDir>/templates/`). Scaffolding tooling, not dead code.

### K-03. `docs/architecture/reference/codepen-OJLMgYY-fork-this-nav/styles.scss` (knip: unused file)

Reference material cited by ADR-0012 ("CodePen OJLMgYY: docs/architecture/reference/…"). Docs are
contracts/audit trail — out of scope for deletion.

### K-04. `public/fonts/*.woff2` + `public/fonts/OFL.txt`

Fonts referenced as **strings**: `index.html:11,18` (preload),
`src/shared/ds/settings/_fonts.scss:15,28` (`@font-face src: url('/fonts/...')`). OFL.txt is
contractually required: CONTRACTS.md:2243 "FONT-003: OFL license file committed alongside fonts";
ADR-0012:260 "Must commit OFL license file".

### K-05. `public/vite.svg`

Favicon by string ref: `index.html:5` `href="/vite.svg"`.

### K-06. `THEME_STORAGE_KEY = 'app-theme'` and theme values `'light'`/`'dark'` — string-coupled to the FOUC script

`index.html:27` hardcodes `var STORAGE_KEY = 'app-theme'` and `index.html:34` compares
`stored === 'light' || stored === 'dark'`. `design-system.spec.ts:62` and `architecture.spec.ts:147`
pin `THEME_STORAGE_KEY` to exactly `'app-theme'` for this reason. Any "unused constant/value"
reasoning around theme storage must account for these string references.

### K-07. `getBanxicoToken` `process.env` fallback — `src/exchange-rates/config/env.ts:15`

Jest genuinely relies on it: under jest there is no vite `define`, so
`globalThis.__VITE_BANXICO_TOKEN__` is undefined and the `process?.env?.VITE_BANXICO_TOKEN` arm is
the only live source; `env.spec.ts` has a dedicated `describe('process.env fallback')` that sets
`process.env.VITE_BANXICO_TOKEN` and asserts the read. The `// istanbul ignore next` on that line is
the coverage-instrumentation accommodation. **Do not remove the fallback.**

### K-08. `'globalThis.__VITE_BANXICO_TOKEN__'` define — `vite.config.ts:7-10`

Production injection path for the same token (SEC-006, SECURITY-AUDIT.md:1224-1237 verifies it).
Consumed by `env.ts:13` as a global read — no import edge exists, so import-graph tools cannot see
this coupling.

### K-09. Dependency `@testing-library/dom` (no direct imports in src)

Required **peer dependency** of `@testing-library/react@16`
(`node_modules/@testing-library/react/package.json` peerDependencies:
`"@testing-library/dom": "^10.0.0"` — RTL 16 stopped bundling it). Removal breaks the test stack.

### K-10. Dependency `eslint-config-prettier` (never named in eslint.config.js)

Consumed transitively by the config that IS imported: `eslint-plugin-prettier/recommended`
(`eslint.config.js:9`) does `require('eslint-config-prettier')` internally (verified in
`node_modules/eslint-plugin-prettier/recommended.js:1-4`) and it is a peer of the plugin.

### K-11. knip's "Unlisted dependencies: @playwright/test (5 files)" — false positive

e2e is a separate package: `e2e/package.json` declares `"@playwright/test": "^1.50.0"`
(devDependencies) with its own lockfile and node_modules. knip evaluated only the root manifest.

### K-12. i18n keys consumed ONLY via dynamic construction (naive grep says dead; they are not)

- `currency.cop|usd|eur|gbp|mxn|cny|jpy` — built at runtime: `CurrencyDropdown.tsx:44,56,62`
  `t(\`currency.${curr.toLowerCase()}\`)`; also declared as data in `currencies.ts:15-21` `localizedNameKey`.
- `navbar.themeModeLight|Dark|System` — via constant indirection `PREFERENCE_LABEL_KEYS`
  (`themes.ts:25-27`) consumed at `ThemeModeButton.tsx:37,42` and `MobileMenu.tsx:164`.
- `mobileMenu.language|country|currency|theme` — passed as `labelKey` string props
  (`MobileMenu.tsx:190,208,226,244`) and resolved at `MobileMenuItem.tsx:85` `t(labelKey)`.

### K-13. `useFocusTrap` — knip flagged the barrel export; the hook is runtime-critical

`MobileMenu.tsx:28,54` imports and calls it directly. Only the `features/mobile-menu/index.ts:13`
re-export is unused (see NJ-07).

### K-14. Sub-barrels that ARE live (do not lump with SD-16..26)

`src/exchange-rates/config/index.ts`, `signals/index.ts`, `hooks/index.ts` (imported by root
`exchange-rates/index.ts:15,28,31`); `src/geo-detection/config/index.ts` (3 adapter importers);
`src/geo-detection/types/index.ts` (`GeoDetectionAdapter.ts:2`).

### K-15. "Suspect" cycle-era code: `cycleRegion` / `cycle*` signal functions — **already gone**

`rg -in "cycle" src` → **0 hits in src** (all matches are e2e prose/tests describing the CURRENT
ADR-0009 theme _cycle button_, which is live behavior: `getNextPreference` in `themes.ts` is used by
ThemeModeButton/MobileMenu). The task-2 cycle-button code was fully removed in its own era; nothing
to register.

### K-16. Adapter/private helpers knip or ts-prune flagged that are in-module + spec-consumed

`fetchBanrepRate` (called by `fetchAllBanrepRates` in-module; direct unit tests in
`BanrepRatesAdapter.spec.ts`), `computeCopMxnCrossRate` (called by `fetchMxnRateViaCrossRate`;
tested directly), `lastRefreshSignal`, `CURRENCY_DECIMALS`, `CURRENCY_SYMBOLS` (rates-signal
internals + `rates-signal.spec.ts`). Exports serve the 100%-coverage unit tests; only their BARREL
re-exports are unused (NJ-07).

### K-17. Hexagonal port types (`CurrencyPort`, `RegionPort`, `ThemePort`, `ExchangeRatesPort`, `Translator`)

Type-only usage: each is imported by its domain hook (`useCurrency.ts`, `useRegion.ts`,
`useTheme.ts`, `useExchangeRates.ts`, `useTranslation.ts`/`translator.ts`) as the return-shape
contract. ts-prune flags the barrel re-export lines only.

### K-18. Config-string devDependencies

`jest-transform-stub` (jest.config.ts:28 transform), `jest-environment-jsdom` (jest.config.ts:30),
`ts-jest` (preset), `husky` (`prepare` script + `.husky/pre-commit|commit-msg|pre-push`),
`@commitlint/cli` + `commitlint-config-gitmoji` (`.husky/commit-msg` runs commitlint;
`commitlint.config.cjs` extends `gitmoji`), `sass` (vite SCSS pipeline), `@vitejs/plugin-react`
(vite.config.ts:2). No import edges — all referenced by string/convention.

### K-19. `scripts/quality-gate-report.sh` and `docker/nginx.conf`

`package.json:25` `sonar:report` + `.husky/pre-push`; `Dockerfile:39` `COPY docker/nginx.conf`.

### K-20. `jest-setup.ts` global mocks

`scrollIntoView` (CONTRACTS §17), `matchMedia`, sync `requestAnimationFrame` (FE-005),
`ResizeObserver` (needed by `useDropdownPosition`) — all load-bearing for the suite; none removable
even though no file imports jest-setup (wired via `setupFilesAfterEach`, jest.config.ts:64).

### K-21. npm dependencies — final verdict: **zero unused**

`pnpm dlx depcheck` → "No depcheck issue". Manual verification of all 6 deps + 24 devDeps: every one
accounted for by direct import, peer requirement (K-09), transitive require (K-10), or config-string
reference (K-18). (`typescript` and `vite` sit in `dependencies` rather than `devDependencies` — a
placement oddity, not dead weight; build scripts use both.)

---

## 4. Tool-report reconciliation (why the tools lied)

| Tool claim                          | Reality                                                                                                                                                                                                                                                                                                                                    |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| knip: 47 unused files               | 26 SCSS partials (K-01, no SCSS tracing), 2 templates (K-02, string-referenced), 1 codepen ref (K-03), 2 service workers (NJ-01/02, browser-fetched by URL), `test-utils.tsx` (NJ-03), `region/signals/side-effects.ts` (NJ-04), 3 geo barrels (NJ-05, dead cluster), 11 sub-barrels (SD-16..26, genuinely dead), `templates` double-count |
| knip: 89 unused exports             | ~40 = unused barrel re-export LINES of live symbols (NJ-07); ~17 = dual default-export convention (NJ-08); 4 e2e helpers genuinely dead (SD-02..05); 2 de-export candidates (SD-27/28); rest = spec-consumed seams (NJ-06, K-16)                                                                                                           |
| knip: unlisted dep @playwright/test | false — declared in `e2e/package.json` (K-11)                                                                                                                                                                                                                                                                                              |
| ts-prune: ~200 lines                | same barrel-noise classes; per-symbol grep table confirmed every domain constant/signal alive via direct paths                                                                                                                                                                                                                             |
| depcheck: clean                     | confirmed by manual table (K-21)                                                                                                                                                                                                                                                                                                           |

Untracked build artifacts noted in passing (not repo dead code, nothing to delete from git):
`e2e/playwright-report/`, `e2e/test-results/`, `test-results/`, `coverage/`, `dist/` — all absent
from `git ls-files`.

---

## 5. Recommended phase-2 order (if/when a delete task is authorized)

1. SD-01 (asset), SD-02..05 (e2e helpers) — zero blast radius.
2. SD-27/28 (de-exports) — zero blast radius, run `pnpm exec tsc --noEmit` + `pnpm test`.
3. SD-16..26 (sub-barrels) — zero importers; run full gate.
4. SD-06..15 (i18n keys) — 4 locales + TranslationKeys + **CONTRACTS.md §i18n amendment** in one
   commit.
5. NJ items — each needs an explicit owner decision first; NJ-11 is a wiring FIX, not a deletion.
