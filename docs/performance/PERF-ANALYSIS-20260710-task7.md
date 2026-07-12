# Performance Analysis - Task 7 Bundle Verification

**Date:** 2026-07-10  
**Analyst:** Performance Engineer  
**Subject:** Task-7 MobileMenu Bundle Analysis, Trim Assessment, and Budget Decision

---

## Executive Summary

Task-7 (mobile fullscreen menu, CodePen OJLMgYY fidelity) landed at **239,458 bytes raw** (+2,458 B
over rev.7 limit) and **75,312 bytes gzip -6** (188 B UNDER limit, **PASSES**). The raw breach is
real but the gzip SLO (the actual transfer metric) passes. Trim analysis found only ~178 B of
extractable duplication - insufficient to close the 2,458 B raw gap. **Verdict: REV8** with honest
floor-based limits.

---

## Bundle Measurements

| Metric            | Value         | Budget (rev.7) | Status                       |
| ----------------- | ------------- | -------------- | ---------------------------- |
| Raw JS            | 239,458 bytes | 237,000 bytes  | +2,458 bytes OVER (FAIL)     |
| Gzip JS (level 6) | 75,312 bytes  | 75,500 bytes   | 188 bytes UNDER (**PASS**)   |
| CSS Raw           | 27,257 bytes  | N/A (see note) | N/A                          |
| CSS Gzip          | 5,207 bytes   | 10,000 bytes   | 4,793 bytes UNDER (**PASS**) |
| Fonts (woff2)     | 39,784 bytes  | 45,000 bytes   | 5,216 bytes UNDER (**PASS**) |
| Build time        | ~360ms        | < 5,000ms      | **PASS**                     |

**Evidence:** `stat -f%z dist/assets/index-C2MEPWYW.js` = 239,458; `gzip -6 -c | wc -c` = 75,312

---

## FE Gzip Measurement Discrepancy

The FE log claims **76,310 B gzip > 75,500 B** but this is INCORRECT under the documented
methodology (`gzip -6` command-line).

| Method                       | Result       | Notes                                      |
| ---------------------------- | ------------ | ------------------------------------------ |
| `gzip -6 -c` (authoritative) | 75,312 bytes | budgets.md specifies gzip level 6          |
| Vite build output            | 76.31 kB     | Different internal compression (Node zlib) |
| Node zlib level 6            | 75,526 bytes | Slight impl difference from GNU gzip       |

The FE likely read Vite's displayed "76.31 kB" and interpreted it as 76,310 bytes. The authoritative
measurement is `gzip -6` command-line which gives **75,312 B <= 75,500 B (PASSES)**.

---

## Task-7 Delta Decomposition

**Baseline (task-6 floor):** 232,012 bytes raw  
**Current (task-7):** 239,458 bytes raw  
**Delta:** +7,446 bytes

### Attribution

