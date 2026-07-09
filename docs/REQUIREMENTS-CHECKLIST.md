# Requirements Checklist — Verifiable Acceptance

**STATUS: COMPLETE (2026-07-09).** Task 3: ThemeModeButton (tri-state cycle). QA PASSED.

Legend: `[x]` met · `[ ]` pending · `[~]` met-with-documented-deviation · `[N/A]` out of scope ·
`[SUPERSEDED]` replaced by newer requirement · `[FAIL]` verified failed

---

## PHASE 1: Baseline (2026-06-29) — COMPLETE

### A. Tooling & Package Manager

- [x] A1. **Bare `pnpm install` / `dev` / `build` / `test` / `lint` all run (exit 0, no
      flags/env).** `pnpm dev` serves http://localhost:5173 -> HTTP 200 (verified live).
- [x] A2. No npm/npx anywhere (guard hook enforces; CI uses direct binaries/pnpm).
- [x] A3. pnpm@latest (11.5.1) is the working manager — fixed by setting `packageManager` to
      `pnpm@11.5.1` and deciding native build scripts in `pnpm-workspace.yaml`
      (`allowBuilds: false`).
- [~] A4. `package.json` changed by **exactly one authorized line** (`packageManager: yarn@4.9.1` ->
  `pnpm@11.5.1`); no other change. (Originally locked; user authorized this one line so bare
  `pnpm dev` works.)

### B. Build, Types, Lint

- [x] B1. `tsc --noEmit` -> 0 errors.
- [x] B2. `vite build` -> success (185ms).
- [x] B3. ESLint -> 0 errors (config rewritten to installed plugins; ESLint-10 compat fixed).
- [x] B4. Prettier clean (enforced via eslint-plugin-prettier).

### C. Scaffolding (generate-react-cli)

- [x] C1. Component scaffolding works (verified, `pnpm dlx`).
- [x] C2. Hook type present + paths feature-aware.
- [x] C3. Generated code passes tsc + lint + test.
- [x] C4. Templates aligned with architecture; `feature` type added.

### D. Internationalization & Language Selector

- [x] D1. i18n core: typed port (`Translator`) + provider adapter (`I18nProvider`).
- [x] D2. Accessible, keyboard-operable language selector (label + aria-describedby).
- [x] D3. Switching updates all visible copy live (e2e verified).
- [x] D4. Preference persists (localStorage) + restores on reload (e2e verified).
- [x] D5. Resolution: persisted -> navigator -> default (unit-tested, all branches).
- [x] D6. `<html lang>` reflects active locale (e2e verified).
- [x] D7. 2 locales (en, es) with proper native names (English, Espanol).

### E. No Hardcoding

- [x] E1. No hardcoded user-facing strings (all via `t()`; QA grep clean).
- [x] E2. No magic config; locales/default/storage-key centralized + typed.
- [x] E3. No hardcoded secrets (guard + security audit clean).

### F. Architecture & SOLID

- [x] F1. Scream architecture (top-level = features/i18n/shared, not framework).
- [x] F2. Folder-by-feature (`src/features/*`).
- [x] F3. Clean/Hexagonal (i18n behind port; deps point inward; arch test enforces no cross-feature
      imports).
- [x] F4. SOLID (SRP modules, DIP via context/ports, ISP typed interfaces).
- [x] F5. ADRs recorded (`docs/architecture/adr-0001..0004` + CONTRACTS.md).

### G. Testing & Coverage

- [x] G1. Unit coverage **100%** (87/87 stmts, 30/30 branches, 17/17 funcs, 82/82 lines).
- [x] G2. Integration tests (provider + selector live switching, persistence).
- [x] G3. Jest thresholds set to 100% (enforced).
- [x] G4. e2e (Playwright) 13/13: load, switch, persist, a11y, perf.
- [x] G5. TDD/BDD: Given/When/Then specs; spec per first-party module (79 tests total).
- [x] G6. SDD: features traceable to PRD + contracts.

### H. Performance (<500ms)

