# ADR-0007: Navbar Dropdown Interaction Pattern (Supersession)

- **Status:** Accepted
- **Date:** 2026-07-09
- **Deciders:** Architect Agent (per user requirement correction)
- **Supersedes:** CONTRACTS.md v2.0.0 Section 7 (Cycle-on-Click Pattern)

## Context

### User Requirement Correction (2026-07-09)

The user explicitly corrected the task-1 design decision (verbatim):

> "The actual action you had to take was to ensure that the dropdown buttons in the navbar are
> mandatory, not text, including language, dark mode, country, and currency (if they exist). They
> cannot be simple buttons."

Additional requirements from the same session:

> "Pop-ups in dropdown menus must include icons to accompany the text."

> "If there are buttons or links in the navbar or anywhere else on the site that lead to another
> page or action, they must function correctly. Nothing can be decorative."

> "The design system must be 100% mobile-first."

### What is Rejected

The cycle-on-click icon button pattern implemented in task-1:

- `LanguageCycleButton` - single-click cycles through locales
- `ThemeModeToggle` - single-click toggles light/dark
- `CountryCycleButton` - single-click cycles through regions

**These components must be DELETED (dead code prohibition per DEF-002 precedent).** Their behavioral
test intent is ported to the replacement dropdown components.

### Why Dropdowns

1. **Discoverability**: Users can see all options before selecting (critical for 4+ regions).
2. **Error recovery**: User can cancel without changing state (impossible with cycle pattern).
3. **Currency addition**: A fourth control (CurrencyDropdown) is now in scope; cycling through 4
   currencies without seeing them is poor UX.
4. **User mandate**: The requirement is explicit and non-negotiable.

## Decision

Implement **icon-triggered dropdowns** following WAI-ARIA Authoring Practices Guide (APG) Listbox
pattern with custom popup rendering.

### Why Not Native `<select>`

1. Cannot render icons inside `<option>` elements.
2. Trigger must be icon-only (react-icons), not text.
3. Styling limitations on dropdown panel.

### Accessibility Pattern: Listbox with Popup

Each dropdown consists of:

1. **Trigger Button**: Icon-only `<button>` with required ARIA attributes.
2. **Popup Panel**: `<div role="listbox">` containing options.
3. **Options**: `<div role="option">` with icon + localized text.

### ARIA Attributes

**Trigger Button:**

| Attribute       | Value                                         |
| --------------- | --------------------------------------------- |
| `role`          | implicit `button` (semantic element)          |
| `aria-haspopup` | `"listbox"`                                   |
| `aria-expanded` | `"true"` when open, `"false"` when closed     |
| `aria-label`    | Localized, e.g., "Language, current: English" |
| `aria-controls` | ID of the listbox element                     |

**Popup Panel:**

| Attribute         | Value                                                     |
| ----------------- | --------------------------------------------------------- |
| `role`            | `"listbox"`                                               |
| `id`              | Referenced by trigger's `aria-controls`                   |
| `aria-labelledby` | ID of the trigger button                                  |
| `tabindex`        | `-1` (not directly tabbable; managed via roving tabindex) |

**Options:**

| Attribute       | Value                                               |
| --------------- | --------------------------------------------------- |
| `role`          | `"option"`                                          |
| `id`            | Unique, e.g., `lang-option-en`                      |
| `aria-selected` | `"true"` for current selection, `"false"` otherwise |
| `tabindex`      | `0` for focused option, `-1` for others (roving)    |

### Focus Management: Roving Tabindex

**Decision:** Use roving tabindex, not `aria-activedescendant`.

**Rationale:**

1. **Compatibility**: Roving tabindex has broader screen reader support than
   `aria-activedescendant`, especially on mobile.
2. **Simplicity**: Focus follows the DOM focus, so `document.activeElement` always reflects the
   visually focused option.
3. **Debugging**: Easier to inspect (focus ring is on the actual focused element).

**Implementation:**

- On open: Focus moves to the currently selected option (or first if none).
- Arrow Down: Moves focus to next option (wraps to first).
- Arrow Up: Moves focus to previous option (wraps to last).
- Home: Moves focus to first option.
- End: Moves focus to last option.
- Only the focused option has `tabindex="0"`; all others have `tabindex="-1"`.

### Keyboard Contract

