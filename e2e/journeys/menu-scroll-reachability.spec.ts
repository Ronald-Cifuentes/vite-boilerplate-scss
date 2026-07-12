import { test, expect, Page } from '@playwright/test'

/**
 * SCROLL-TOP-1 generalized gate: first AND last menu items must be reachable
 * after expanding each submenu at multiple constrained viewports.
 *
 * Matrix: 3 submenus (language, country, currency) x 4 viewports = 12 combos
 * Each combo asserts both FIRST (language) and LAST (theme) items are reachable.
 *
 * Uses state-awaits (aria-expanded), NO new hard sleeps.
 *
 * IMPORTANT: Must run serial (test.describe.configure) because scroll/viewport
 * state can be affected by parallel tests resizing the same browser context.
 *
 * User-gesture scroll variants (wheel + touch) catch regressions in gesture
 * handling (pointer-events, overscroll, wheel target) that programmatic
 * scrollIntoView would miss.
 *
 * Edge gap assertions: when scrolled to ends, items must have breathing room
 * (not flush at viewport edges). GAP_MIN derived from DS token $space-5
 * (1.5rem = 24px at default 16px root).
 */
test.describe.configure({ mode: 'serial' })

/**
 * Minimum edge gap in pixels, derived from DS token $space-5 (1.5rem = 24px).
 * Used for asserting vertical breathing room at scroll ends.
 */
const GAP_MIN = 24

const VIEWPORTS = [
  { width: 479, height: 537, name: '479x537' }, // User's exact report
  { width: 320, height: 480, name: '320x480' }, // Smallest mobile
  { width: 667, height: 375, name: '667x375' }, // Landscape phone
  { width: 375, height: 667, name: '375x667' }, // Standard phone
] as const

const SUBMENUS = ['language', 'country', 'currency'] as const

const FIRST_ITEM_TESTID = 'app-mobile-menu-item-language'
const LAST_ITEM_TESTID = 'app-mobile-menu-item-theme'
const MENU_TESTID = 'app-mobile-menu'

async function openMenuAndExpandSubmenu(page: Page, submenu: string): Promise<void> {
  // Open hamburger menu - wait for visibility
  const hamburger = page.getByTestId('app-navbar-hamburger')
  await hamburger.click()
  await page.waitForSelector(`[data-testid="${MENU_TESTID}"]`, {
    state: 'visible',
  })

  // Click submenu button to expand it - use the button locator
  const submenuItem = page.getByTestId(`app-mobile-menu-item-${submenu}`)
  const submenuButton = submenuItem.locator('button').first()
  await submenuButton.click()

  // Wait for aria-expanded="true" (state-based wait, no hardcoded timeout)
  await expect(submenuButton).toHaveAttribute('aria-expanded', 'true')

  const submenuPanel = page.getByTestId(`app-mobile-menu-submenu-${submenu}`)
  await expect(submenuPanel).toBeVisible()
}

async function assertItemReachable(
  page: Page,
  testId: string,
  itemName: string
): Promise<{ top: number; bottom: number; visible: boolean }> {
  // Scroll the item into view within the menu container
  await page.evaluate(
    ({ menuId, itemId }) => {
      const menuEl = document.querySelector(`[data-testid="${menuId}"]`) as HTMLElement
      const itemEl = document.querySelector(`[data-testid="${itemId}"]`) as HTMLElement
      if (menuEl && itemEl) {
        itemEl.scrollIntoView({ block: 'nearest', behavior: 'instant' })
      }
    },
    { menuId: MENU_TESTID, itemId: testId }
  )

  const result = await page.evaluate(
    ({ itemId }) => {
      const itemEl = document.querySelector(`[data-testid="${itemId}"]`) as HTMLElement
      const itemBox = itemEl.getBoundingClientRect()
      const viewportH = window.innerHeight
      const viewportW = window.innerWidth

      // Item is reachable if its bounding box is fully within viewport after scroll
      const visible =
        itemBox.top >= 0 &&
        itemBox.bottom <= viewportH &&
        itemBox.left >= 0 &&
        itemBox.right <= viewportW

      return {
        top: itemBox.top,
        bottom: itemBox.bottom,
        visible,
        viewportH,
      }
    },
    { itemId: testId }
  )

  expect(
    result.visible,
    `${itemName} should be fully visible within viewport after scroll (top: ${result.top}, bottom: ${result.bottom}, viewportH: ${result.viewportH})`
  ).toBe(true)

  return result
}

