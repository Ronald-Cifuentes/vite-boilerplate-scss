/**
 * Check if user prefers reduced motion.
 * CONTRACTS §17: respect prefers-reduced-motion for scroll behavior.
 */
export function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}
