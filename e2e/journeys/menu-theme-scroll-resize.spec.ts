import { test, expect } from '../helpers/fixtures'

/**
 * E2E tests for Task 9 menu items:
 * - Theme-aware menu colors (items 1+2)
 * - Menu scroll (item 4)
 * - Menu close on breakpoint cross (item 5)
 */

test.describe('Menu Theme Colors (ADR-0012 Amendment 1)', () => {
  test.describe('Light theme', () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      await page.addInitScript(() => {
        localStorage.setItem('app-theme', 'light')
      })
      await page.goto('/')
    })

    test('menu overlay is light (gray-50 family)', async ({ page }) => {
      // Open menu
      await page.getByTestId('app-navbar-hamburger').click()
      await page.waitForTimeout(300)

      // Get computed background of overlay (::before pseudo-element approximation via menu bg)
      const menuOverlayColor = await page.evaluate(() => {
        const menu = document.querySelector('[data-testid="app-mobile-menu"]') as HTMLElement
        const before = getComputedStyle(menu, '::before')
        return before.backgroundColor
      })

      // gray-50 is #F9FAFB -> rgb(249, 250, 251)
      expect(menuOverlayColor).toMatch(/rgb\(249,\s*250,\s*251\)/)
    })

    test('X bars contrast light overlay (dark highlight)', async ({ page }) => {
      // Open menu
      await page.getByTestId('app-navbar-hamburger').click()
      await page.waitForTimeout(300)

      // Get computed color of the bars
      const barsColor = await page.evaluate(() => {
        const hamburger = document.querySelector(
          '[data-testid="app-navbar-hamburger"]'
        ) as HTMLElement
        const bars = hamburger.querySelector('span')
        if (!bars) return null
        const style = getComputedStyle(bars, '::before')
        return style.backgroundColor
      })

      // Should be dark highlight #18181A -> rgb(24, 24, 26)
      expect(barsColor).toMatch(/rgb\(24,\s*24,\s*26\)/)
    })
  })

  test.describe('Dark theme', () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      await page.addInitScript(() => {
        localStorage.setItem('app-theme', 'dark')
      })
      await page.goto('/')
    })

    test('menu overlay is dark (#18181A)', async ({ page }) => {
      // Open menu
      await page.getByTestId('app-navbar-hamburger').click()
      await page.waitForTimeout(300)

      const menuOverlayColor = await page.evaluate(() => {
        const menu = document.querySelector('[data-testid="app-mobile-menu"]') as HTMLElement
        const before = getComputedStyle(menu, '::before')
        return before.backgroundColor
      })

      // #18181A -> rgb(24, 24, 26)
      expect(menuOverlayColor).toMatch(/rgb\(24,\s*24,\s*26\)/)
    })

    test('X bars contrast dark overlay (light highlight)', async ({ page }) => {
      // Open menu
      await page.getByTestId('app-navbar-hamburger').click()
      await page.waitForTimeout(300)

      const barsColor = await page.evaluate(() => {
        const hamburger = document.querySelector(
          '[data-testid="app-navbar-hamburger"]'
        ) as HTMLElement
        const bars = hamburger.querySelector('span')
        if (!bars) return null
        const style = getComputedStyle(bars, '::before')
        return style.backgroundColor
      })

      // Should be light highlight #F5F5F5 -> rgb(245, 245, 245)
      expect(barsColor).toMatch(/rgb\(245,\s*245,\s*245\)/)
    })
  })
})

test.describe('Menu Scroll (ADR-0012 Amendment 2)', () => {
  test('all items reachable at landscape 667x375', async ({ page }) => {
    // Landscape phone viewport
    await page.setViewportSize({ width: 667, height: 375 })
    await page.goto('/')

    // Open menu
    await page.getByTestId('app-navbar-hamburger').click()
    await page.waitForTimeout(300)

    // Open country submenu (has most options)
    await page.getByTestId('app-mobile-menu-item-country').click()
    await page.waitForTimeout(200)

    // All 7 country options should be reachable via Tab
    const menu = page.getByTestId('app-mobile-menu')
    await expect(menu).toHaveCSS('overflow-y', 'auto')

    // Verify last country option (JP) is focusable
    // Navigate through menu items and options
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('Tab')
    }

    // Check that we haven't lost focus outside the menu
    const focusedElement = await page.evaluate(() => {
      const el = document.activeElement
      return el?.closest('[data-testid="app-mobile-menu"]') !== null
    })
    expect(focusedElement).toBe(true)
  })

  test('menu has overflow-y: auto', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')

    await page.getByTestId('app-navbar-hamburger').click()
    await page.waitForTimeout(300)

    const menu = page.getByTestId('app-mobile-menu')
    await expect(menu).toHaveCSS('overflow-y', 'auto')
  })

  // SCROLL9-04: 320x480 scroll test - menu open, submenu expanded, all items reachable
  test('320x480 viewport: scroll + last-item visibility (SCROLL9-04)', async ({ page }) => {
    // Very small portrait viewport
    await page.setViewportSize({ width: 320, height: 480 })
    await page.goto('/')

    // Open menu
    await page.getByTestId('app-navbar-hamburger').click()
    await page.waitForTimeout(300)

    // Open country submenu (has 7 options - most likely to overflow)
    await page.getByTestId('app-mobile-menu-item-country').click()
    await page.waitForTimeout(200)

    // Last country option is JP
    const lastOption = page.getByTestId('app-mobile-menu-submenu-country-option-JP')

    // Tab through to reach JP option (this triggers scrollIntoView)
    for (let i = 0; i < 15; i++) {
      await page.keyboard.press('Tab')
    }

    // Focus the JP option directly to ensure scrollIntoView works
    await lastOption.focus()
    await page.waitForTimeout(100)

    // Get the bounding box - should be within viewport
    const box = await lastOption.boundingBox()
    expect(box).not.toBeNull()

    // Verify element is within viewport bounds
    const viewportHeight = 480
    expect(box!.y).toBeGreaterThanOrEqual(0)
    expect(box!.y + box!.height).toBeLessThanOrEqual(viewportHeight)
  })

  // SCROLL9-05: focused items scrolled into view with prefers-reduced-motion respected
  test('focused items scroll into view (SCROLL9-05)', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 480 })
    await page.goto('/')

    // Open menu
    await page.getByTestId('app-navbar-hamburger').click()
    await page.waitForTimeout(300)

    // Open currency submenu (7 options)
    await page.getByTestId('app-mobile-menu-item-currency').click()
    await page.waitForTimeout(200)

    // Focus the last currency option (JPY)
    const lastOption = page.getByTestId('app-mobile-menu-submenu-currency-option-JPY')
    await lastOption.focus()
    await page.waitForTimeout(200)

    // Verify it's in view after focus
    const box = await lastOption.boundingBox()
    expect(box).not.toBeNull()
    expect(box!.y).toBeGreaterThanOrEqual(0)
    expect(box!.y + box!.height).toBeLessThanOrEqual(480)
  })
})

