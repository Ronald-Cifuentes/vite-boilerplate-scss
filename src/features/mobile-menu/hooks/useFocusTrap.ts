import { useEffect, type RefObject } from 'react'

const FOCUSABLE_SELECTORS = 'button, [href], [tabindex]:not([tabindex="-1"])'

/**
 * Check if an element is actually visible in the DOM.
 * This checks if the element or any of its ancestors are hidden.
 */
function isElementVisible(el: HTMLElement): boolean {
  // offsetParent is null for hidden elements (display: none) or fixed positioned elements
  // For fixed elements, check if getBoundingClientRect has non-zero dimensions
  if (el.offsetParent === null) {
    const rect = el.getBoundingClientRect()
    return rect.width > 0 && rect.height > 0
  }
  return true
}

/**
 * Find the first visible focusable element in the navbar inline controls
 * Used for focus restoration when menu closes at desktop breakpoint
 * Excludes the hamburger button which is hidden at desktop
 */
function findFirstInlineControl(): HTMLElement | null {
  // Look for navbar inline controls (language/country/currency triggers)
  // We specifically look for dropdown triggers, not the hamburger
  const triggers = document.querySelectorAll<HTMLElement>(
    '[data-testid="app-navbar-language-trigger"], ' +
      '[data-testid="app-navbar-country-trigger"], ' +
      '[data-testid="app-navbar-currency-trigger"]'
  )

  for (const el of triggers) {
    // Check if element is actually visible (includes checking ancestors)
    if (isElementVisible(el)) {
      return el
    }
  }
  return null
}

/**
 * Hand-rolled focus trap hook (ADR-0012: no new dependencies).
 * Traps focus within the container when active, returns focus to trigger on deactivation.
 * CONTRACTS: On breakpoint cross, focus goes to first inline control, not hamburger.
 */
export function useFocusTrap(
  containerRef: RefObject<HTMLElement | null>,
  triggerRef: RefObject<HTMLElement | null>,
  isActive: boolean
): void {
  useEffect(() => {
    if (!isActive || !containerRef.current) return

    const container = containerRef.current
    const focusableElements = container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS)
    const firstFocusable = focusableElements[0]

    // Move focus into the container
    firstFocusable?.focus()

    const handleKeyDown = (e: KeyboardEvent): void => {
      if (e.key !== 'Tab') return

      const focusables = container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS)
      const first = focusables[0]
      const last = focusables[focusables.length - 1]

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last?.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first?.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    // Capture trigger ref value for cleanup (per react-hooks/exhaustive-deps)
    const triggerElement = triggerRef.current

    return (): void => {
      document.removeEventListener('keydown', handleKeyDown)
      // Return focus: prefer inline control if visible, fallback to trigger
      const inlineControl = findFirstInlineControl()
      if (inlineControl) {
        inlineControl.focus()
      } else {
        triggerElement?.focus()
      }
    }
  }, [isActive, containerRef, triggerRef])
}
