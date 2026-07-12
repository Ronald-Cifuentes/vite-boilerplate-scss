import { Page, Locator } from '@playwright/test'

const MOBILE_BREAKPOINT = 768

/**
 * Gets the hamburger button element via role and accessible name.
 * More robust than data-testid for a11y-focused testing.
 */
export function getHamburgerButton(page: Page): Locator {
  // Use role-based selector since button has aria-label
  return page.getByRole('button', { name: /open menu|close menu/i })
}

/**
 * Gets the mobile menu element.
 */
export function getMobileMenu(page: Page): Locator {
  return page.getByRole('dialog', { name: /menu/i })
}

/**
 * Opens the mobile menu if on mobile viewport (< 768px).
 * No-op if on desktop viewport.
 */
export async function openMobileMenuIfNeeded(page: Page): Promise<void> {
  const viewportSize = page.viewportSize()
  if (!viewportSize || viewportSize.width >= MOBILE_BREAKPOINT) {
    return // Desktop viewport, no mobile menu
  }

  const hamburger = getHamburgerButton(page)
  const isExpanded = await hamburger.getAttribute('aria-expanded')

  if (isExpanded !== 'true') {
    await hamburger.click()
    await getMobileMenu(page).waitFor({ state: 'visible' })
  }
}

/**
 * Closes the mobile menu if open.
 */
export async function closeMobileMenuIfOpen(page: Page): Promise<void> {
  const viewportSize = page.viewportSize()
  if (!viewportSize || viewportSize.width >= MOBILE_BREAKPOINT) {
    return // Desktop viewport, no mobile menu
  }

  const hamburger = getHamburgerButton(page)
  const isExpanded = await hamburger.getAttribute('aria-expanded')

  if (isExpanded === 'true') {
    await hamburger.click()
    await getMobileMenu(page).waitFor({ state: 'hidden' })
  }
}

/**
 * Checks if we are on mobile viewport.
 */
export function isMobileViewport(page: Page): boolean {
  const viewportSize = page.viewportSize()
  return !!viewportSize && viewportSize.width < MOBILE_BREAKPOINT
}