| Key           | Action                                                                        |
| ------------- | ----------------------------------------------------------------------------- |
| Enter / Space | If closed: open and focus selected option. If open: select focused and close. |
| Arrow Down    | If closed: open. If open: move focus down (wrap).                             |
| Arrow Up      | If closed: open. If open: move focus up (wrap).                               |
| Home          | If open: move focus to first option.                                          |
| End           | If open: move focus to last option.                                           |
| Escape        | Close and return focus to trigger.                                            |
| Tab           | Close (selection unchanged) and move to next focusable.                       |
| Typeahead     | **Not implemented** (2-4 options; typeahead not needed).                      |

### Pointer Contract

| Action        | Result                                         |
| ------------- | ---------------------------------------------- |
| Click trigger | Toggle open/close.                             |
| Click option  | Select option, close, return focus to trigger. |
| Click outside | Close without selection.                       |

### Selection Announcement

On selection, the existing `Announcer` component announces:

```
"{settingType} changed to {newValue}"
```

Example: "Language changed to Spanish"

This is already implemented via the `languageAnnouncementSignal`, `themeAnnouncementSignal`,
`countryAnnouncementSignal` pattern. A new `currencyAnnouncementSignal` is added for currency.

### Open/Close Animation

Use design system `tools/_animation.scss` mixins:

```scss
@include transition(opacity, transform);
```

Animation respects `prefers-reduced-motion: reduce` (handled by the mixin).

- Open: Opacity 0 -> 1, transform translateY(-8px) -> 0.
- Close: Instant (no delay on hide to avoid trapping focus in disappearing element).

### Mobile Behavior

**Panel sizing:**

- Min-width: 160px (or width of trigger, whichever is larger).
- Max-width: 90vw.
- Max-height: 70vh (with overflow-y: auto if needed).

**Positioning:**

- Absolute, relative to trigger.
- Prefer below trigger; flip above if insufficient viewport space.
- Left-align by default; flip to right-align if overflowing viewport right edge.

**Touch targets:**

- Each option: min-height 48px (>44px minimum).
- Padding: 12px 16px.

**Z-index:** Use `$z-dropdown` (100) from `settings/_z-index.scss`.

### Component Structure

**Generic DS Component:**

```
src/shared/components/Dropdown/
  Dropdown.tsx          # Generic container managing open/close/focus
  DropdownTrigger.tsx   # Icon button trigger (uses IconButton internally)
  DropdownPanel.tsx     # Popup listbox container
  DropdownOption.tsx    # Single option (icon + text)
  Dropdown.module.scss
  Dropdown.spec.tsx
  interfaces.ts
  index.ts
```

**Feature Wrappers (thin, no business logic duplication):**

```
src/features/navbar/components/
  LanguageDropdown/
    LanguageDropdown.tsx
    LanguageDropdown.spec.tsx
    interfaces.ts
    index.ts
  ThemeDropdown/
    ThemeDropdown.tsx
    ThemeDropdown.spec.tsx
    interfaces.ts
    index.ts
  CountryDropdown/
    CountryDropdown.tsx
    CountryDropdown.spec.tsx
    interfaces.ts
    index.ts
  CurrencyDropdown/         # NEW
    CurrencyDropdown.tsx
    CurrencyDropdown.spec.tsx
    interfaces.ts
    index.ts
```

### Deprecated Components (TO BE DELETED)

The following must be deleted (not renamed, not kept as dead code):

- `src/features/navbar/components/LanguageCycleButton/` (entire directory)
- `src/features/navbar/components/ThemeModeToggle/` (entire directory)
- `src/features/navbar/components/CountryCycleButton/` (entire directory)

Test intent from these components is ported to the new dropdown specs.

## Consequences

### Positive

- **Meets user requirement** exactly as stated.
- **Better discoverability** for users (see all options before choosing).
- **Supports currency** without UX compromise.
- **Accessible** per WAI-ARIA APG.
- **Mobile-friendly** with proper touch targets and viewport-aware positioning.

### Negative

- **More code** than cycle buttons (~40% more JS, ~60% more SCSS).
- **Higher complexity** (focus management, outside-click detection, positioning).
- **Bundle size** increase (~2-3KB gzipped estimate; within revised budget).

### Neutral

- Existing `Announcer` and announcement signals reused (minimal new infrastructure).
- Z-index scale already has `$z-dropdown` defined.
- Mobile-first responsive mixins already exist.

## References

- [WAI-ARIA APG Listbox Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/listbox/)
- [WAI-ARIA APG Combobox Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/) (for popup
  positioning guidance)
- ADR-0005: Design System Architecture (ITCSS layers, tokens)
- ADR-0006: Theming Architecture (signals pattern)
- CONTRACTS.md v2.0.0 (superseded Section 7)