- [x] H1. Bundle 61.41KB gz (<=65KB budget).
- [x] H2. App-interactive 69-74ms (<<500ms; Playwright-measured).
- [x] H3. Locale code-split evaluated; not needed (<1KB) — documented in perf report.
- [x] H4. Performance Engineer report recorded.

### I. Accessibility & Mobile-first

- [x] I1. Mobile-first SCSS (base = mobile; `min-width` enhancements).
- [x] I2. Selector keyboard-reachable + accessible name (e2e verified).

### J. Security

- [x] J1. Dependency audit: 0 critical/high (1 moderate devDep accepted).
- [x] J2. No secrets committed.
- [x] J3. Security Auditor report recorded.

### K. SonarQube

- [x] K1. Project `vite-boilerplate-scss` analyzed (localhost:9000).
- [x] K2. Quality gate = **PASSED** (CAYC-compliant).
- [x] K3. 0 bugs / 0 vulnerabilities / 0 hotspots / **0 code smells**; ratings A/A/A; 100% coverage;
      0% duplication.

### L. Process / Multi-agent / Loop

- [x] L1. PRD created (`docs/PRD.md`).
- [x] L2. Checklist created (this file).
- [x] L3. Phased plan with contracts/acceptance/risks/limits (`docs/PLAN.md`).
- [x] L4. All roles engaged: Orchestrator, Architect, Backend [N/A-documented], Frontend, QA(x2),
      DevOps, Security, Performance.
- [x] L5. Every agent wrote a log (`logs/` — 7 logs + QA cycle2).
- [x] L6. loop-enforcer sign-off + Orchestrator final report (`docs/DELIVERY-REPORT.md`).

### M. Out-of-scope (documented N/A for this frontend repo)

- [N/A] M1. Backend Engineer implementation — separate repo.
- [N/A] M2. Google OAuth2 real login — separate backend repo.
- [N/A] M3. Auto-Swagger — backend repo.
- [N/A] M4. p95 backend latency <500ms under load — backend repo.
- [N/A] M5. Backend docker-compose / DB migrations — backend repo.
- [~] M6. Icons from react-icons only — resolved in Task 1: react-icons@5.7.0 added.

---

## PHASE 2 TASK 1: Design System (2026-07-09) — COMPLETE

### DS. Design System Architecture

| ID    | Requirement                                               | Test Location                | Status |
| ----- | --------------------------------------------------------- | ---------------------------- | ------ |
| DS-01 | ITCSS layer structure implemented (`src/shared/ds/`)      | `arch/design-system.spec.ts` | [x]    |
| DS-02 | All design tokens defined in `settings/_tokens.scss`      | `arch/design-system.spec.ts` | [x]    |
| DS-03 | No hardcoded hex/rgb/hsl colors in component SCSS         | `arch/design-system.spec.ts` | [x]    |
| DS-04 | Settings/Tools layers produce no CSS output               | `arch/design-system.spec.ts` | [x]    |
| DS-05 | Components use `c-` prefix, objects use `o-` prefix       | `arch/design-system.spec.ts` | [x]    |
| DS-06 | No `!important` outside utilities layer                   | `arch/design-system.spec.ts` | [x]    |
| DS-07 | `main.scss` imports design system (`shared/ds/_all.scss`) | Manual verification          | [x]    |
| DS-08 | Existing hardcoded values migrated to tokens              | `arch/design-system.spec.ts` | [x]    |

### THEME. Theming System

| ID       | Requirement                                                     | Test Location                       | Status |
| -------- | --------------------------------------------------------------- | ----------------------------------- | ------ |
| THEME-01 | Theme domain with hexagonal architecture (port/adapter/signals) | `arch/architecture.spec.ts`         | [x]    |
| THEME-02 | Light mode CSS custom properties defined                        | `themes/_light.scss`                | [x]    |
| THEME-03 | Dark mode CSS custom properties defined                         | `themes/_dark.scss`                 | [x]    |
| THEME-04 | `data-theme` attribute on `<html>` element                      | `e2e/theme-toggle.spec.ts`          | [x]    |
| THEME-05 | Theme toggle switches between light/dark                        | `e2e/theme-toggle.spec.ts`          | [x]    |
| THEME-06 | Theme persists to localStorage                                  | `e2e/theme-persistence.spec.ts`     | [x]    |
| THEME-07 | FOUC prevention (inline script in index.html)                   | Manual + `e2e/theme-toggle.spec.ts` | [x]    |
| THEME-08 | Respects `prefers-color-scheme` on first load                   | `e2e/theme-toggle.spec.ts`          | [x]    |
| THEME-09 | `useTheme` hook returns `ThemePort` interface                   | Unit test                           | [x]    |
| THEME-10 | Theme signals follow i18n pattern                               | Code review                         | [x]    |

