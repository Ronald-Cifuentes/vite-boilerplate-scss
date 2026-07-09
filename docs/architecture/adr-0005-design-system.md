# ADR-0005: Design System Architecture

- **Status:** Accepted
- **Date:** 2026-07-09
- **Deciders:** Architect Agent

## Context

The project requires a complete, highly reusable SCSS-based design system that:

1. Is demonstrably better than Atomic Design for this codebase
2. Globalizes all system colors through a theme contract
3. Ensures everything is 100% functional (no decorative-only elements)
4. Provides mobile-first, accessible UI components
5. Enforces no hardcoded values (all via tokens)
6. Follows the existing Scream + Clean + Hexagonal + DDD architecture

### Problems with Atomic Design for this Codebase

1. **Classification ambiguity**: The atoms/molecules/organisms hierarchy creates subjective debates
   about where components belong, leading to inconsistent placement
2. **Forced granularity**: Atoms (e.g., a single color) have no standalone use in a React component
   model where the smallest unit is already a component
3. **No clear dependency direction**: Atomic Design does not prescribe import rules, allowing
   molecules to import from organisms
4. **Theming afterthought**: Atomic Design has no native concept of design tokens or theme contracts
5. **Over-abstraction**: For a focused boilerplate with ~10-20 components, five abstraction levels
   (atoms, molecules, organisms, templates, pages) create unnecessary cognitive overhead

## Decision

Adopt a **Layered Token-First Design System (LTDS)** combining:

1. **ITCSS Layering** (Inverted Triangle CSS) for specificity management
2. **Design Tokens** as the single source of truth for all design decisions
3. **CUBE CSS Composition** principles for utility + block patterns
4. **Hexagonal separation** of style concerns from component logic

### Layer Definitions (ITCSS-Based)

The SCSS architecture follows a strict specificity pyramid from most generic to most specific:

```
Layer 0: Settings    (tokens, variables - no CSS output)
Layer 1: Tools       (mixins, functions - no CSS output)
Layer 2: Generic     (resets, normalize - element selectors only)
Layer 3: Elements    (base HTML elements - element selectors only)
Layer 4: Objects     (layout patterns - class selectors, reusable structures)
Layer 5: Components  (UI components - BEM class selectors)
Layer 6: Utilities   (single-purpose overrides - !important allowed only here)
```

### Dependency Direction Rules (Clean Architecture for Styles)

```
[Utilities] --> [Components] --> [Objects] --> [Elements] --> [Generic]
      |              |              |              |              |
      v              v              v              v              v
   [Tools/Settings] <-- All layers may import; none export CSS
```

**Rules enforced by arch test:**

1. Settings/Tools export only Sass variables, mixins, functions - zero CSS output
2. Lower layers NEVER import from higher layers (Elements cannot import from Components)
3. Components import from Objects, not vice versa
4. Only Utilities may use `!important`
5. Components MUST use CSS custom properties from Settings, never raw values

### SCSS File Layout

```
src/
  shared/
    ds/                              # Design System root
      settings/                      # Layer 0: Tokens (no CSS output)
        _tokens.scss                 # All design tokens as Sass variables
        _breakpoints.scss            # Responsive breakpoint definitions
        _z-index.scss                # Z-index scale
        _index.scss                  # Forward all settings
      tools/                         # Layer 1: Mixins/Functions (no CSS output)
        _responsive.scss             # Media query mixins
        _typography.scss             # Font mixins
        _accessibility.scss          # a11y mixins (sr-only, focus-visible)
        _animation.scss              # Animation/transition mixins
        _index.scss                  # Forward all tools
      generic/                       # Layer 2: Resets
        _reset.scss                  # CSS reset/normalize
        _index.scss
      elements/                      # Layer 3: Base HTML
        _typography.scss             # body, h1-h6, p, a defaults
        _forms.scss                  # input, button, select defaults
        _index.scss
      objects/                       # Layer 4: Layout patterns
        _container.scss              # .o-container
        _grid.scss                   # .o-grid
        _stack.scss                  # .o-stack (vertical rhythm)
        _cluster.scss                # .o-cluster (horizontal grouping)
        _index.scss
      components/                    # Layer 5: UI components (imported by React)
        _button.scss                 # .c-button (shared styles, not module)
        _icon-button.scss            # .c-icon-button
        _link.scss                   # .c-link
        _navbar.scss                 # .c-navbar
        _index.scss
      utilities/                     # Layer 6: Utility overrides
        _spacing.scss                # .u-mt-* .u-mb-* etc
        _visibility.scss             # .u-sr-only .u-hidden
        _index.scss
      _all.scss                      # Master import (layers in order)
      themes/                        # Theme CSS custom property definitions
        _light.scss                  # Light mode token values
        _dark.scss                   # Dark mode token values
        _contract.scss               # Theme contract (required properties)
        _index.scss
```

### Naming Conventions (BEM + ITCSS Namespaces)

