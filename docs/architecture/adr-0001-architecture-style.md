# ADR-0001: Architecture Style

- **Status:** Accepted
- **Date:** 2026-06-29
- **Deciders:** Architect Agent

## Context

This React 19 + Vite 8 + TypeScript 6 frontend boilerplate must evolve from a minimal "renders Hi"
state to a production-grade, internationalized starter. The project constitution mandates:

- SOLID principles
- Scream Architecture + Clean Architecture + Hexagonal Architecture + DDD
- Folder-by-feature structure
- Mobile-first, accessible UI
- 100% test coverage
- No new runtime dependencies (package.json locked)

## Decision

We adopt a layered architecture combining:

1. **Scream Architecture** - Top-level `src/` folders name business domains/features, not framework
   concerns
2. **Clean Architecture** - Dependencies point inward; domain/ports have no external dependencies
3. **Hexagonal Architecture (Ports & Adapters)** - Business logic accessed via ports (interfaces);
   adapters implement those ports
4. **Folder-by-Feature** - Each feature is self-contained with its components, hooks, tests, styles

### Target `src/` Tree

```
src/
  features/                    # SCREAMS the business domains
    greeting/                  # Feature: greeting display
      components/
        Greeting/
          Greeting.tsx
          Greeting.module.scss
          Greeting.spec.tsx
          interfaces.ts
          index.ts
      index.ts                 # Feature barrel export
    language-selector/         # Feature: language switching UI
      components/
        LanguageSelector/
          LanguageSelector.tsx
          LanguageSelector.module.scss
          LanguageSelector.spec.tsx
          interfaces.ts
          index.ts
      index.ts
  i18n/                        # Domain: internationalization
    ports/                     # Hexagonal: port interfaces
      Translator.ts            # Port interface
    adapters/                  # Hexagonal: implementations
      I18nProvider.tsx         # React context adapter
    config/
      locales.ts               # Typed locale configuration
      index.ts
    translations/              # Translation dictionaries
      en.ts
      es.ts
      index.ts
    hooks/
      useTranslation.ts        # Consumer hook
      useTranslation.spec.ts
    types/
      Locale.ts
      TranslationKeys.ts
      index.ts
    index.ts                   # Domain barrel export
  shared/                      # Cross-cutting shared utilities
    components/
      App/                     # Root application shell
        App.tsx
        App.module.scss
        App.spec.tsx
        interfaces.ts
        index.ts
    test/
      test-utils.tsx           # Testing utilities (render with providers)
  assets/                      # Static assets (images, fonts)
  main.tsx                     # Application entry point
  vite-env.d.ts
```

### Dependency Direction (Clean Architecture)

```
[UI Components] --> [Hooks] --> [Ports] <-- [Adapters/Providers]
      |               |           ^
      v               v           |
  [Styles]      [Types/Config] ---+
```

- **Inward:** Components depend on hooks, hooks depend on ports (interfaces)
- **Adapters implement ports:** `I18nProvider` implements `Translator` port
- **No outward dependencies:** Ports and types have zero external dependencies

### SOLID Mapping

| Principle                     | Application                                                                     |
| ----------------------------- | ------------------------------------------------------------------------------- |
| **S** - Single Responsibility | Each file has one reason to change (e.g., `Greeting.tsx` only renders greeting) |
| **O** - Open/Closed           | Features extensible via new translations without modifying core                 |
| **L** - Liskov Substitution   | Any Translator port implementation is substitutable                             |
| **I** - Interface Segregation | Small, focused interfaces (`Translator` has only what consumers need)           |
| **D** - Dependency Inversion  | Components depend on abstractions (ports), not concrete providers               |

## Consequences

### Positive

- Top-level folders immediately communicate business intent (Scream)
- i18n can be mocked/replaced without touching components (Hexagonal)
- Each feature is independently testable and deployable
- Clear boundaries prevent circular dependencies
- 100% coverage achievable via isolated unit tests + integration tests

### Negative

- More files/folders than a flat structure (acceptable for maintainability)
- Developers must understand the layering conventions

### Neutral

- Migration: existing `src/components/App` moves to `src/shared/components/App`

## Migration from Current State

| Current                 | Target                                               |
| ----------------------- | ---------------------------------------------------- |
| `src/components/App/`   | `src/shared/components/App/`                         |
| `src/features/` (empty) | Populated with `greeting/`, `language-selector/`     |
| `src/i18n/` (empty)     | Populated with ports, adapters, config, translations |
| `src/test/` (empty)     | Removed; test utils move to `src/shared/test/`       |
| `src/hooks/`            | Removed; hooks live within their feature or domain   |
| `src/assets/`           | Retained                                             |

## References

- [Screaming Architecture - Uncle Bob](https://blog.cleancoder.com/uncle-bob/2011/09/30/Screaming-Architecture.html)
- [Clean Architecture - Uncle Bob](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Hexagonal Architecture - Alistair Cockburn](https://alistair.cockburn.us/hexagonal-architecture/)