### NAV. Navbar & Controls (Task 1 — SUPERSEDED by Task 2)

| ID     | Requirement                                    | Test Location                          | Status       |
| ------ | ---------------------------------------------- | -------------------------------------- | ------------ |
| NAV-01 | Navbar component renders at top of app         | `e2e/accessibility.spec.ts`            | [x]          |
| NAV-02 | Icon buttons ONLY (no dropdowns/selects)       | Code review + `e2e/`                   | [SUPERSEDED] |
| NAV-03 | Icons from react-icons (dependency added)      | `package.json`                         | [x]          |
| NAV-04 | LanguageCycleButton cycles locales on click    | `e2e/language-selection.spec.ts`       | [SUPERSEDED] |
| NAV-05 | ThemeModeToggle toggles light/dark on click    | `e2e/theme-toggle.spec.ts`             | [SUPERSEDED] |
| NAV-06 | CountryCycleButton cycles regions on click     | `e2e/journeys/navbar-controls.spec.ts` | [SUPERSEDED] |
| NAV-07 | All controls keyboard accessible (Enter/Space) | `e2e/navbar-keyboard-a11y.spec.ts`     | [x]          |
| NAV-08 | Aria-live announces state changes              | `e2e/navbar-keyboard-a11y.spec.ts`     | [x]          |
| NAV-09 | Each IconButton has mandatory `aria-label`     | Unit tests                             | [x]          |
| NAV-10 | Mobile-first layout (stacks on small screens)  | Visual + `e2e/`                        | [x]          |

**Supersession note (2026-07-09):** NAV-02, NAV-04, NAV-05, NAV-06 are superseded by user
requirement correction mandating dropdown menus instead of cycle buttons. See ADR-0007 and NAV2-xx
requirements below.

### REGION. Country/Region System

| ID        | Requirement                                         | Test Location                   | Status       |
| --------- | --------------------------------------------------- | ------------------------------- | ------------ |
| REGION-01 | Region domain with hexagonal architecture           | `arch/architecture.spec.ts`     | [x]          |
| REGION-02 | 4 regions supported (US, ES, GB, MX)                | Config + unit test              | [x]          |
| REGION-03 | Region persists to localStorage                     | `e2e/country-selection.spec.ts` | [x]          |
| REGION-04 | `useRegion` hook returns `RegionPort` interface     | Unit test                       | [x]          |
| REGION-05 | `formatDate()` uses region's dateLocale             | Unit test                       | [x]          |
| REGION-06 | `formatNumber()` uses region's numberLocale         | Unit test                       | [x]          |
| REGION-07 | `formatCurrency()` uses region's currency           | Unit test                       | [SUPERSEDED] |
| REGION-08 | Country distinct from language (can be independent) | Design/Code review              | [x]          |

**Supersession note:** REGION-07 moved to currency domain (CURR-04).

### COMP. Shared Components

| ID      | Requirement                                                   | Test Location | Status |
| ------- | ------------------------------------------------------------- | ------------- | ------ |
| COMP-01 | Button component with variants (primary/secondary/ghost)      | Unit test     | [x]    |
| COMP-02 | IconButton component with mandatory aria-label                | Unit test     | [x]    |
| COMP-03 | Link component with external link handling                    | Unit test     | [x]    |
| COMP-04 | Announcer component for aria-live regions                     | Unit test     | [x]    |
| COMP-05 | All components use design system tokens (no hardcoded values) | Arch test     | [x]    |
| COMP-06 | All components are 100% functional (no decorative-only)       | Code review   | [x]    |

