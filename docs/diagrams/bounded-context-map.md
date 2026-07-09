# Bounded Context Map

## Overview

This document maps the bounded contexts (domains) in the Vite Boilerplate SCSS frontend application
and their relationships.

## Bounded Contexts

```
+-----------------------------------------------------------------------------------+
|                                                                                    |
|                              FRONTEND APPLICATION                                  |
|                                                                                    |
|  +------------------+     +------------------+     +------------------+            |
|  |                  |     |                  |     |                  |            |
|  |   i18n Context   |     |  Theme Context   |     |  Region Context  |            |
|  |                  |     |                  |     |                  |            |
|  |  Ubiquitous Lang:|     |  Ubiquitous Lang:|     |  Ubiquitous Lang:|            |
|  |  - Locale        |     |  - Mode          |     |  - Region        |            |
|  |  - Translation   |     |  - Light/Dark    |     |  - Country       |            |
|  |  - Dictionary    |     |  - Theme         |     |  - Currency      |            |
|  |  - t() function  |     |  - Toggle        |     |  - DateLocale    |            |
|  |                  |     |                  |     |  - NumberLocale  |            |
|  +--------+---------+     +--------+---------+     +--------+---------+            |
|           |                        |                        |                      |
|           |    CONFORMIST          |    CONFORMIST          |                      |
|           |                        |                        |                      |
|           v                        v                        v                      |
|  +-------------------------------------------------------------------------+      |
|  |                                                                          |      |
|  |                         Features Context                                 |      |
|  |                                                                          |      |
|  |  Ubiquitous Language:                                                    |      |
|  |  - Greeting (displays translated, formatted content)                     |      |
|  |  - Navbar (contains control buttons)                                     |      |
|  |  - LanguageCycleButton, ThemeModeToggle, CountryCycleButton             |      |
|  |                                                                          |      |
|  +-------------------------------------------------------------------------+      |
|           |                                                                        |
|           |    CONFORMIST                                                          |
|           |                                                                        |
|           v                                                                        |
|  +-------------------------------------------------------------------------+      |
|  |                                                                          |      |
|  |                      Design System Context                               |      |
|  |                                                                          |      |
|  |  Ubiquitous Language:                                                    |      |
|  |  - Token (design decision as a variable)                                 |      |
|  |  - Semantic Token (purpose-driven, e.g., color-surface-base)            |      |
|  |  - Primitive (raw value, e.g., palette-blue-500)                        |      |
|  |  - Layer (ITCSS specificity level)                                       |      |
|  |  - Component Style (c-button, c-icon-button)                            |      |
|  |  - Object (o-container, o-stack)                                         |      |
|  |  - Utility (u-sr-only, u-hidden)                                         |      |
|  |                                                                          |      |
|  +-------------------------------------------------------------------------+      |
|                                                                                    |
+-----------------------------------------------------------------------------------+
```

## Context Relationships

### 1. i18n Context (Upstream)

**Responsibility:** Manages application language, translations, and locale-aware text rendering.

**Exports:**

- `useTranslation` hook
- `Translator` port interface
- `SupportedLocale` type
- Translation dictionaries (en, es)

**Relationship to Features:** CONFORMIST - Features consume the i18n API as-is without modification.

### 2. Theme Context (Upstream)

**Responsibility:** Manages light/dark mode, CSS custom property theming, and user preference
persistence.

**Exports:**

- `useTheme` hook
- `ThemePort` interface
- `ThemeMode` type
- Theme CSS custom properties via `data-theme` attribute

**Relationship to Features:** CONFORMIST - Features consume theme state and toggle functionality
as-is.

### 3. Region Context (Upstream)

**Responsibility:** Manages regional settings for date, number, and currency formatting using Intl
APIs.

**Exports:**

- `useRegion` hook
- `RegionPort` interface
- `SupportedRegion` type
- Formatting functions (formatDate, formatNumber, formatCurrency)

**Relationship to Features:** CONFORMIST - Features consume region formatting as-is.

### 4. Features Context (Downstream)

**Responsibility:** Business features that compose domain capabilities into user-facing
functionality.

**Contains:**

- Greeting feature (displays translated, formatted content)
- Navbar feature (language/theme/country controls)

**Consumes from:**

- i18n Context (translations)
- Theme Context (mode state)
- Region Context (formatting)
- Design System Context (visual styling)

### 5. Design System Context (Infrastructure)

**Responsibility:** Provides visual foundation - tokens, components, layouts, and utilities.

**Exports:**

- SCSS tokens and mixins
- CSS custom properties (themed)
- Shared React components (Button, IconButton, Link)
- Layout objects (container, stack, grid)

**Relationship to all contexts:** SHARED KERNEL - All contexts depend on design system tokens for
consistent visual output.

## Anti-Corruption Layers

No ACLs are needed in this architecture because:

1. All contexts are part of the same bounded system (single frontend app)
2. Upstream contexts expose clean ports (interfaces)
3. Downstream contexts consume via hooks (dependency inversion)
4. No external third-party domain models to translate

## Context Integration Points

| Consumer            | Provider      | Integration                    |
| ------------------- | ------------- | ------------------------------ |
| LanguageCycleButton | i18n          | `useTranslation().setLocale()` |
| ThemeModeToggle     | Theme         | `useTheme().toggle()`          |
| CountryCycleButton  | Region        | `useRegion().cycleRegion()`    |
| Greeting            | i18n          | `useTranslation().t()`         |
| Greeting            | Region        | `useRegion().formatDate()`     |
| All Components      | Design System | CSS custom properties          |
| All Features        | Design System | Shared components              |

## Domain Events (Signal Changes)

| Domain | Signal         | Side Effects                                 |
| ------ | -------------- | -------------------------------------------- |
| i18n   | `localeSignal` | `<html lang>` sync, localStorage persist     |
| Theme  | `themeSignal`  | `data-theme` attr sync, localStorage persist |
| Region | `regionSignal` | localStorage persist                         |

## Aggregate Roots

Each domain has a single aggregate root (the signal) that maintains consistency:

- **i18n:** `localeSignal` - all translation lookups derive from this
- **Theme:** `themeSignal` - all theme CSS custom properties derive from this
- **Region:** `regionSignal` - all Intl formatting derives from this

## Strategic Design Patterns Used

| Pattern                | Application                                          |
| ---------------------- | ---------------------------------------------------- |
| **Conformist**         | Features conform to domain APIs without modification |
| **Shared Kernel**      | Design System tokens shared by all contexts          |
| **Published Language** | TypeScript interfaces define domain contracts        |
| **Ports & Adapters**   | Each domain exposes ports, implements adapters       |