test.describe('Mobile Menu Scroll Reachability (SCROLL-TOP-1 generalized gate)', () => {
  for (const viewport of VIEWPORTS) {
    test.describe(`at ${viewport.name}`, () => {
      test.beforeEach(async ({ page }) => {
        await page.setViewportSize({ width: viewport.width, height: viewport.height })
        await page.goto('/')
      })

      for (const submenu of SUBMENUS) {
        test(`${submenu} expanded: first AND last items reachable`, async ({ page }) => {
          await openMenuAndExpandSubmenu(page, submenu)

          const firstResult = await assertItemReachable(page, FIRST_ITEM_TESTID, 'Language (first)')

          const lastResult = await assertItemReachable(page, LAST_ITEM_TESTID, 'Theme (last)')

          console.log(
            `[${viewport.name}/${submenu}] first: top=${firstResult.top.toFixed(1)}, visible=${firstResult.visible}; last: top=${lastResult.top.toFixed(1)}, visible=${lastResult.visible}`
          )
        })
      }
    })
  }

  // Edge gap assertions: when scrolled fully up, first item top >= GAP_MIN;
  // when scrolled fully down, last item bottom <= viewport - GAP_MIN
  test.describe('Edge gap at scroll ends (Task 12)', () => {
    test.beforeEach(async ({ page }) => {
      // User's exact reported resolution where overflow occurs
      await page.setViewportSize({ width: 479, height: 537 })
      await page.goto('/')
    })

    test('scrolled to top: first item has breathing room (top >= GAP_MIN)', async ({ page }) => {
      // Open menu and expand currency to cause overflow
      await openMenuAndExpandSubmenu(page, 'currency')

      await page.evaluate(() => {
        const menu = document.querySelector('[data-testid="app-mobile-menu"]') as HTMLElement
        menu.scrollTop = 0
      })

      const result = await page.evaluate(
        ({ itemId, gapMin }) => {
          const item = document.querySelector(`[data-testid="${itemId}"]`) as HTMLElement
          const rect = item.getBoundingClientRect()
          return {
            top: rect.top,
            gapMin,
            hasGap: rect.top >= gapMin,
          }
        },
        { itemId: FIRST_ITEM_TESTID, gapMin: GAP_MIN }
      )

      expect(
        result.hasGap,
        `First item should have breathing room at top (top=${result.top.toFixed(1)}, required >= ${GAP_MIN})`
      ).toBe(true)

      console.log(
        `[edge-gap/top] first item top=${result.top.toFixed(1)}, GAP_MIN=${GAP_MIN}, pass=${result.hasGap}`
      )
    })

    test('scrolled to bottom: last item has breathing room (bottom <= viewport - GAP_MIN)', async ({
      page,
    }) => {
      // Open menu and expand currency to cause overflow
      await openMenuAndExpandSubmenu(page, 'currency')

      await page.evaluate(() => {
        const menu = document.querySelector('[data-testid="app-mobile-menu"]') as HTMLElement
        menu.scrollTop = menu.scrollHeight - menu.clientHeight
      })

      const result = await page.evaluate(
        ({ itemId, gapMin }) => {
          const item = document.querySelector(`[data-testid="${itemId}"]`) as HTMLElement
          const rect = item.getBoundingClientRect()
          const viewportH = window.innerHeight
          const maxBottom = viewportH - gapMin
          return {
            bottom: rect.bottom,
            viewportH,
            maxBottom,
            hasGap: rect.bottom <= maxBottom,
          }
        },
        { itemId: LAST_ITEM_TESTID, gapMin: GAP_MIN }
      )

      expect(
        result.hasGap,
        `Last item should have breathing room at bottom (bottom=${result.bottom.toFixed(1)}, required <= ${result.maxBottom})`
      ).toBe(true)

      console.log(
        `[edge-gap/bottom] last item bottom=${result.bottom.toFixed(1)}, max=${result.maxBottom}, pass=${result.hasGap}`
      )
    })
  })

  // Visual parity test: menu still centered when content fits
  test('visual parity: collapsed menu at 375x667 still centered', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')
    await page.getByTestId('app-navbar-hamburger').click()
    await page.waitForSelector(`[data-testid="${MENU_TESTID}"]`, {
      state: 'visible',
    })

    const result = await page.evaluate(() => {
      const nav = document.querySelector('[class*="_nav_"]') as HTMLElement
      const menu = document.querySelector('[data-testid="app-mobile-menu"]') as HTMLElement
      const navR = nav.getBoundingClientRect()
      const menuR = menu.getBoundingClientRect()

      const navCenter = navR.top + navR.height / 2
      const menuCenter = menuR.top + menuR.height / 2
      const offset = Math.abs(navCenter - menuCenter)

      return {
        navHeight: navR.height,
        menuHeight: menuR.height,
        navCenter,
        menuCenter,
        offset,
        isCentered: offset < 50,
        scrollHeight: menu.scrollHeight,
        contentFits: menu.scrollHeight <= menuR.height,
      }
    })

    expect(result.contentFits, 'Content should fit viewport at 375x667 collapsed').toBe(true)
    expect(
      result.isCentered,
      `Menu should be visually centered (offset: ${result.offset.toFixed(1)}px)`
    ).toBe(true)

    console.log(
      `[visual parity] contentFits=${result.contentFits}, centered=${result.isCentered}, offset=${result.offset.toFixed(1)}px`
    )
  })
})