### QUALITY. Maintained Quality Gates (Task 1)

| ID         | Requirement                                | Test Location               | Status |
| ---------- | ------------------------------------------ | --------------------------- | ------ |
| QUALITY-01 | 100% unit test coverage maintained         | `pnpm test --coverage`      | [x]    |
| QUALITY-02 | All existing e2e tests still pass          | `pnpm exec playwright test` | [x]    |
| QUALITY-03 | `tsc --noEmit` exits 0                     | CI                          | [x]    |
| QUALITY-04 | ESLint exits 0                             | CI                          | [x]    |
| QUALITY-05 | Bundle size remains under budget (70KB gz) | Build output                | [x]    |
| QUALITY-06 | App interactivity remains under 500ms      | `e2e/accessibility.spec.ts` | [x]    |

**Note:** QUALITY-05 budget revised to 70KB gz per user approval (2026-07-09) to accommodate
react-icons and design system.

---

## PHASE 2 TASK 2: Navbar Dropdowns + Currency (2026-07-09) — COMPLETE

**QA Verification Date:** 2026-07-09 (Cycle 3 FINAL)

### DDL. Dropdown Component (Design System)

| ID     | Requirement                                                      | Test Location                      | Status |
| ------ | ---------------------------------------------------------------- | ---------------------------------- | ------ |
| DDL-01 | Generic `Dropdown` component in `src/shared/components/Dropdown` | `Dropdown.spec.tsx`                | [x]    |
| DDL-02 | Trigger is icon-only button with `aria-haspopup="listbox"`       | Unit test                          | [x]    |
| DDL-03 | Trigger has `aria-expanded` reflecting open state                | Unit test                          | [x]    |
| DDL-04 | Trigger has `aria-controls` pointing to panel ID                 | Unit test                          | [x]    |
| DDL-05 | Panel has `role="listbox"` and `aria-labelledby`                 | Unit test                          | [x]    |
| DDL-06 | Options have `role="option"` with `aria-selected`                | Unit test                          | [x]    |
| DDL-07 | Roving tabindex on options (focused = 0, others = -1)            | Unit test                          | [x]    |
| DDL-08 | Enter/Space opens dropdown and selects option                    | Unit test + e2e                    | [x]    |
| DDL-09 | Arrow Down/Up navigates options (with wrap)                      | Unit test + e2e                    | [x]    |
| DDL-10 | Home/End jumps to first/last option                              | Unit test + e2e                    | [x]    |
| DDL-11 | Escape closes dropdown and returns focus to trigger              | Unit test + e2e                    | [x]    |
| DDL-12 | Tab closes dropdown without changing selection                   | Unit test                          | [x]    |
| DDL-13 | Click outside closes dropdown                                    | Unit test + e2e                    | [x]    |
| DDL-14 | Each option displays icon + localized text                       | Unit test                          | [x]    |
| DDL-15 | Touch targets >= 48px (options), >= 44px (trigger)               | e2e navbar-controls.spec.ts        | [x]    |
| DDL-16 | Open/close animation respects `prefers-reduced-motion`           | e2e navbar-controls.spec.ts        | [x]    |
| DDL-17 | Panel positioned absolutely, uses `$z-dropdown`                  | SCSS verification                  | [x]    |
| DDL-18 | Closed panel hidden from AT (aria-hidden when !isOpen)           | Unit test + e2e accessibility.spec | [x]    |

**Notes (Cycle 3 FINAL):**

- DDL-08 to DDL-11: FE-005 CLOSED - all 13 keyboard e2e tests pass
- DDL-14: Icon assertions in all 4 dropdown specs (DEF-Q1 CLOSED)
- DDL-18: DEF-A11Y-1 CLOSED - aria-hidden={!isOpen} added to DropdownPanel.tsx:19; unit tests at
  Dropdown.spec.tsx:98-109; e2e at accessibility.spec.ts:119-156

### NAV2. Navbar Dropdown Controls (replaces NAV-02,04,05,06 — THEME SUPERSEDED by Task 3)

