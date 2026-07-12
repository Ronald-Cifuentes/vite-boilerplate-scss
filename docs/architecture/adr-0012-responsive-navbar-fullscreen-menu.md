# ADR-0012: Responsive Navbar with Fullscreen Mobile Menu

- **Status:** Accepted (Q1 self-host fonts + Q2 budget rev.7 ratified by project owner, 2026-07-10)
- **Date:** 2026-07-10
- **Deciders:** Architect Agent, pending project owner ratification
- **References:** CodePen OJLMgYY by Ryan Mulligan (hexagoncircle), recovered from web.archive.org

## Context

### User Requirement

The navbar must become responsive: on mobile it collapses to a hamburger that opens a fullscreen
menu replicating CodePen OJLMgYY "Fork This Nav" by hexagoncircle, including its exact fonts.
Desktop navbar stays as-is.

### Current State

- Navbar renders 4 controls inline: LanguageDropdown, ThemeModeButton, CountryDropdown,
  CurrencyDropdown
- At 375px viewport, all controls are visible but crowded
- No hamburger menu exists
- No webfonts loaded (system font stack only)
- Mobile-first architecture enforced (no `max-width` media queries)

### Reference Pen Analysis

The pen (docs/architecture/reference/codepen-OJLMgYY-fork-this-nav/) uses:

- CSS-only checkbox hack for toggle (no JavaScript)
- Hover-only submenu reveal
- Fixed top-right hamburger position
- Band-slide overlay animation (two half-height pseudo-elements)
- Staggered item entrance with nth-child delays
- Sibling pull/dim effect on hover
- Rubik Mono One (10vmin) for top items, Roboto Mono (3.5vmin) for submenu
- Color palette: #18181A (primary), #75757C (secondary), #364C62 (dark), #F5F5F5 (light)

**Author's caveat:** "not been browser tested... quick thrill" - our version must be
production-grade.

## Decision

### 1. Fidelity Contract

#### 1.1 Items to Replicate 1:1 (Visual/Motion Fidelity)

| Item                | Pen Implementation                                                             | Our Implementation      |
| ------------------- | ------------------------------------------------------------------------------ | ----------------------- |
| Band-slide overlay  | `::before`/`::after` half-height bands, `translateX(-110%)` to `translateX(0)` | Identical CSS technique |
| Stagger timing      | `--td: 150ms`, `--te: cubic-bezier(0.215, 0.61, 0.355, 1)`                     | Exact same tokens       |
| Hamburger animation | 2-bar to X with `transform: rotate(1turn)` spin                                | Identical transforms    |
| Top-level item size | `font-size: 10vmin` in Rubik Mono One                                          | Identical               |
| Submenu item size   | `font-size: 3.5vmin` in Roboto Mono                                            | Identical               |
| Sibling pull effect | `--pull: 30%` translateY on hover                                              | Identical               |
| Sibling dim effect  | `opacity: 0.25` on non-hovered                                                 | Identical               |
| Light-band hover    | `::before`/`::after` slide on link hover                                       | Identical               |
| Blink caret         | `@keyframes blink { 50%, 100% { opacity: 0 } }`                                | Identical               |

#### 1.2 Color Adaptation

**Decision:** Map pen colors to theme-aware equivalents.

| Pen Color | Pen Usage            | Our Mapping                                                                                   |
| --------- | -------------------- | --------------------------------------------------------------------------------------------- |
| #18181A   | Band overlay bg      | `--color-mobile-menu-overlay` (dark theme: use as-is; light theme: same or slightly adjusted) |
| #75757C   | Submenu text, hover  | `--color-mobile-menu-secondary`                                                               |
| #364C62   | Default link text    | `--color-mobile-menu-text`                                                                    |
| #F5F5F5   | Hover band, light bg | `--color-mobile-menu-highlight`                                                               |

**Rationale:** Our app has light/dark theming. Using pen colors verbatim would look correct in one
theme but potentially clash in the other. Theme-aware tokens allow visual coherence while preserving
the pen's aesthetic intent. The dark overlay (#18181A) works well in both themes as a "takeover"
effect.