/**
 * USER-GESTURE SCROLL VARIANTS
 *
 * The programmatic matrix above uses scrollIntoView which exercises CSS but not
 * browser gesture handling. These tests use real wheel/touch gestures to catch
 * regressions in pointer-events, overscroll-behavior, or wheel target routing.
 */
test.describe('Mobile Menu User-Gesture Scroll (wheel)', () => {
  test.beforeEach(async ({ page }) => {
    // User's exact reported resolution
    await page.setViewportSize({ width: 479, height: 537 })
    await page.goto('/')
  })

  test('wheel scroll: scrollTop changes down then up, first+last reachable', async ({ page }) => {
    // Open menu and expand currency (the user's exact case)
    await openMenuAndExpandSubmenu(page, 'currency')

    const menuBox = await page.evaluate(() => {
      const menu = document.querySelector('[data-testid="app-mobile-menu"]') as HTMLElement
      const rect = menu.getBoundingClientRect()
      return {
        centerX: rect.left + rect.width / 2,
        centerY: rect.top + rect.height / 2,
        initialScrollTop: menu.scrollTop,
        scrollHeight: menu.scrollHeight,
        clientHeight: menu.clientHeight,
        canScroll: menu.scrollHeight > menu.clientHeight,
      }
    })

    // Only test scrolling if content actually overflows
    if (menuBox.canScroll) {
      await page.mouse.move(menuBox.centerX, menuBox.centerY)

      // Wheel DOWN (positive deltaY scrolls content up, scrollTop increases)
      await page.mouse.wheel(0, 200)

      // Poll for scrollTop change (state-based wait, no hard sleep)
      const afterDown = await expect
        .poll(
          async () => {
            return page.evaluate(() => {
              const menu = document.querySelector('[data-testid="app-mobile-menu"]') as HTMLElement
              return menu.scrollTop
            })
          },
          { timeout: 2000, message: 'scrollTop should increase after wheel down' }
        )
        .toBeGreaterThan(0)

      // Wheel UP (negative deltaY scrolls content down, scrollTop decreases)
      await page.mouse.wheel(0, -400)

      // Poll for scrollTop to return to 0 (or near 0)
      await expect
        .poll(
          async () => {
            return page.evaluate(() => {
              const menu = document.querySelector('[data-testid="app-mobile-menu"]') as HTMLElement
              return menu.scrollTop
            })
          },
          { timeout: 2000, message: 'scrollTop should return to 0 after wheel up' }
        )
        .toBeLessThanOrEqual(5) // Allow small margin for smooth scroll

      // Assert Language (first) is fully visible at scrollTop ~0
      const langResult = await page.evaluate(() => {
        const lang = document.querySelector(
          '[data-testid="app-mobile-menu-item-language"]'
        ) as HTMLElement
        const rect = lang.getBoundingClientRect()
        return {
          top: rect.top,
          bottom: rect.bottom,
          visible: rect.top >= 0 && rect.bottom <= window.innerHeight,
        }
      })
      expect(
        langResult.visible,
        `Language should be fully visible after wheel-up (top: ${langResult.top})`
      ).toBe(true)

      console.log(`[wheel] scrollTop 0->${afterDown}->~0, Language visible=${langResult.visible}`)
    }

    // Assert Theme (last) is reachable via programmatic scroll (already proven by matrix)
    await assertItemReachable(page, LAST_ITEM_TESTID, 'Theme (last)')
  })
})