| ID      | Requirement                                         | Test Location               | Status       |
| ------- | --------------------------------------------------- | --------------------------- | ------------ |
| NAV2-01 | LanguageDropdown replaces LanguageCycleButton       | `LanguageDropdown.spec.tsx` | [x]          |
| NAV2-02 | ThemeDropdown replaces ThemeModeToggle              | `ThemeDropdown.spec.tsx`    | [SUPERSEDED] |
| NAV2-03 | CountryDropdown replaces CountryCycleButton         | `CountryDropdown.spec.tsx`  | [x]          |
| NAV2-04 | CurrencyDropdown added (new control)                | `CurrencyDropdown.spec.tsx` | [x]          |
| NAV2-05 | Old cycle button directories DELETED (no dead code) | File system check (QA grep) | [x]          |
| NAV2-06 | Navbar renders all 4 dropdowns                      | `Navbar.spec.tsx` + e2e     | [SUPERSEDED] |
| NAV2-07 | Selection triggers aria-live announcement           | Unit specs verify Announcer | [x]          |
| NAV2-08 | LanguageDropdown options: en (MdLanguage), es       | Unit test + code review     | [x]          |
| NAV2-09 | ThemeDropdown options: light (MdLightMode), dark    | Unit test + code review     | [SUPERSEDED] |
| NAV2-10 | CountryDropdown options: US/ES/GB/MX (MdPublic)     | Unit test + code review     | [x]          |
| NAV2-11 | CurrencyDropdown options: USD/EUR/GBP/MXN           | Unit test + code review     | [x]          |

**Supersession note (Task 3 - 2026-07-09):** NAV2-02, NAV2-06, NAV2-09 superseded by user
requirement supersession #2 mandating theme control as tri-state cycle button (not dropdown). See
ADR-0009 and THEME3-xx requirements below.

### CURR. Currency Domain (NEW)

| ID      | Requirement                                                  | Test Location                | Status |
| ------- | ------------------------------------------------------------ | ---------------------------- | ------ |
| CURR-01 | Currency domain with hexagonal architecture                  | Code structure verification  | [x]    |
| CURR-02 | 4 currencies supported (USD, EUR, GBP, MXN)                  | Config + unit test           | [x]    |
| CURR-03 | Currency persists to localStorage                            | Unit test + e2e              | [x]    |
| CURR-04 | `useCurrency` hook returns `CurrencyPort` interface          | Unit test                    | [x]    |
| CURR-05 | `formatCurrency()` uses selected currency                    | Unit test                    | [x]    |
| CURR-06 | Default currency derived from region                         | Unit test                    | [x]    |
| CURR-07 | User override persists independently of region               | Unit test                    | [x]    |
| CURR-08 | Region change updates currency ONLY if no user override      | Unit test                    | [x]    |
| CURR-09 | Greeting displays price using `useCurrency().formatCurrency` | Greeting.tsx:11; e2e         | [x]    |
| CURR-10 | CurrencyProvider wraps app (after RegionProvider)            | `App.tsx` + integration test | [x]    |

### MF. Mobile-First Enforcement (NEW)

| ID    | Requirement                                             | Test Location             | Status |
| ----- | ------------------------------------------------------- | ------------------------- | ------ |
| MF-01 | No `@media (max-width` anywhere in `src/**/*.scss`      | QA grep verification      | [x]    |
| MF-02 | All responsive mixins use `min-width` only              | `tools/_responsive.scss`  | [x]    |
| MF-03 | Component base styles are mobile styles (no media wrap) | e2e 375px viewport passes | [x]    |

### FUNC. Functional Completeness (NEW)

| ID      | Requirement                                          | Test Location      | Status |
| ------- | ---------------------------------------------------- | ------------------ | ------ |
| FUNC-01 | No buttons with empty onClick handlers               | QA grep = 0 hits   | [x]    |
| FUNC-02 | No links with `href="#"` or `href=""`                | QA grep = 0 hits   | [x]    |
| FUNC-03 | Every interactive element has real action/navigation | QA decorative scan | [x]    |

### QUALITY2. Quality Gates (Task 2)