#### 1.3 Documented Deviations (Accessibility/Production Requirements)

| Pen Pattern          | Problem                                               | Our Deviation                                                       |
| -------------------- | ----------------------------------------------------- | ------------------------------------------------------------------- |
| Checkbox hack toggle | No semantic button, no aria-expanded, invisible to AT | Real `<button>` with `aria-expanded`, `aria-controls`, `aria-label` |
| No focus management  | Focus doesn't move into menu on open                  | Focus moves to first menu item on open; returns to trigger on close |
| No Escape handling   | Menu cannot be closed via keyboard                    | Escape closes menu and returns focus                                |
| No tab containment   | Tab can leave open menu                               | Focus trap: tab cycles within menu                                  |
| Hover-only submenus  | Unusable on touch devices                             | Submenus open on tap/focus in addition to hover                     |
| No reduced-motion    | Animations play regardless of user preference         | `prefers-reduced-motion: reduce` disables/shortens all transitions  |

### 2. Controls-to-Menu Mapping

#### 2.1 Structure

At mobile breakpoint:

- Navbar shows: brand/logo (if any) + hamburger button only
- Desktop controls (dropdowns + button) are HIDDEN via CSS
- Fullscreen menu presents 4 top-level items (pen style):
  1. **Language** (localized: "Language" / "Idioma" / "语言" / "言語")
  2. **Country** (localized: "Country" / "Pais" / "国家" / "国")
  3. **Currency** (localized: "Currency" / "Moneda" / "货币" / "通貨")
  4. **Theme** (localized: "Theme" / "Tema" / "主题" / "テーマ")

Each expands its options as the pen's submenu style.

#### 2.2 Options per Item

| Menu Item | Options                                            | Source            |
| --------- | -------------------------------------------------- | ----------------- |
| Language  | en (English), es (Espanol), zh (中文), ja (日本語) | LOCALE_METADATA   |
| Country   | US, ES, GB, MX, CO, CN, JP (native names)          | REGION_METADATA   |
| Currency  | COP, USD, EUR, GBP, MXN, CNY, JPY (with icons)     | CURRENCY_METADATA |
| Theme     | Light, Dark, System (icons as in ThemeModeButton)  | THEME preferences |

#### 2.3 Selection Behavior

**Decision:** Selection closes the submenu but keeps the menu open.

**Rationale:**

- Users may want to change multiple settings (e.g., country + currency)
- Closing the entire menu on each selection forces re-opening
- User explicitly closes via hamburger button or Escape when done
- Exception: Theme cycles immediately (like ThemeModeButton) rather than showing submenu

**Alternative considered:** Theme shows 3 options as submenu. Rejected because the tri-state button
UX (ADR-0009) is well-established; changing it only for mobile would be inconsistent.

#### 2.4 Theme Item Behavior

**Decision:** Theme item cycles through preferences on tap (like ThemeModeButton), not a submenu.

- Displays current preference icon + text
- Tap cycles: light -> dark -> system -> light
- Consistent with ADR-0009 button behavior

### 3. Component Architecture

#### 3.1 New Feature: MobileMenu

```
src/features/mobile-menu/
  components/
    MobileMenu/
      MobileMenu.tsx
      MobileMenu.module.scss
      MobileMenu.spec.tsx
      interfaces.ts
      index.ts
    MobileMenuItem/
      MobileMenuItem.tsx
      MobileMenuItem.module.scss
      MobileMenuItem.spec.tsx
      interfaces.ts
      index.ts
    MobileMenuSubmenu/
      MobileMenuSubmenu.tsx
      MobileMenuSubmenu.module.scss
      MobileMenuSubmenu.spec.tsx
      interfaces.ts
      index.ts
    HamburgerButton/
      HamburgerButton.tsx
      HamburgerButton.module.scss
      HamburgerButton.spec.tsx
      interfaces.ts
      index.ts
  hooks/
    useFocusTrap.ts
    useFocusTrap.spec.ts
  index.ts
```

