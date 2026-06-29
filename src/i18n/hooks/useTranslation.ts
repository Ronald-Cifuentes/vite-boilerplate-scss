import type { Translator } from '../ports/Translator'
import { useSignals } from '@preact/signals-react/runtime'
import { translator } from '../signals/translator'

/**
 * React-side subscription point for the i18n signals. Components render
 * against the module-level `translator` object, but `useSignals()` is what
 * wires re-rendering to signal changes — without it, a component would
 * never see a new locale because it would never commit a new render.
 *
 * The wrapper hides the signal-tracking mechanics: consumers just call
 * `useTranslation()` and get back the full `Translator` interface.
 */
export function useTranslation(): Translator {
  useSignals()
  return translator
}