/**
 * TOUCH GESTURE VARIANT
 *
 * Uses CDP Input.synthesizeScrollGesture for touch swipe. This is Chromium-only
 * (Safari/Firefox would need different approach). The test is guarded to only run
 * on Chromium-based browsers.
 */
test.describe('Mobile Menu User-Gesture Scroll (touch)', () => {
  test.use({ hasTouch: true })

  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 479, height: 537 })
    await page.goto('/')
  })

  test('touch swipe: scroll via CDP gesture, first item reachable', async ({
    page,
    browserName,
  }) => {
    // CDP synthesizeScrollGesture is Chromium-only
    test.skip(browserName !== 'chromium', 'CDP scroll gesture requires Chromium')

    await openMenuAndExpandSubmenu(page, 'currency')

    const initial = await page.evaluate(() => {
      const menu = document.querySelector('[data-testid="app-mobile-menu"]') as HTMLElement
      return {
        scrollTop: menu.scrollTop,
        canScroll: menu.scrollHeight > menu.clientHeight,
      }
    })

    if (initial.canScroll) {
      // Create CDP session and perform touch swipe UP (yDistance negative scrolls down)
      // then swipe DOWN (yDistance positive scrolls up toward first item)
      const cdp = await page.context().newCDPSession(page)

      const menuBox = await page.evaluate(() => {
        const menu = document.querySelector('[data-testid="app-mobile-menu"]') as HTMLElement
        const rect = menu.getBoundingClientRect()
        return {
          x: Math.round(rect.left + rect.width / 2),
          y: Math.round(rect.top + rect.height / 2),
        }
      })

      // Swipe UP (scroll down - finger moves up, content scrolls up)
      await cdp.send('Input.synthesizeScrollGesture', {
        x: menuBox.x,
        y: menuBox.y,
        yDistance: -150,
        speed: 1200,
      })

      // Poll for scrollTop increase
      await expect
        .poll(
          async () => {
            return page.evaluate(() => {
              const menu = document.querySelector('[data-testid="app-mobile-menu"]') as HTMLElement
              return menu.scrollTop
            })
          },
          { timeout: 2000, message: 'scrollTop should increase after touch swipe up' }
        )
        .toBeGreaterThan(0)

      // Swipe DOWN (scroll up - finger moves down, content scrolls down toward first item)
      await cdp.send('Input.synthesizeScrollGesture', {
        x: menuBox.x,
        y: menuBox.y,
        yDistance: 300,
        speed: 1200,
      })

      // Poll for scrollTop to return near 0
      await expect
        .poll(
          async () => {
            return page.evaluate(() => {
              const menu = document.querySelector('[data-testid="app-mobile-menu"]') as HTMLElement
              return menu.scrollTop
            })
          },
          { timeout: 2000, message: 'scrollTop should return to 0 after touch swipe down' }
        )
        .toBeLessThanOrEqual(5)

      const langResult = await page.evaluate(() => {
        const lang = document.querySelector(
          '[data-testid="app-mobile-menu-item-language"]'
        ) as HTMLElement
        const rect = lang.getBoundingClientRect()
        return {
          top: rect.top,
          visible: rect.top >= 0 && rect.bottom <= window.innerHeight,
        }
      })
      expect(
        langResult.visible,
        `Language should be fully visible after touch swipe (top: ${langResult.top})`
      ).toBe(true)

      console.log(`[touch] Language visible=${langResult.visible} after swipe cycle`)
    }

    await assertItemReachable(page, LAST_ITEM_TESTID, 'Theme (last)')
  })
})