| Namespace | Layer      | Example         | Purpose                |
| --------- | ---------- | --------------- | ---------------------- |
| (none)    | Settings   | `$token-*`      | Sass variables         |
| (none)    | Tools      | `@mixin name`   | Sass mixins            |
| (none)    | Generic    | `*, html, body` | Element selectors only |
| (none)    | Elements   | `h1, p, a`      | Element selectors only |
| `o-`      | Objects    | `.o-container`  | Structural layout      |
| `c-`      | Components | `.c-button`     | UI components          |
| `u-`      | Utilities  | `.u-sr-only`    | Single-purpose helpers |

**BEM within components:**

```scss
.c-button {
  // Block
  &__icon {
  } // Element
  &--primary {
  } // Modifier
  &--disabled {
  } // Modifier
}
```

### Token Consumption (CSS Custom Properties)

Components MUST consume tokens via CSS custom properties, never raw values:

```scss
// WRONG - hardcoded value
.c-button {
  background-color: #3b82f6;
}

// WRONG - Sass variable direct use (can't be themed at runtime)
.c-button {
  background-color: $color-primary;
}

// CORRECT - CSS custom property (themeable at runtime)
.c-button {
  background-color: var(--color-primary);
}
```

**Exception:** Breakpoint values in media queries (Sass variables required for `@media`).

### Why This Beats Atomic Design (Concrete Criteria)

| Criterion            | Atomic Design                             | LTDS (This Design)                          |
| -------------------- | ----------------------------------------- | ------------------------------------------- |
| **Reusability**      | Subjective hierarchy leads to duplication | Clear layers with explicit import rules     |
| **Specificity Mgmt** | No built-in model; wars common            | ITCSS inverted triangle guarantees cascade  |
| **Theming**          | Retrofitted; no contract                  | Tokens are Layer 0; theme contract enforced |
| **Testability**      | Components tightly coupled to atoms       | Components depend only on tokens (mockable) |
| **Cognitive Load**   | 5 levels (atom/mol/org/temp/page)         | 7 layers but deterministic placement        |
| **Mobile-first**     | Not prescribed                            | Breakpoint tokens + responsive mixins       |
| **A11y**             | Not prescribed                            | Dedicated tools layer with a11y mixins      |

### Integration with Existing Architecture

The design system follows the same hexagonal pattern as i18n:

```
[React Components] --> [useTheme hook] --> [ThemeProvider] --> [Theme Port]
                                                                     ^
                                                                     |
                                                              [LocalStorage Adapter]
```

- **Port:** `src/theme/ports/ThemeProvider.ts` - interface for theme state
- **Adapter:** `src/theme/adapters/ThemeProvider.tsx` - React implementation with signals
- **Tokens:** `src/shared/ds/settings/_tokens.scss` - all design decisions
- **Components:** `src/shared/ds/components/` - shared component styles (consumed via CSS Modules)

## Consequences

### Positive

- **Specificity control**: ITCSS layers prevent cascade wars; each layer has known specificity
- **Themeable**: All visual decisions flow through CSS custom properties
- **Testable**: Arch tests can verify layer boundaries and token usage
- **Scalable**: Adding components follows clear placement rules
- **Mobile-first**: Breakpoint tokens + mixins enforce responsive patterns
- **Accessible**: Dedicated a11y mixins (sr-only, focus-visible) encourage consistent patterns

### Negative

- More directories than a flat structure
- Developers must understand the layering model
- Initial setup requires migration of existing `main.scss` hardcoded values

### Neutral

- CSS Modules continue to be used for component scoping; the design system provides base styles
  imported into modules
- The `src/shared/ds/_all.scss` must be imported once in `main.scss` to output global styles

## Migration from Current State

| Current                              | Target                                                  |
| ------------------------------------ | ------------------------------------------------------- |
| `src/main.scss` (8 lines, hardcoded) | Import `src/shared/ds/_all.scss`; tokens replace values |
| No design system                     | `src/shared/ds/` with full ITCSS structure              |
| `color-scheme: dark` hardcoded       | Theme provider with data-theme attribute                |
| `font-family` hardcoded              | `var(--font-family-base)` from tokens                   |

## Arch Test Rules (to be added to `architecture.spec.ts`)

1. **No hardcoded colors in `.scss` files** - regex test for hex/rgb/hsl without `var(`
2. **Layer import direction** - settings/tools imported everywhere; higher layers never import lower
3. **No `!important` outside utilities** - regex test for `!important` in non-utility files
4. **Components use `c-` prefix** - class naming validation
5. **Tokens file has no CSS output** - verify settings files contain only variables

## References

- ADR-0001: Architecture Style (hexagonal pattern to follow)
- ADR-0002: i18n Design (signals pattern to follow)
- [ITCSS by Harry Roberts](https://www.xfive.co/blog/itcss-scalable-maintainable-css-architecture/)
- [CUBE CSS by Andy Bell](https://cube.fyi/)
- [Design Tokens W3C Community Group](https://design-tokens.github.io/community-group/format/)