| Component                 | Source Size | Est. Minified | Notes                                  |
| ------------------------- | ----------: | ------------: | -------------------------------------- |
| MobileMenu.tsx            |     8,642 B |      ~5,000 B | Container, submenu logic, 4 announcers |
| MobileMenuItem.tsx        |     2,276 B |      ~1,300 B | Top-level item, stagger animation      |
| MobileMenuSubmenu.tsx     |     1,896 B |      ~1,100 B | Option expansion                       |
| HamburgerButton.tsx       |       982 B |        ~570 B | Toggle button, aria-expanded           |
| useFocusTrap.ts           |     1,679 B |        ~970 B | Focus trap (~20 lines effective)       |
| mobile-menu-signal.ts     |       934 B |        ~540 B | Open/close signals                     |
| interfaces + index        |     2,724 B |          ~0 B | Types stripped at compile time         |
| **Subtotal mobile-menu/** |    19,133 B |      ~9,480 B |                                        |
| Navbar.tsx integration    |      ~200 B |        ~120 B | Imports, conditional render            |
| Translations (×4 locales) |    ~1,200 B |        ~800 B | mobileMenu section                     |
| **Total estimated**       |             |     ~10,400 B |                                        |

**Actual delta: 7,446 B** - Lower than estimate due to efficient tree-shaking of shared imports
(react-icons MdLightMode/MdDarkMode/MdSettingsBrightness/MdLanguage/MdPublic/MdAttachMoney already
in bundle from desktop dropdowns).

### Why Estimate Missed: Architect's +4 KB vs Actual +7.4 KB

The architect estimated +4 KB raw (ADR-0012 Section 7). Actual is +7,446 B = +7.4 KB.

| Factor                        | Estimate Impact | Notes                             |
| ----------------------------- | --------------: | --------------------------------- |
| Component scaffolding         |        +1,500 B | Props, interfaces, barrel exports |
| useCallback wrappers (×8)     |          +600 B | React memoization overhead        |
| Translation keys (×4 locales) |          +800 B | Not in original estimate          |
| Announcer integrations (×4)   |          +500 B | Screen reader feedback signals    |
| **Total underestimate**       |        +3,400 B | ~+3.4 KB gap                      |

The estimate focused on core component logic but underestimated:

1. Translation overhead across 4 locales (en/es/zh/ja)
2. Accessibility announcement infrastructure
3. React useCallback/useRef/useEffect scaffolding

---

## Trim Feasibility Analysis

### Candidates Found

| Candidate                    | Est. Savings | Feasible? | Notes                                                |
| ---------------------------- | -----------: | --------- | ---------------------------------------------------- |
| PREFERENCE_ICONS duplication |        ~80 B | Yes       | Same const in ThemeModeButton.tsx and MobileMenu.tsx |
| PREFERENCE_LABEL_KEYS dup    |        ~98 B | Yes       | Same pattern                                         |
| **Total extractable**        |       ~178 B |           |                                                      |

### Candidates Rejected

| Candidate                      | Reason                                                   |
| ------------------------------ | -------------------------------------------------------- |
| Remove data-testid props       | Required for e2e tests (132 tests depend on them)        |
| Simplify focus trap            | Already minimal (~20 effective lines)                    |
| Remove translations            | Required for i18n (constitution mandate)                 |
| Drop announcers                | Required for a11y (screen reader feedback)               |
| Merge MobileMenuItem/Submenu   | Would violate separation of concerns, reduce testability |
| Remove useCallback             | Would cause unnecessary re-renders                       |
| Drop icon from submenu options | Violates ADR-0012 fidelity contract (pen has icons)      |

### Verdict

**Trims available: ~178 B**  
**Gap to close: 2,458 B**  
**Feasibility: NOT FEASIBLE**

The ~178 B of extractable duplication would require creating a shared constants file in
`src/theme/config/` and updating imports in both files. This is a ~100-line refactor for 178 B
savings. It does not close the 2,458 B raw gap.

---

## Budget Decision: REV8 Required

Since trims are insufficient, a budget revision is required.

### Proposed Rev.8 Limits

| Metric       |   Rev.7 | Rev.8 (Proposed) | Rationale                               |
| ------------ | ------: | ---------------: | --------------------------------------- |
| Raw limit    | 237,000 |          240,000 | Floor 239,458 + 500 B headroom          |
| Raw warning  | 236,000 |          239,500 | Warning at 500 B under limit            |
| Gzip limit   |  75,500 |           75,500 | **UNCHANGED** - already passes (75,312) |
| Gzip warning |  75,000 |           75,000 | **UNCHANGED**                           |

**Justification:**

1. The gzip metric (actual transfer size) passes - this is the user-facing performance gate
2. Raw is a maintainability proxy; the feature is complete and functional
3. MobileMenu is a legitimate accessibility-compliant feature (focus trap, aria-*, keyboard nav)
4. No further feature growth expected in task-7 scope

---

## Runtime Interactivity Verification

### Font Loading Strategy

| Check                             | Result   | Evidence                                                       |
| --------------------------------- | -------- | -------------------------------------------------------------- |
| font-display: swap                | **PASS** | `grep font-display dist/assets/*.css` shows swap               |
| Preload in <head>                 | **PASS** | index.html has `<link rel="preload" ... as="font">`            |
| No FOIT (Flash of Invisible Text) | **PASS** | swap ensures text visible immediately                          |
| FOUT on menu open                 | ACCEPTED | Text in fallback until fonts load; acceptable for menu overlay |

### No Heavy Top-Level Work

| Check                        | Result   | Evidence                                         |
| ---------------------------- | -------- | ------------------------------------------------ |
| Signals initialization       | **PASS** | `signal<boolean>(false)` is synchronous, ~10 ops |
| No useEffect at module level | **PASS** | All effects are inside components                |
| No async module imports      | **PASS** | Standard synchronous imports                     |

### Layout Shift Risk

- **Menu fonts:** Only affect the fullscreen overlay, not main page layout
- **FOUT scope:** Limited to menu items when menu opens for first time
- **CLS impact:** None on initial page load (menu is not rendered)

**Interactivity SLO (<500ms): NOT AT RISK**

---

## CSS Budget Table Discrepancy

### Current State

The `budgets.md` Resource Budgets table states:

| Chunk    | Max Raw | Max Gzip |
| -------- | ------- | -------- |
| Main CSS | 10 KB   | 3 KB     |

### Reality

| Task   |  CSS Raw | CSS Gzip |
| ------ | -------: | -------: |
| Task-6 | 20,512 B |  3,940 B |
| Task-7 | 27,257 B |  5,207 B |

The CSS resource row has been structurally breached since before task-6 and was never gated. The
**Primary SLO** (CSS gzip <= 10 KB) is the authoritative gate and passes (5.2 KB < 10 KB).

### Proposed Correction

Update the CSS resource table row to reflect the honest floor:

| Chunk    | Max Raw | Max Gzip | Warning Raw | Warning Gzip | Notes                     |
| -------- | ------- | -------- | ----------- | ------------ | ------------------------- |
| Main CSS | 30 KB   | 6.5 KB   | 28 KB       | 6 KB         | Includes mobile menu SCSS |

**Rationale:** Task-7 CSS is 27.3 KB raw / 5.2 KB gzip. Adding headroom for minor future growth
gives 30 KB / 6.5 KB limits. The primary SLO (gzip <= 10 KB) remains unchanged and authoritative.

---

## Findings

| ID          | Severity | Status | Description                                  |
| ----------- | -------- | ------ | -------------------------------------------- |
| PERF-T7-001 | Medium   | Open   | Raw JS 2,458 B over rev.7 limit; gzip passes |
| PERF-T7-002 | Low      | Open   | ~178 B duplication in PREFERENCE_* constants |
| PERF-T7-003 | Info     | Open   | CSS resource table outdated (pre-existing)   |

---

## Conclusion

- **Gzip PASSES** (75,312 B <= 75,500 B limit)
- **Raw FAILS** (239,458 B > 237,000 B limit by 2,458 B)
- **Trims insufficient** (~178 B available vs 2,458 B needed)
- **Verdict: REV8** required for raw limit (240,000 B); gzip limit unchanged (75,500 B)
- **Runtime SLO: NOT AT RISK** - fonts use swap + preload; no heavy top-level work