#### 3.2 Integration Points

- Reuses existing hooks: `useTranslation`, `useRegion`, `useCurrency`, `useTheme`
- Reuses existing signals for state management
- Reuses existing Announcer for screen reader feedback
- Does NOT duplicate domain logic - only UI presentation

#### 3.3 Focus Trap Implementation

**Decision:** Hand-rolled focus trap (~20 lines), no new dependencies.

```typescript
// Simplified concept
export function useFocusTrap(containerRef: RefObject<HTMLElement>, isActive: boolean) {
  useEffect(() => {
    if (!isActive || !containerRef.current) return

    const focusable = containerRef.current.querySelectorAll<HTMLElement>(
      'button, [href], [tabindex]:not([tabindex="-1"])'
    )
    const first = focusable[0]
    const last = focusable[focusable.length - 1]

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    first?.focus()
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isActive])
}
```

### 4. Breakpoint

**Decision:** `< 768px` (below `$breakpoint-md`) triggers mobile menu.

**Rationale:**

- Existing `$breakpoint-md: 768px` is the tablet boundary
- At 768px+, there's sufficient horizontal space for 4 inline controls
- Below 768px, controls become cramped
- Mobile-first: hamburger is base experience, desktop controls are enhancement

**Implementation:**

```scss
// Base: mobile (hamburger + menu)
.navbar {
  // hamburger visible, controls hidden
}

// Enhancement: desktop (inline controls)
@include media-md {
  // hamburger hidden, controls visible
}
```

**Arch test enforcement:** Existing `mobile-first.spec.ts` already verifies no `max-width` queries.

### 5. Font Delivery

#### 5.1 Option Analysis

##### Option A: Self-Host (RECOMMENDED)

| Font File              | Subset | Bytes               |
| ---------------------- | ------ | ------------------- |
| Rubik Mono One         | latin  | 7,032               |
| Roboto Mono (variable) | latin  | 32,752              |
| **Total**              |        | **39,784 (~39 KB)** |

**Pros:**

- No external origin at runtime (privacy, CSP simplicity, no supply-chain dependency)
- Currently we have NO external origins besides BanRep/Banxico rate APIs
- Full control over caching (`Cache-Control: immutable`)
- font-display: swap prevents FOIT

**Cons:**

- Adds ~39 KB to repo (one-time)
- Must commit OFL license file

**Implementation:**

```scss
@font-face {
  font-family: 'Rubik Mono One';
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url('/fonts/rubik-mono-one-latin.woff2') format('woff2');
  unicode-range: U+0000-00FF, U+0131, U+0152-0153, /* ... */;
}

@font-face {
  font-family: 'Roboto Mono';
  font-style: normal;
  font-weight: 400 700; /* variable font */
  font-display: swap;
  src: url('/fonts/roboto-mono-latin.woff2') format('woff2');
  unicode-range: U+0000-00FF, U+0131, U+0152-0153, /* ... */;
}
```

Preload in index.html:

```html
<link
  rel="preload"
  href="/fonts/rubik-mono-one-latin.woff2"
  as="font"
  type="font/woff2"
  crossorigin
/>
<link rel="preload" href="/fonts/roboto-mono-latin.woff2" as="font" type="font/woff2" crossorigin />
```

##### Option B: Google CDN

**Pros:**

- Zero repo bytes
- Potentially cached from other sites

**Cons:**

- Adds external origin (fonts.googleapis.com, fonts.gstatic.com)
- Privacy concern: Google sees font requests
- CSP must allow these origins
- Runtime dependency on Google availability
- Breaks our "no external origins" baseline (only rate APIs currently)

#### 5.2 CJK Reality

**Verified:** Rubik Mono One has NO CJK coverage.

Google Fonts CSS2 API returns only cyrillic, cyrillic-ext, latin, latin-ext subsets for Rubik Mono
One. No unicode-range includes CJK blocks (U+4E00-9FFF, U+3040-309F, U+30A0-30FF).

**Consequence:** Chinese (中文) and Japanese (日本語) menu labels will NOT render in Rubik Mono One.
They will fall back to the next font in the stack.

