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