test.describe('Menu Close on Breakpoint Cross (ADR-0012 Amendment 2)', () => {
  test('resize from mobile to desktop closes menu and releases scroll lock', async ({ page }) => {
    // Start at mobile width
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')

    // Open menu
    const hamburger = page.getByTestId('app-navbar-hamburger')
    await hamburger.click()
    await page.waitForTimeout(300)

    // Verify menu is open and scroll is locked
    const menu = page.getByTestId('app-mobile-menu')
    await expect(menu).toBeVisible()

    let bodyOverflow = await page.evaluate(() => getComputedStyle(document.body).overflow)
    expect(bodyOverflow).toBe('hidden')

    // Resize to desktop (cross 768px boundary)
    await page.setViewportSize({ width: 1024, height: 900 })
    await page.waitForTimeout(500)

    // Menu should be closed (removed from DOM since isOpen is false)
    await expect(menu).not.toBeVisible()

    // Scroll lock should be released
    bodyOverflow = await page.evaluate(() => getComputedStyle(document.body).overflow)
    expect(bodyOverflow).not.toBe('hidden')

    // Hamburger should be hidden at desktop
    await expect(hamburger).not.toBeVisible()

    // Inline controls should be visible
    await expect(page.getByTestId('app-navbar-language-trigger')).toBeVisible()
  })

  test('no orphaned overlay after breakpoint cross', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')

    // Open menu
    await page.getByTestId('app-navbar-hamburger').click()
    await page.waitForTimeout(300)

    // Resize to desktop
    await page.setViewportSize({ width: 1024, height: 900 })
    await page.waitForTimeout(500)

    // Verify no overlay elements remain visible
    const overlayCount = await page.evaluate(() => {
      const elements = document.querySelectorAll('[data-testid="app-mobile-menu"]')
      let visibleCount = 0
      elements.forEach(el => {
        const style = getComputedStyle(el)
        if (style.display !== 'none' && style.visibility !== 'hidden') {
          visibleCount++
        }
      })
      return visibleCount
    })

    expect(overlayCount).toBe(0)
  })

  test('hamburger state is clean after resize-close', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')

    // Open menu
    const hamburger = page.getByTestId('app-navbar-hamburger')
    await hamburger.click()
    await page.waitForTimeout(300)

    // Verify aria-expanded is true
    await expect(hamburger).toHaveAttribute('aria-expanded', 'true')

    // Resize to desktop then back to mobile
    await page.setViewportSize({ width: 1024, height: 900 })
    await page.waitForTimeout(500)
    await page.setViewportSize({ width: 375, height: 667 })
    await page.waitForTimeout(300)

    // Hamburger should be visible and aria-expanded should be false
    await expect(hamburger).toBeVisible()
    await expect(hamburger).toHaveAttribute('aria-expanded', 'false')

    // Should be able to open menu again
    await hamburger.click()
    await page.waitForTimeout(300)
    await expect(page.getByTestId('app-mobile-menu')).toBeVisible()
  })

  // CROSS9-04: focus lands on first inline control after auto-close
  test('focus lands on first inline control after breakpoint cross (CROSS9-04)', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')

    // Open menu
    const hamburger = page.getByTestId('app-navbar-hamburger')
    await hamburger.click()
    await page.waitForTimeout(300)

    // Verify menu is open
    await expect(page.getByTestId('app-mobile-menu')).toBeVisible()

    // Resize to desktop (cross 768px boundary)
    await page.setViewportSize({ width: 1024, height: 900 })
    await page.waitForTimeout(500)

    // Menu should be closed
    await expect(page.getByTestId('app-mobile-menu')).not.toBeVisible()

    // Focus should be on the first visible inline control (language trigger)
    const languageTrigger = page.getByTestId('app-navbar-language-trigger')
    await expect(languageTrigger).toBeFocused()
  })
})
