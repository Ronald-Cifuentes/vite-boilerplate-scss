# ADR-0015: Translation Dictionaries as JSON Data Resources

- **Status:** Proposed
- **Date:** 2026-07-20
- **Deciders:** Architect Agent (task 33, iteration 2)
- **Supersedes:** Extends ADR-0002 (i18n design), ADR-0011 (CJK lazy loading)

## Context

SonarQube CPD (Copy-Paste Detection) reports 3.1% duplication (228 lines), with the sole source
being whole-body structural match across the four translation dictionaries (`en.ts`, `es.ts`,
`ja.ts`, `zh.ts`). The duplication is an artifact of CPD's literal-anonymization algorithm applied
to identically-structured TypeScript object literals whose every value differs.

User directive (task 33, `policies.dupRefactor`): no Sonar config workarounds (exclusions, threshold
changes, annotations). Instead, perform an architectural refactor that separates translations from
executable code, making the separation self-justifying on its own merits:

1. Translations are **data**, not code; editing them should not require touching executable modules.
2. Translators and tooling (e.g., i18n management platforms) can consume JSON directly.
3. JSON files are not TypeScript code, so they exit CPD analysis naturally.

## Decision

Migrate the four translation dictionaries from TypeScript object modules to JSON data resources.

### File Structure (after)

```
src/i18n/
  data/                            # NEW: data resources, not code
    en.json                        # canonical locale
    es.json
    ja.json                        # lazy-loaded
    zh.json                        # lazy-loaded
  loader/                          # NEW: adapter layer for loading
    locale-loader.ts               # loadTranslations(), async loader
    locale-loader.spec.ts
    index.ts
  validation/                      # NEW: test-time validation (NOT in prod bundle)
    translation-validator.ts       # validate structure against canonical
    translation-validator.spec.ts
    index.ts
  translations/                    # MODIFY: becomes thin re-export + runtime map
    index.ts                       # translations record, loadLocale(), isLocaleLoaded()
    translations.spec.ts           # existing tests, adapted
    # DELETE: en.ts, es.ts, ja.ts, zh.ts
  types/
    TranslationKeys.ts             # MODIFY: derive types from canonical JSON import
    Locale.ts                      # UNCHANGED
  # ports/, adapters/, config/, signals/, hooks/ — UNCHANGED
```

### Key Design Points

#### 1. TypeScript Types from Canonical JSON

```typescript
// src/i18n/types/TranslationKeys.ts
import canonicalTranslations from '../data/en.json'

/**
 * Infer the dictionary shape from the canonical (en) JSON.
 * No hand-maintained interface; adding a key to en.json propagates automatically.
 */
export type TranslationDictionary = typeof canonicalTranslations

/**
 * Flattened dot-notation keys (e.g., 'greeting.hello').
 */
export type TranslationKey = FlattenKeys<TranslationDictionary>

type FlattenKeys<T, Prefix extends string = ''> =
  T extends Record<string, unknown>
    ? {
        [K in keyof T & string]: T[K] extends Record<string, unknown>
          ? FlattenKeys<T[K], `${Prefix}${K}.`>
          : `${Prefix}${K}`
      }[keyof T & string]
    : never
```

**Note:** `resolveJsonModule: true` is already enabled in `tsconfig.json` (line 12). No tsconfig
delta required.

#### 2. Eager vs. Lazy Loading Semantics (PRESERVED)

Current behavior (ADR-0011):

- **Eager (inline):** `en`, `es` — bundled in main chunk
- **Lazy:** `ja`, `zh` — separate chunks loaded on demand

After migration:

- `en.json` and `es.json` are statically imported in `translations/index.ts` (eager)
- `ja.json` and `zh.json` are dynamically imported via `import()` in `loader/locale-loader.ts`
  (lazy, produces `ja-*.js` and `zh-*.js` chunks identical to current)

Vite's bundler handles JSON imports identically to TS object exports for chunking purposes.

#### 3. Fallback Behavior (PRESERVED)

Current: if lazy locale load fails, `translations[locale]` already points to `en` dictionary (set at
module init). On successful load, the entry is replaced with the actual dictionary.

After: identical behavior. The `translations` record initializes `ja` and `zh` entries to `en.json`
import, then replaces on successful dynamic load.

#### 4. Runtime Error Reporting (loader path only)