| ID          | Requirement                                 | Test Location                         | Status |
| ----------- | ------------------------------------------- | ------------------------------------- | ------ |
| QUALITY2-01 | 100% unit test coverage maintained          | 618/618 stmts, 148/148 br, 129/129 fn | [x]    |
| QUALITY2-02 | All e2e tests pass (including new dropdown) | 58/58 pass (cycle 3 FINAL)            | [x]    |
| QUALITY2-03 | `tsc --noEmit` exits 0                      | Exit code 0                           | [x]    |
| QUALITY2-04 | ESLint exits 0                              | Exit code 0                           | [x]    |
| QUALITY2-05 | Bundle size under budget (rev.3)            | 220,599 B raw <= 224 KB; 69.82 kB gz  | [x]    |
| QUALITY2-06 | App interactivity under 500ms               | e2e accessibility.spec.ts passes      | [x]    |
| QUALITY2-07 | Mobile-first arch test passes               | grep finds no max-width               | [x]    |

**Notes (Cycle 3 FINAL):**

- QUALITY2-02: 58/58 e2e tests pass (56 original + 2 DEF-A11Y-1 regression tests)
- QUALITY2-05: Budget rev.3 approved by owner (224 KB raw / 70 KB gzip); actual 220,599 B raw /
  69.82 KB gzip — PASS

---

## PHASE 2 TASK 3: ThemeModeButton — Tri-State Cycle (2026-07-09) — COMPLETE

**QA Verification Date:** 2026-07-09 (Cycle 1)

