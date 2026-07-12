# ADR-0013: Responsive Breakpoint Scale

- **Status:** Accepted
- **Date:** 2026-07-11
- **Deciders:** Architect Agent
- **References:** ADR-0012 (Mobile Menu Breakpoint), Industry research (Tailwind, Bootstrap, MUI)

## Context

### Current State

The project has a single breakpoint definition in `src/shared/ds/settings/_breakpoints.scss`:

```scss
$breakpoint-sm: 375px; // Mobile
$breakpoint-md: 768px; // Tablet
$breakpoint-lg: 1024px; // Desktop
$breakpoint-xl: 1280px; // Large desktop
$breakpoint-2xl: 1440px; // Extra large
```

Only `$breakpoint-md` (768px) is actively used:

- ADR-0012 defines hamburger/inline switch at 768px
- No other media queries exist in the codebase

### User Requirement

Adopt industry-standard breakpoints with research backing.

### Industry Research (Verifiable References)

#### Tailwind CSS v3 Default Screens

Source: https://tailwindcss.com/docs/responsive-design

| Name | Width  |
| ---- | ------ |
| sm   | 640px  |
| md   | 768px  |
| lg   | 1024px |
| xl   | 1280px |
| 2xl  | 1536px |

#### Bootstrap 5 Breakpoints

Source: https://getbootstrap.com/docs/5.3/layout/breakpoints/

| Name | Width  |
| ---- | ------ |
| sm   | 576px  |
| md   | 768px  |
| lg   | 992px  |
| xl   | 1200px |
| xxl  | 1400px |

#### Material UI (MUI) v5 Breakpoints

Source: https://mui.com/material-ui/customization/breakpoints/

| Name | Width  |
| ---- | ------ |
| xs   | 0px    |
| sm   | 600px  |
| md   | 900px  |
| lg   | 1200px |
| xl   | 1536px |

### Device Width Realities (2024-2026)

- iPhone SE: 375px (smallest supported modern phone)
- iPhone 14/15: 390px
- iPhone Pro Max: 430px
- Common Android: 360px-412px
- iPad Mini: 744px
- iPad: 820px
- iPad Pro 12.9": 1024px (portrait)
- Common laptop: 1366px-1440px
- Desktop monitors: 1920px+

### Analysis

1. **768px is universally agreed** as the tablet/desktop split (Tailwind, Bootstrap, MUI all agree
   within ±32px).

2. **sm diverges**: Tailwind 640px, Bootstrap 576px, MUI 600px. Our 375px is too small (that's
   device width, not a meaningful breakpoint).

3. **lg/xl diverge**: Tailwind 1024/1280, Bootstrap 992/1200, MUI 1200/1536.

4. **Mobile-first mandate**: All frameworks use min-width queries exclusively.

## Decision

### 1. Adopt Tailwind-Aligned Scale

Tailwind's scale is the most widely adopted in modern frontend development and aligns well with
device realities.

**New `_breakpoints.scss`:**

```scss
// ==========================================================================
// BREAKPOINTS - Responsive Breakpoint Definitions (NO CSS OUTPUT)
// ==========================================================================
// Mobile-first breakpoints. Use via mixins in tools layer.
// Aligned with Tailwind CSS v3 defaults for industry consistency.
// ==========================================================================

$breakpoint-sm: 640px; // Large phones / small tablets
$breakpoint-md: 768px; // Tablet / hamburger->inline switch
$breakpoint-lg: 1024px; // Desktop
$breakpoint-xl: 1280px; // Large desktop
$breakpoint-2xl: 1536px; // Extra large / 4K scaled

// Map for programmatic access
$breakpoints: (
  'sm': $breakpoint-sm,
  'md': $breakpoint-md,
  'lg': $breakpoint-lg,
  'xl': $breakpoint-xl,
  '2xl': $breakpoint-2xl,
);

// Semantic aliases for common use cases
$breakpoint-mobile-menu-switch: $breakpoint-md; // 768px: hamburger <-> inline
```

### 2. Migration

| Token | Old Value | New Value | Impact            |
| ----- | --------- | --------- | ----------------- |
| sm    | 375px     | 640px     | None (was unused) |
| md    | 768px     | 768px     | **No change**     |
| lg    | 1024px    | 1024px    | No change         |
| xl    | 1280px    | 1280px    | No change         |
| 2xl   | 1440px    | 1536px    | None (was unused) |

**Active queries:**

- `@include media-md` (hamburger switch): **unchanged at 768px**

### 3. Hamburger/Inline Switch

**Location:** `$breakpoint-md` (768px) - per ADR-0012, unchanged.

**Rationale:** 768px is the consensus tablet breakpoint. Below this, 4 controls do not fit inline.
Above this, sufficient horizontal space exists.

### 4. E2E Viewport Matrix

**Current matrix (task 7):**

- 375px (mobile)
- 768px (tablet)
- 1280px (desktop)

**Proposed expanded matrix:**

| Viewport         | Width  | Rationale                         |
| ---------------- | ------ | --------------------------------- |
| mobile-xs        | 320px  | Legacy small phones, extreme edge |
| mobile           | 375px  | Standard modern phone (iPhone SE) |
| mobile-landscape | 667px  | Landscape phone (667x375)         |
| tablet           | 768px  | Breakpoint boundary               |
| desktop          | 1024px | Standard desktop                  |
| desktop-lg       | 1280px | Large desktop                     |
| desktop-xl       | 1536px | 4K scaled                         |

**Active test viewports:**

- **375px**: Mobile tests, hamburger visible
- **640px**: Mobile tests with more space (optional)
- **768px**: Breakpoint boundary tests
- **1024px**: Desktop tests
- **1280px**: Large desktop (existing default)

### 5. No max-width Queries

Per constitution mandate, mobile-first is enforced. The arch test `mobile-first.spec.ts` already
verifies no `@media (max-width` queries exist.

## Consequences

### Positive

- Industry-aligned breakpoint scale (Tailwind compatibility)
- Research-backed decisions documented
- No breaking changes (active queries use unchanged 768px)
- Clear semantic alias for hamburger switch

### Negative

- None (migration is non-breaking)

### Neutral

- E2E matrix expansion is optional (recommend for thoroughness)

## Implementation Notes

The `$breakpoint-sm` change from 375px to 640px has NO impact because:

1. No code currently uses `@include media-sm`
2. 375px was the viewport test size, not a breakpoint
3. Breakpoints define enhancement thresholds, not device widths

## References

- Tailwind CSS Responsive Design: https://tailwindcss.com/docs/responsive-design
- Bootstrap 5 Breakpoints: https://getbootstrap.com/docs/5.3/layout/breakpoints/
- MUI Breakpoints: https://mui.com/material-ui/customization/breakpoints/
- ADR-0012: Responsive Navbar with Fullscreen Mobile Menu