The async loader catches load failures and logs/reports them, then falls back to `en`. No runtime
validation in the hot path (budget constraint: 162 bytes gzip headroom).

#### 5. Validation (test-time only)

`validation/translation-validator.ts` exports validation functions for:

- **Missing keys:** keys present in canonical but absent in target locale
- **Unexpected keys:** keys present in target but absent in canonical
- **Empty translations:** string values that are empty or whitespace-only
- **Invalid nesting:** structural mismatch (object where string expected or vice versa)
- **Type mismatches:** non-string leaf values
- **Placeholder mismatches:** placeholders in canonical (e.g., `{age}`) absent in target, or extra
  placeholders in target (current inventory: single placeholder `{age}` in `rates.stale`)
- **Plural structure issues:** (N/A — current system has no pluralization; validator asserts none
  sneak in inconsistently by detecting CLDR plural keys `zero|one|two|few|many|other`)
- **Duplicate keys:** JSON.parse handles hard duplicates (last wins); validator warns if detected
  via raw-text scan
- **Unsupported namespaces:** top-level keys not in canonical

These run in Jest (spec file) and optionally in CI build step — NOT in production runtime.

#### 6. Bundle Size Impact

- **Current:** TS object literal compiles to JS object literal. Vite outputs:
  - main chunk: inlined `en` + `es` object literals
  - lazy chunks: `ja-*.js` (~1.4 KB), `zh-*.js` (~1.1 KB)
- **After:** JSON import compiles to identical JS object literal (Vite inlines JSON via
  `resolveJsonModule`). Byte-for-byte equivalence expected. The validator module is imported only in
  spec files (tree-shaken from prod build).
- **Expected delta:** 0 bytes (net). Micro-variance (+/- 50 bytes) possible from import statement
  string lengths; acceptable within 162-byte gzip headroom.

### Namespace Domains (unchanged)

The eight namespaces in each locale file are the domains:

- `common`, `greeting`, `mobileMenu`, `navbar`, `currency`, `rates`, `a11y`, `error`

These remain as the top-level keys in each JSON file. No splitting by size/token count.

## Consequences

### Positive

- Translations are data, not code; editing them does not touch executable modules
- JSON format is standard; integrates with i18n tooling (Phrase, Lokalise, Crowdin, etc.)
- CPD duplication drops to 0% (JSON files are not TypeScript code)
- Type safety preserved via `typeof import` derivation from canonical
- Lazy loading behavior unchanged
- Fallback behavior unchanged
- Placeholder validation catches translator errors at test time, not runtime

### Negative

- Developer must run tests (or CI) to catch translation errors; no compile-time red squiggle on
  missing keys in non-canonical locales (the canonical locale still gets compile-time checking)
- Adding a new locale requires adding the JSON file and updating the loader's dynamic import map

### Neutral

- Sonar duplication metric improves as a consequence of the architectural change, not as a goal
- `TranslationDictionary` and `TranslationKey` type names preserved (exported from index, backward
  compatible for any hypothetical external consumers — grep found none)

## Implementation Checklist (for Frontend Engineer)

