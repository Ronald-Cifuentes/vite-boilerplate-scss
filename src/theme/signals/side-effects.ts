import type { ThemeMode } from '../types/Theme'

/**
 * Sync the data-theme attribute on the html element.
 * Called whenever the effective theme signal changes.
 */
export function syncDataTheme(mode: ThemeMode): void {
  /* istanbul ignore else -- @preserve SSR guard: document undefined in SSR */
  if (typeof document !== 'undefined') {
    document.documentElement.dataset.theme = mode
  }
}