**Font stack:**

```scss
--font-family-mobile-menu-heading:
  'Rubik Mono One', 'Noto Sans SC', 'Noto Sans JP', ui-monospace, monospace;
--font-family-mobile-menu-body:
  'Roboto Mono', 'Noto Sans SC', 'Noto Sans JP', ui-monospace, monospace;
```

**Note:** We are NOT bundling Noto Sans CJK (~20+ MB). System fonts or user-installed fonts provide
CJK fallback. This is an inherent limitation of the requested "exact fonts" requirement: Rubik Mono
One simply does not support CJK.

**Surfaced to owner:** This is a FYI, not a blocker. The menu will function; CJK text will render in
a fallback font that may not match the pen's aesthetic exactly.

### 6. E2E Blast-Radius Inventory

#### 6.1 Tests Using 375px Viewport

| File                          | Line(s)               | Interaction              | Adaptation Required                                  |
| ----------------------------- | --------------------- | ------------------------ | ---------------------------------------------------- |
| `currency-conversion.spec.ts` | 239, 245-246, 274-275 | Opens dropdowns directly | YES - must open mobile menu first                    |
| `navbar-controls.spec.ts`     | 255-256               | Asserts controls visible | YES - controls hidden at 375px; must verify via menu |

**Total affected tests:** 2 files, ~5 test cases

#### 6.2 Adaptation Strategy

**Decision:** Shared helper function `openMobileMenuIfNeeded(page)`

```typescript
// e2e/helpers/mobile-menu.ts
export async function openMobileMenuIfNeeded(page: Page): Promise<boolean> {
  const hamburger = page.getByTestId('app-navbar-hamburger')
  if (await hamburger.isVisible()) {
    await hamburger.click()
    await expect(page.getByTestId('app-mobile-menu')).toBeVisible()
    return true
  }
  return false
}

export async function closeMobileMenuIfOpen(page: Page): Promise<void> {
  const menu = page.getByTestId('app-mobile-menu')
  if (await menu.isVisible()) {
    await page.keyboard.press('Escape')
    await expect(menu).not.toBeVisible()
  }
}
```

**Per-test edits:**

- Positioning tests at 375px: prepend `await openMobileMenuIfNeeded(page)`, then interact with menu
  items
- Visibility test at 375px: change assertion from "controls visible" to "hamburger visible +
  controls in menu"

#### 6.3 Desktop Regression Gate

**Requirement:** Desktop tests (default 1280x720) must remain UNTOUCHED.

At 1280px:

- Hamburger is hidden
- Inline controls are visible
- No mobile menu exists
- All existing flows work as-is

**Verification:** `openMobileMenuIfNeeded` returns `false` at desktop widths, so wrapped calls
become no-ops.

### 7. JS Budget Analysis

#### 7.1 Estimated MobileMenu Component Cost

| Item                  | Estimated Raw Bytes | Notes                                       |
| --------------------- | ------------------: | ------------------------------------------- |
| MobileMenu.tsx        |                ~800 | Container, open/close state, focus trap     |
| MobileMenuItem.tsx    |                ~400 | 4 items, similar to dropdown option         |
| MobileMenuSubmenu.tsx |                ~500 | Expansion logic, stagger animation triggers |
| HamburgerButton.tsx   |                ~300 | Simple button, aria attrs                   |
| useFocusTrap.ts       |                ~250 | ~20 lines                                   |
| SCSS (minified)       |              ~1,500 | Animation, positioning                      |
| **Subtotal**          |              ~3,750 |                                             |

#### 7.2 Integration Overhead

| Item                | Estimated Raw Bytes |
| ------------------- | ------------------: |
| Navbar.tsx changes  |                ~200 |
| Mobile menu imports |                ~100 |
| **Subtotal**        |                ~300 |

#### 7.3 Total Estimated JS Growth

**Raw:** ~4,050 bytes (~4 KB) **Gzip (estimated 35% ratio):** ~1,420 bytes (~1.4 KB)