**User Requirement (verbatim supersession #2):**

> "Dark mode cannot be a dropdown menu because that would confuse or annoy the user; it's better if
> it's a button that changes as it's pressed. It will have three modes that swap the icon: light
> mode, dark mode, and system (which will use the one the user has for their system)."

**Architecture Phase:** ADR-0009 + CONTRACTS.md v3.1.0 produced.

### THEME3. ThemeModeButton Component

| ID        | Requirement                                             | Test Location                 | Status |
| --------- | ------------------------------------------------------- | ----------------------------- | ------ |
| THEME3-01 | ThemeModeButton replaces ThemeDropdown (not a dropdown) | File existence check          | [x]    |
| THEME3-02 | Cycle order: light -> dark -> system -> light           | Unit test + e2e               | [x]    |
| THEME3-03 | Icon for light: MdLightMode                             | Unit test                     | [x]    |
| THEME3-04 | Icon for dark: MdDarkMode                               | Unit test                     | [x]    |
| THEME3-05 | Icon for system: MdSettingsBrightness                   | Unit test                     | [x]    |
| THEME3-06 | aria-label reflects current preference (localized)      | Unit test                     | [x]    |
| THEME3-07 | No aria-haspopup (not a popup trigger)                  | Unit test                     | [x]    |
| THEME3-08 | Announcer announces preference change                   | Unit test                     | [x]    |
| THEME3-09 | ThemePreference persists to localStorage                | Unit test + e2e               | [x]    |
| THEME3-10 | 'system' value stored in localStorage                   | e2e                           | [x]    |
| THEME3-11 | System preference follows OS live (matchMedia listener) | e2e with page.emulateMedia    | [x]    |
| THEME3-12 | FOUC script resolves 'system' via matchMedia            | e2e                           | [x]    |
| THEME3-13 | Default preference is 'system' (new users)              | Unit test + e2e               | [x]    |
| THEME3-14 | ThemeDropdown directory DELETED                         | File system check             | [x]    |
| THEME3-15 | e2e theme-persistence.spec.ts rewritten for tri-state   | e2e pass                      | [x]    |
| THEME3-16 | e2e dropdown-keyboard-nav theme cases removed           | e2e pass                      | [x]    |
| THEME3-17 | i18n keys: navbar.themeModeLight/Dark/System added      | Translation file verification | [x]    |
| THEME3-18 | i18n keys: navbar.selectTheme, currentTheme DELETED     | Translation file verification | [x]    |
| THEME3-19 | 100% unit coverage maintained                           | Jest coverage report          | [x]    |
| THEME3-20 | All e2e tests pass                                      | Playwright exit 0             | [x]    |

### THEME3-DOM. Theme Domain Updates

| ID            | Requirement                                             | Test Location           | Status |
| ------------- | ------------------------------------------------------- | ----------------------- | ------ |
| THEME3-DOM-01 | ThemePreference type: 'light' / 'dark' / 'system'       | types/Theme.ts          | [x]    |
| THEME3-DOM-02 | ThemeMode type: 'light' / 'dark' (effective)            | types/Theme.ts          | [x]    |
| THEME3-DOM-03 | themePreferenceSignal stores user choice                | signals/theme-signal.ts | [x]    |
| THEME3-DOM-04 | osPrefersDarkSignal tracks OS preference                | signals/theme-signal.ts | [x]    |
| THEME3-DOM-05 | effectiveThemeSignal computes resolved mode             | signals/theme-signal.ts | [x]    |
| THEME3-DOM-06 | ThemeProvider sets up matchMedia listener               | adapters/ThemeProvider  | [x]    |
| THEME3-DOM-07 | ThemePort updated: preference, effectiveMode, cycle     | ports/Theme.ts          | [x]    |
| THEME3-DOM-08 | getNextPreference() utility: light->dark->system->light | config/themes.ts        | [x]    |

### THEME3-FOUC. FOUC Prevention Updates

| ID            | Requirement                                           | Test Location | Status |
| ------------- | ----------------------------------------------------- | ------------- | ------ |
| THEME3-FOUC-1 | index.html script handles 'system' stored value       | index.html    | [x]    |
| THEME3-FOUC-2 | index.html script handles absent key -> matchMedia    | index.html    | [x]    |
| THEME3-FOUC-3 | index.html script handles invalid value -> matchMedia | index.html    | [x]    |

### THEME3-A11Y. Accessibility

| ID            | Requirement                                       | Test Location   | Status |
| ------------- | ------------------------------------------------- | --------------- | ------ |
| THEME3-A11Y-1 | Button has dynamic aria-label per preference      | Unit test       | [x]    |
| THEME3-A11Y-2 | No aria-haspopup attribute                        | Unit test       | [x]    |
| THEME3-A11Y-3 | No aria-expanded attribute                        | Unit test       | [x]    |
| THEME3-A11Y-4 | Keyboard: Enter cycles preference                 | Unit test + e2e | [x]    |
| THEME3-A11Y-5 | Keyboard: Space cycles preference                 | Unit test + e2e | [x]    |
| THEME3-A11Y-6 | Touch target >= 44px                              | e2e             | [x]    |
| THEME3-A11Y-7 | Icon shapes differentiate modes (not color alone) | Code review     | [x]    |

### THEME3-I18N. Internationalization

| ID            | Requirement                                            | Test Location    | Status |
| ------------- | ------------------------------------------------------ | ---------------- | ------ |
| THEME3-I18N-1 | en.ts: navbar.themeModeLight = 'Light mode'            | Translation file | [x]    |
| THEME3-I18N-2 | en.ts: navbar.themeModeDark = 'Dark mode'              | Translation file | [x]    |
| THEME3-I18N-3 | en.ts: navbar.themeModeSystem = 'System theme'         | Translation file | [x]    |
| THEME3-I18N-4 | es.ts: navbar.themeModeLight = 'Modo claro'            | Translation file | [x]    |
| THEME3-I18N-5 | es.ts: navbar.themeModeDark = 'Modo oscuro'            | Translation file | [x]    |
| THEME3-I18N-6 | es.ts: navbar.themeModeSystem = 'Tema del sistema'     | Translation file | [x]    |
| THEME3-I18N-7 | navbar.selectTheme key REMOVED from both translations  | Translation file | [x]    |
| THEME3-I18N-8 | navbar.currentTheme key REMOVED from both translations | Translation file | [x]    |

### QUALITY3. Quality Gates (Task 3)

| ID          | Requirement                                      | Test Location              | Status |
| ----------- | ------------------------------------------------ | -------------------------- | ------ |
| QUALITY3-01 | `pnpm exec tsc --noEmit` exits 0                 | CI                         | [x]    |
| QUALITY3-02 | `pnpm test` exits 0 with 100% coverage           | Jest                       | [x]    |
| QUALITY3-03 | `pnpm exec playwright test` exits 0              | Playwright                 | [x]    |
| QUALITY3-04 | No hardcoded hex/rgb/hsl in SCSS (arch test)     | arch/design-system.spec.ts | [x]    |
| QUALITY3-05 | No @media (max-width in SCSS (mobile-first)      | QA grep                    | [x]    |
| QUALITY3-06 | Bundle size under budget (224 KB raw / 70 KB gz) | Build output               | [x]    |
| QUALITY3-07 | ThemeDropdown directory deleted (no dead code)   | File system check          | [x]    |

---

## E2E Journey Requirements (Task 3 Updates)

| Journey               | File                                                | Status | Notes                              |
| --------------------- | --------------------------------------------------- | ------ | ---------------------------------- |
| Language Selection    | `e2e/journeys/language-selection.spec.ts`           | [x]    | Unchanged                          |
| Theme Persistence     | `e2e/journeys/theme-persistence.spec.ts`            | [x]    | Rewritten: tri-state + live OS     |
| Country Selection     | `e2e/journeys/country-selection.spec.ts`            | [x]    | Unchanged                          |
| Currency Selection    | `e2e/journeys/currency-selection.spec.ts`           | [x]    | Unchanged                          |
| Navbar Controls       | `e2e/journeys/navbar-controls.spec.ts`              | [x]    | Updated: theme button not dropdown |
| Dropdown Keyboard Nav | `e2e/journeys/dropdown-keyboard-navigation.spec.ts` | [x]    | Theme cases removed (11 tests)     |
| Accessibility         | `e2e/journeys/accessibility.spec.ts`                | [x]    | Updated: theme button a11y         |

---

## Traceability Matrix

| ADR                                      | Requirements Covered                           |
| ---------------------------------------- | ---------------------------------------------- |
| ADR-0005 (Design System)                 | DS-01 to DS-08, COMP-05                        |
| ADR-0006 (Theming)                       | THEME-01 to THEME-10                           |
| ADR-0007 (Navbar Dropdowns)              | DDL-01 to DDL-18, NAV2-01,03,04,05,07,08,10,11 |
| ADR-0008 (Build Target)                  | Browser matrix documented, esnext ratified     |
| ADR-0009 (ThemeModeButton)               | THEME3-xx (all task 3 requirements)            |
| CONTRACTS.md v3.1 Section 3 (Theme)      | THEME3-DOM-01 to THEME3-DOM-08                 |
| CONTRACTS.md v3.1 Section 7.2 (Button)   | THEME3-01 to THEME3-20                         |
| CONTRACTS.md v3.1 Section 5 (Currency)   | CURR-01 to CURR-10                             |
| CONTRACTS.md v3.1 Section 6.4 (Dropdown) | DDL-01 to DDL-18                               |
| CONTRACTS.md v3.1 Section 8.4 (Mobile)   | MF-01 to MF-03                                 |
| CONTRACTS.md v3.1 Section 8.5 (Func)     | FUNC-01 to FUNC-03                             |

---

## Summary Statistics

| Category       | Total   | Pending | Passed  | Failed | Superseded |
| -------------- | ------- | ------- | ------- | ------ | ---------- |
| Phase 1        | 47      | 0       | 46      | 0      | 0          |
| Phase 2 Task 1 | 48      | 0       | 43      | 0      | 5          |
| Phase 2 Task 2 | 53      | 0       | 47      | 0      | 6          |
| Phase 2 Task 3 | 47      | 0       | 47      | 0      | 0          |
| **Total**      | **195** | **0**   | **183** | **0**  | **11**     |

**Task 3 Status: QA PASSED - ALL 47 REQUIREMENTS MET**

- ADR-0009: Theme Mode Button implemented
- CONTRACTS.md: v3.1.0 with Section 7.2 supersession
- All 47 checklist rows verified with evidence
- No open defects
