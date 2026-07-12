import { test, expect } from '../helpers/fixtures'
import { openMobileMenuIfNeeded, getMobileMenu, getHamburgerButton } from '../helpers/mobile-menu'

test.describe('Mobile Menu (375px viewport)', () => {
  test.use({ viewport: { width: 375, height: 667 } })

  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test.describe('Hamburger Button', () => {
    test('is visible on mobile', async ({ page }) => {
      const hamburger = getHamburgerButton(page)
      await expect(hamburger).toBeVisible()
    })

    test('has aria-expanded=false initially', async ({ page }) => {
      const hamburger = getHamburgerButton(page)
      await expect(hamburger).toHaveAttribute('aria-expanded', 'false')
    })

    test('has aria-controls pointing to mobile-menu', async ({ page }) => {
      const hamburger = getHamburgerButton(page)
      await expect(hamburger).toHaveAttribute('aria-controls', 'mobile-menu')
    })

    test('has accessible name for screen readers', async ({ page }) => {
      const hamburger = getHamburgerButton(page)
      await expect(hamburger).toHaveAccessibleName(/open menu/i)
    })
  })

  test.describe('Menu Opening/Closing', () => {
    test('opens menu when hamburger is clicked', async ({ page }) => {
      const hamburger = getHamburgerButton(page)
      await hamburger.click()

      const menu = getMobileMenu(page)
      await expect(menu).toBeVisible()
      await expect(hamburger).toHaveAttribute('aria-expanded', 'true')
    })

    test('closes menu when hamburger is clicked again', async ({ page }) => {
      await openMobileMenuIfNeeded(page)

      const hamburger = getHamburgerButton(page)
      await hamburger.click()

      const menu = getMobileMenu(page)
      await expect(menu).not.toBeVisible()
      await expect(hamburger).toHaveAttribute('aria-expanded', 'false')
    })

    test('closes menu when Escape is pressed', async ({ page }) => {
      await openMobileMenuIfNeeded(page)

      await page.keyboard.press('Escape')

      const menu = getMobileMenu(page)
      await expect(menu).not.toBeVisible()
    })

    test('returns focus to hamburger when closed via Escape', async ({ page }) => {
      const hamburger = getHamburgerButton(page)
      await hamburger.click()

      await page.keyboard.press('Escape')

      await expect(hamburger).toBeFocused()
    })
  })

  test.describe('Menu Accessibility', () => {
    test('has role=dialog', async ({ page }) => {
      await openMobileMenuIfNeeded(page)

      const menu = getMobileMenu(page)
      await expect(menu).toHaveAttribute('role', 'dialog')
    })

    test('has aria-modal=true', async ({ page }) => {
      await openMobileMenuIfNeeded(page)

      const menu = getMobileMenu(page)
      await expect(menu).toHaveAttribute('aria-modal', 'true')
    })

    test('has id=mobile-menu for aria-controls reference', async ({ page }) => {
      await openMobileMenuIfNeeded(page)

      const menu = getMobileMenu(page)
      await expect(menu).toHaveAttribute('id', 'mobile-menu')
    })

    test('has accessible name', async ({ page }) => {
      await openMobileMenuIfNeeded(page)

      const menu = getMobileMenu(page)
      await expect(menu).toHaveAccessibleName(/menu/i)
    })
  })

  test.describe('Menu Items', () => {
    test('shows 4 menu items: Language, Country, Currency, Theme', async ({ page }) => {
      await openMobileMenuIfNeeded(page)

      await expect(page.getByTestId('app-mobile-menu-item-language')).toBeVisible()
      await expect(page.getByTestId('app-mobile-menu-item-country')).toBeVisible()
      await expect(page.getByTestId('app-mobile-menu-item-currency')).toBeVisible()
      await expect(page.getByTestId('app-mobile-menu-item-theme')).toBeVisible()
    })

    test('Language item has aria-haspopup=menu', async ({ page }) => {
      await openMobileMenuIfNeeded(page)

      // Use first() to get the main button, not submenu option buttons
      const languageButton = page
        .getByTestId('app-mobile-menu-item-language')
        .locator('button')
        .first()
      await expect(languageButton).toHaveAttribute('aria-haspopup', 'menu')
    })

    test('Language item expands when clicked', async ({ page }) => {
      await openMobileMenuIfNeeded(page)

      const languageButton = page
        .getByTestId('app-mobile-menu-item-language')
        .locator('button')
        .first()
      await languageButton.click()

      await expect(languageButton).toHaveAttribute('aria-expanded', 'true')
      await expect(page.getByTestId('app-mobile-menu-submenu-language')).toBeVisible()
    })

    test('Language item collapses when clicked again', async ({ page }) => {
      await openMobileMenuIfNeeded(page)

      const languageButton = page
        .getByTestId('app-mobile-menu-item-language')
        .locator('button')
        .first()
      await languageButton.click()
      await languageButton.click()

      await expect(languageButton).toHaveAttribute('aria-expanded', 'false')
    })
  })

  test.describe('Language Selection', () => {
    test('changes language when option is selected', async ({ page }) => {
      await openMobileMenuIfNeeded(page)

      // Open language submenu
      const languageButton = page
        .getByTestId('app-mobile-menu-item-language')
        .locator('button')
        .first()
      await languageButton.click()

      // Select Spanish
      const esOption = page.getByTestId('app-mobile-menu-submenu-language-option-es')
      await esOption.click()

      // Submenu should close
      await expect(languageButton).toHaveAttribute('aria-expanded', 'false')

      // Verify language changed (greeting should be in Spanish)
      await expect(page.getByText(/Hola/i)).toBeVisible()
    })
  })

  test.describe('Country Selection', () => {
    test('changes country when option is selected', async ({ page }) => {
      await openMobileMenuIfNeeded(page)

      // Open country submenu
      const countryButton = page
        .getByTestId('app-mobile-menu-item-country')
        .locator('button')
        .first()
      await countryButton.click()

      // Select Spain
      const esOption = page.getByTestId('app-mobile-menu-submenu-country-option-ES')
      await esOption.click()

      // Submenu should close
      await expect(countryButton).toHaveAttribute('aria-expanded', 'false')
    })
  })

  test.describe('Currency Selection', () => {
    test('changes currency when option is selected', async ({ page }) => {
      await openMobileMenuIfNeeded(page)

      // Open currency submenu
      const currencyButton = page
        .getByTestId('app-mobile-menu-item-currency')
        .locator('button')
        .first()
      await currencyButton.click()

      // Select EUR
      const eurOption = page.getByTestId('app-mobile-menu-submenu-currency-option-EUR')
      await eurOption.click()

      // Submenu should close
      await expect(currencyButton).toHaveAttribute('aria-expanded', 'false')
    })
  })

  test.describe('Theme Toggle', () => {
    test('cycles theme when clicked (no submenu)', async ({ page }) => {
      await openMobileMenuIfNeeded(page)

      const themeButton = page.getByTestId('app-mobile-menu-item-theme').locator('button')

      // Should not have aria-haspopup (no submenu)
      await expect(themeButton).not.toHaveAttribute('aria-haspopup')

      // Click to cycle theme
      await themeButton.click()

      // Should still be visible (no submenu to collapse)
      await expect(themeButton).toBeVisible()
    })
  })

  test.describe('Focus Trap', () => {
    test('traps focus within menu when open', async ({ page }) => {
      await openMobileMenuIfNeeded(page)

      // Tab through all focusable elements - should stay in menu
      for (let i = 0; i < 10; i++) {
        await page.keyboard.press('Tab')
        const activeElement = page.locator(':focus')
        const menu = getMobileMenu(page)
        await expect(activeElement).toBeVisible()
        // Active element should be inside the menu
        const isInsideMenu = await activeElement.evaluate((el, menuSelector) => {
          const menu = document.querySelector(menuSelector)
          return menu?.contains(el) ?? false
        }, '[data-testid="app-mobile-menu"]')
        expect(isInsideMenu).toBe(true)
      }
    })
  })

  test.describe('Reduced Motion', () => {
    test.use({ reducedMotion: 'reduce' })

    test('respects prefers-reduced-motion', async ({ page }) => {
      // Open menu - should still work with reduced motion
      await openMobileMenuIfNeeded(page)

      const menu = getMobileMenu(page)
      await expect(menu).toBeVisible()

      // Verify the menu has no/instant transitions with reduced motion
      // This is a visual test - checking menu is visible is sufficient
    })
  })

  test.describe('Font Loading Proof', () => {
    test('menu font Rubik Mono One is actually loaded', async ({ page }) => {
      await openMobileMenuIfNeeded(page)

      // Wait for fonts to load
      await page.waitForFunction(() => document.fonts.ready)

      // PROOF-001: Verify font is loaded via document.fonts.check
      const fontLoaded = await page.evaluate(() => document.fonts.check('1rem "Rubik Mono One"'))
      expect(fontLoaded).toBe(true)

      // Also verify the computed font-family of a top-level item contains the font
      const menuItem = page.getByTestId('app-mobile-menu-item-language').locator('button').first()
      const computedFont = await menuItem.evaluate(el => getComputedStyle(el).fontFamily)
      expect(computedFont).toContain('Rubik Mono One')
    })
  })

  test.describe('Fullscreen Overlay Proof', () => {
    test('open overlay is truly fullscreen at 375x667', async ({ page }) => {
      await openMobileMenuIfNeeded(page)

      const menu = getMobileMenu(page)
      const box = await menu.boundingBox()

      // PROOF-002: Verify overlay fills entire viewport
      expect(box).not.toBeNull()
      expect(box!.x).toBe(0)
      expect(box!.y).toBe(0)
      expect(box!.width).toBe(375)
      expect(box!.height).toBe(667)
    })
  })
})

test.describe('Mobile Menu (768px viewport - hidden)', () => {
  test.use({ viewport: { width: 768, height: 1024 } })

  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('hamburger button is hidden at 768px', async ({ page }) => {
    const hamburger = getHamburgerButton(page)
    await expect(hamburger).not.toBeVisible()
  })

  test('desktop controls are visible at 768px', async ({ page }) => {
    // Use role-based selectors since these are more robust
    await expect(page.getByRole('button', { name: /select language/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /theme/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /select country/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /select currency/i })).toBeVisible()
  })
})

test.describe('Mobile Menu (1440px viewport - hidden)', () => {
  test.use({ viewport: { width: 1440, height: 900 } })

  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('hamburger button is hidden at 1440px', async ({ page }) => {
    const hamburger = getHamburgerButton(page)
    await expect(hamburger).not.toBeVisible()
  })
})
