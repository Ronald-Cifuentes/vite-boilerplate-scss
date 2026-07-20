/**
 * Check if user prefers reduced motion.
 * CONTRACTS §17: respect prefers-reduced-motion for scroll behavior.
 */
export function prefersReducedMotion(): boolean {
  /* istanbul ignore next -- @preserve SSR guard: window undefined in SSR */
  return globalThis.window?.matchMedia('(prefers-reduced-motion: reduce)').matches ?? false
}