| #   | Action | File                                                | Details                                                                                                                                                         |
| --- | ------ | --------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | CREATE | `src/i18n/data/en.json`                             | Convert `en.ts` object to JSON (remove `import`, `export const en:`, type annotation; keep content structure)                                                   |
| 2   | CREATE | `src/i18n/data/es.json`                             | Convert `es.ts` object to JSON                                                                                                                                  |
| 3   | CREATE | `src/i18n/data/ja.json`                             | Convert `ja.ts` object to JSON; move PROVENANCE comment to a top-level `"_provenance"` key or adjacent `ja.meta.json` (FE discretion)                           |
| 4   | CREATE | `src/i18n/data/zh.json`                             | Convert `zh.ts` object to JSON; same provenance handling                                                                                                        |
| 5   | DELETE | `src/i18n/translations/en.ts`                       | Replaced by en.json                                                                                                                                             |
| 6   | DELETE | `src/i18n/translations/es.ts`                       | Replaced by es.json                                                                                                                                             |
| 7   | DELETE | `src/i18n/translations/ja.ts`                       | Replaced by ja.json                                                                                                                                             |
| 8   | DELETE | `src/i18n/translations/zh.ts`                       | Replaced by zh.json                                                                                                                                             |
| 9   | MODIFY | `src/i18n/types/TranslationKeys.ts`                 | Replace `interface TranslationDictionary` with `typeof import('../data/en.json')`; keep `TranslationKey` and `FlattenKeys` utility                              |
| 10  | CREATE | `src/i18n/loader/locale-loader.ts`                  | `loadTranslations(locale): Promise<TranslationDictionary \| null>`, `isLocaleLoaded(locale): boolean`, internal loadedLocales set, dynamic import map for ja/zh |
| 11  | CREATE | `src/i18n/loader/locale-loader.spec.ts`             | Unit tests: load each locale, already-loaded short-circuit, unsupported locale returns null, load failure returns null and logs                                 |
| 12  | CREATE | `src/i18n/loader/index.ts`                          | Barrel export                                                                                                                                                   |
| 13  | MODIFY | `src/i18n/translations/index.ts`                    | Import en.json and es.json statically; delegate loadLocale to loader; update translations record initialization                                                 |
| 14  | MODIFY | `src/i18n/translations/translations.spec.ts`        | Adapt tests to new module structure; add structure-match assertions                                                                                             |
| 15  | CREATE | `src/i18n/validation/translation-validator.ts`      | `validateLocale(canonical, target, localeName): ValidationResult`, `ValidationResult = { valid: boolean, errors: ValidationError[] }`                           |
| 16  | CREATE | `src/i18n/validation/translation-validator.spec.ts` | Tests: missing keys, unexpected keys, empty strings, nesting mismatch, placeholder mismatch, plural detection, duplicate key warning                            |
| 17  | CREATE | `src/i18n/validation/index.ts`                      | Barrel export                                                                                                                                                   |
| 18  | MODIFY | `src/i18n/translations/translations.spec.ts`        | Add test: validate all non-canonical locales against canonical (es, ja, zh vs en)                                                                               |
| 19  | VERIFY | Arch tests                                          | `pnpm test --testPathPattern=arch` must pass (no i18n boundary violation)                                                                                       |
| 20  | VERIFY | Full test suite                                     | `pnpm test` 905+ tests, 100% coverage                                                                                                                           |
| 21  | VERIFY | Build                                               | `pnpm build` succeeds; dist contains `ja-*.js` and `zh-*.js` chunks                                                                                             |
| 22  | VERIFY | Bundle delta                                        | main.js raw size delta <= +/- 200 bytes; gzip delta <= +/- 50 bytes                                                                                             |

## Validation Functions Signature (for FE reference)

```typescript
// src/i18n/validation/translation-validator.ts

export interface ValidationError {
  type:
    | 'missing_key'
    | 'unexpected_key'
    | 'empty_value'
    | 'invalid_nesting'
    | 'type_mismatch'
    | 'placeholder_mismatch'
    | 'plural_structure'
    | 'duplicate_key'
    | 'unsupported_namespace'
  path: string // dot-notation path, e.g., 'rates.stale'
  message: string
}

export interface ValidationResult {
  valid: boolean
  locale: string
  errors: ValidationError[]
}

/**
 * Validate a target locale dictionary against the canonical (en) dictionary.
 * Used in test suites; NOT imported in production code.
 */
export function validateLocale(
  canonical: Record<string, unknown>,
  target: Record<string, unknown>,
  localeName: string
): ValidationResult
```

## Tests to Add/Modify

| Spec File                       | Tests                                                                                                                                                                        |
| ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `translations.spec.ts`          | Load every locale (en, es, zh, ja), structure match per locale (keys match canonical), fallback behavior (zh/ja start as en, then load), placeholder consistency             |
| `locale-loader.spec.ts`         | Load each locale, already-loaded returns cached, unsupported locale returns null, mock import failure returns null                                                           |
| `translation-validator.spec.ts` | Missing key detection, unexpected key detection, empty string detection, nesting mismatch, placeholder inventory `{age}`, plural detection (should find none), type mismatch |
| `architecture.spec.ts`          | (No change — existing tests import from `i18n/` barrel, which remains unchanged)                                                                                             |
| `design-system.spec.ts`         | (No change — same reason)                                                                                                                                                    |

## References

- ADR-0002: Internationalization Design (original i18n architecture)
- ADR-0011: CJK Locales and Lazy Loading (ja/zh chunk strategy)
- Task 33 state.json `policies.dupRefactor` (user directive)
- tsconfig.json line 12: `"resolveJsonModule": true` (no change needed)