#### 7.4 Current Budget (Rev.6)

| Metric |   Limit | Current | Headroom |
| ------ | ------: | ------: | -------: |
| Raw    | 233,000 | 232,012 |      988 |
| Gzip   |  74,000 |  73,338 |      662 |

#### 7.5 Budget Decision

**Finding:** Estimated growth (~4 KB raw, ~1.4 KB gzip) EXCEEDS current headroom (988 raw, 662
gzip).

**Recommendation:** Rev.7 required.

| Metric       |   Rev.6 | Rev.7 (Proposed) |   Delta |
| ------------ | ------: | ---------------: | ------: |
| Raw limit    |  233 KB |           237 KB |   +4 KB |
| Gzip limit   |   74 KB |          75.5 KB | +1.5 KB |
| Raw warning  |  232 KB |           236 KB |         |
| Gzip warning | 73.5 KB |            75 KB |         |

**Rationale:** MobileMenu is a real feature (~4 KB) with accessibility requirements. No trims
available. Hand-rolled focus trap avoids dependency. Estimate is honest; FE may implement smaller.

### 8. Font Budget (NEW)

Fonts are static assets, not JS bundle. Require new budget rows.

| Asset            | Max Transfer | Notes                     |
| ---------------- | -----------: | ------------------------- |
| Total font woff2 |        45 KB | 39 KB actual + 15% margin |
| Rubik Mono One   |         8 KB | 7 KB actual               |
| Roboto Mono      |        35 KB | 33 KB actual              |

**Preload strategy:**

- Both fonts preloaded in `<head>` for menu
- `font-display: swap` prevents FOIT (text visible immediately in fallback, swaps when loaded)

### 9. Translation Keys (NEW)

```typescript
// TranslationDictionary additions
mobileMenu: {
  openMenu: string // "Open menu" / "Abrir menu" / ...
  closeMenu: string // "Close menu" / "Cerrar menu" / ...
  language: string // "Language" / "Idioma" / ...
  country: string // "Country" / "Pais" / ...
  currency: string // "Currency" / "Moneda" / ...
  theme: string // "Theme" / "Tema" / ...
}
```

## Consequences

### Positive

- Mobile UX dramatically improved (dedicated fullscreen menu vs cramped inline controls)
- Visual fidelity to inspiring pen achieved
- Production-grade accessibility (focus trap, keyboard, screen reader)
- No external font dependencies (self-hosted)
- Desktop experience unchanged (no regression risk)

### Negative

- Bundle size increase (~4 KB JS, ~39 KB fonts)
- CJK font fallback not pixel-perfect to pen
- E2E tests require adaptation for 375px viewport
- Rev.7 budget approval required

### Neutral

- Existing domain logic reused (no duplication)
- Mobile-first architecture preserved (enhancement at 768px+)

## Open Questions (Human Decisions Required)

### Q1: Font Delivery

**Options:**

- **A (Recommended):** Self-host woff2 (~39 KB total transfer, no external origin)
- **B:** Google CDN (0 repo bytes, adds fonts.googleapis.com + fonts.gstatic.com origins)

**Architect recommendation:** Option A. We currently have no external origins besides rate APIs.
Adding Google Fonts creates privacy/CSP/supply-chain surface for a feature that works fine
self-hosted.

### Q2: JS Budget Rev.7

**Proposed:** Raw 237 KB / Gzip 75.5 KB (from 233 KB / 74 KB)

**Rationale:** MobileMenu ~4 KB raw is a real feature. Current headroom 988/662 is insufficient.

### FYI Items (Acknowledgment, Not Decision)

1. **CJK Font Fallback:** Rubik Mono One has no CJK glyphs. Chinese/Japanese menu labels render in
   fallback font. This is an inherent font limitation, not fixable without bundling massive CJK
   fonts.

2. **A11y Deviations from Pen:** The pen's checkbox hack and hover-only patterns are replaced with
   accessible equivalents. Visual output remains identical; interaction mechanism differs.

3. **Touch Hover Adaptation:** Pen's hover-reveal submenus gain tap/focus triggers for touch
   devices.

## References

- CodePen OJLMgYY: docs/architecture/reference/codepen-OJLMgYY-fork-this-nav/
- ADR-0007: Navbar Dropdown Interaction Pattern
- ADR-0009: Theme Mode Button (Tri-State Cycle)
- CONTRACTS.md v3.3.0
- docs/performance/budgets.md rev.6

---

## Amendment 1: Theme-Aware Menu Colors (2026-07-11)

**Status:** Accepted (supersedes Section 1.2 Color Adaptation) **Date:** 2026-07-11 **Trigger:**
User requirement supersession - menu must follow the active theme

### Problem Statement

The original Section 1.2 decision mapped the pen's #18181A palette identically to both light and
dark themes, reasoning that the dark overlay is a "takeover" effect. User feedback (Task 9)
demonstrates this causes:

1. **ITEM 1 (Theme Coherence):** Menu overlay stays dark (#18181A) even in light theme, breaking
   visual consistency
2. **ITEM 2 (X Visibility):** Hamburger/X bars use `--color-text-primary` (light theme: dark gray
   #111827) which is invisible against the #18181A overlay when menu is open

**Root cause:** Both themes have identical menu tokens.

### Supersession

The user explicitly supersedes the "verbatim color fidelity" portion of Section 1.2. The pen palette
becomes the DARK-theme variant only. Light theme gets coherent equivalents.

### Amended Color Tokens

**DARK THEME (pen palette preserved):**

| Token                                | Value                                            | Usage                     |
| ------------------------------------ | ------------------------------------------------ | ------------------------- |
| `--color-mobile-menu-overlay`        | #18181A                                          | Band overlay background   |
| `--color-mobile-menu-text`           | #E5E7EB (gray-200)                               | Item text (light on dark) |
| `--color-mobile-menu-secondary`      | #75757C                                          | Submenu/hover text        |
| `--color-mobile-menu-highlight`      | #F5F5F5                                          | Light-band hover          |
| `--color-mobile-menu-hamburger-bars` | `var(--color-text-primary)` closed, #F5F5F5 open | X must contrast overlay   |

**LIGHT THEME (coherent equivalents):**

| Token                                | Value                                            | Rationale                             |
| ------------------------------------ | ------------------------------------------------ | ------------------------------------- |
| `--color-mobile-menu-overlay`        | #F9FAFB (gray-50)                                | Light equivalent of dark overlay      |
| `--color-mobile-menu-text`           | #111827 (gray-900)                               | Dark on light, readable               |
| `--color-mobile-menu-secondary`      | #6B7280 (gray-500)                               | Muted secondary                       |
| `--color-mobile-menu-highlight`      | #18181A                                          | Dark band on light overlay (inverted) |
| `--color-mobile-menu-hamburger-bars` | `var(--color-text-primary)` closed, #18181A open | X contrasts light overlay             |

### Hamburger/X Contrast Contract

**CRITICAL:** The hamburger bars must ALWAYS contrast their backdrop.

| State  | Backdrop              | Light Theme Bars                          | Dark Theme Bars                           |
| ------ | --------------------- | ----------------------------------------- | ----------------------------------------- |
| Closed | Navbar (page surface) | `--color-text-primary` (#111827)          | `--color-text-primary` (#F9FAFB)          |
| Open   | Menu overlay          | `--color-mobile-menu-highlight` (#18181A) | `--color-mobile-menu-highlight` (#F5F5F5) |

**Implementation:**

```scss
// HamburgerButton.module.scss
.bars::before,
.bars::after {
  background-color: var(--color-text-primary);
}

.open .bars::before,
.open .bars::after {
  background-color: var(--color-mobile-menu-highlight);
}
```

### Visual Language Preservation

The pen's visual language is preserved across both themes:

1. **Band contrast:** Light text on dark overlay (dark theme) OR dark text on light overlay (light
   theme)
2. **Dim/pull opacities:** Unchanged (0.25 dim, 30% pull)
3. **Motion timing:** Unchanged (--td 150ms, --te cubic-bezier)
4. **Typography:** Unchanged (Rubik Mono One 10vmin, Roboto Mono 3.5vmin)
5. **Highlight inversion:** Light-band becomes dark-band on light theme for equivalent contrast

### Items NOT Changed (Motion/Typography Fidelity)

Per original Section 1.1, these remain identical to the pen:

- Band-slide overlay animation
- Stagger timing
- Hamburger 1turn spin
- Font sizes
- Sibling pull/dim effects
- Light-band hover (now theme-aware color)
- Blink caret

### SCSS Implementation

**\_light.scss:**

```scss
// Mobile menu colors (ADR-0012 Amendment 1: theme-coherent)
--color-mobile-menu-overlay: #{p.$palette-gray-50};
--color-mobile-menu-text: #{p.$palette-gray-900};
--color-mobile-menu-secondary: #{p.$palette-gray-500};
--color-mobile-menu-highlight: #18181a;
```

**\_dark.scss:**

```scss
// Mobile menu colors (ADR-0012: CodePen OJLMgYY palette preserved)
--color-mobile-menu-overlay: #18181a;
--color-mobile-menu-text: #{p.$palette-gray-200};
--color-mobile-menu-secondary: #75757c;
--color-mobile-menu-highlight: #f5f5f5;
```

### Test Requirements

- E2E computed color assertions for menu overlay in BOTH themes
- E2E contrast check: X bars visible against overlay in BOTH themes
- Visual regression: light theme menu matches design intent

---

## Amendment 2: Menu Scroll and Resize Contracts (2026-07-11)

**Status:** Accepted **Date:** 2026-07-11 **Trigger:** Task 9 items 4 and 5

### Item 4: Menu Scroll Contract

**Problem:** Overlay has `overflow-y: visible` (fixed positioning). Content exceeding viewport
(landscape 667x375, 320px devices, font scaling) clips unreachable.

**Solution:**

```scss
.menu {
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;

  // Scrollbar styling consistent with DS
  &::-webkit-scrollbar {
    width: var(--scrollbar-width, 8px);
  }
  &::-webkit-scrollbar-track {
    background: var(--color-surface-overlay);
  }
  &::-webkit-scrollbar-thumb {
    background: var(--color-border-default);
    border-radius: var(--radius-sm);
  }
}
```

**Focus-visible scroll:** When focus moves to an item via keyboard navigation, ensure it scrolls
into view:

```typescript
// In MobileMenuItem or useFocusTrap
element.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
```

**E2E verification:**

- Test at 667x375 (landscape phone)
- Test at 320x480 (small height)
- Assert all items reachable via Tab

### Item 5: Menu Close on Breakpoint Cross

**Problem:** Resizing from mobile to desktop with menu open orphans the overlay, leaks scroll lock,
and renders app unusable.

**Solution:** Close menu when viewport crosses the hamburger/inline breakpoint (768px).

**Implementation:**

```typescript
// In MobileMenu or Navbar
useEffect(() => {
  const mql = window.matchMedia('(min-width: 768px)')

  const handleChange = (e: MediaQueryListEvent) => {
    if (e.matches && isOpen) {
      // Crossed to desktop - close menu via existing close path
      onClose()
    }
  }

  mql.addEventListener('change', handleChange)
  return () => mql.removeEventListener('change', handleChange)
}, [isOpen, onClose])
```

**Requirements:**

1. Use matchMedia change listener, NOT resize event polling
2. Trigger the EXISTING close path (task-8 UX-001): immediate aria/focus + deferred visual hide +
   scroll-lock release
3. Focus destination after auto-close: the inline controls container (first dropdown trigger) or
   body if nothing focusable

**Focus destination rationale:** After auto-close, user is on desktop. Inline controls are now
visible. Moving focus to the first inline control (LanguageDropdown trigger) is sensible. If no
inline controls exist (edge case), focus body.

**E2E verification:**

- Open menu at 375px
- Resize to 1024px
- Assert: menu closed, scroll unlocked, focus on inline control, no orphaned overlay
