import { test, expect } from '@playwright/test'

test.describe('Navbar Controls', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test.describe('Language Dropdown', () => {
    test('opens and shows language options', async ({ page }) => {
      const langTrigger = page.getByTestId('app-navbar-language-trigger')
      await expect(langTrigger).toBeVisible()

      // Click to open dropdown
      await langTrigger.click()

      // Verify dropdown is open
      await expect(langTrigger).toHaveAttribute('aria-expanded', 'true')

      // Verify options are visible
      await expect(page.getByTestId('app-navbar-language-option-en')).toBeVisible()
      await expect(page.getByTestId('app-navbar-language-option-es')).toBeVisible()
    })

    test('selects language from dropdown', async ({ page }) => {
      const langTrigger = page.getByTestId('app-navbar-language-trigger')

      // Initial state should show English in the aria-label
      await expect(langTrigger).toHaveAccessibleName(/english/i)

      // Open dropdown and select Spanish
      await langTrigger.click()
      await expect(langTrigger).toHaveAttribute('aria-expanded', 'true')

      const spanishOption = page.getByTestId('app-navbar-language-option-es')
      await expect(spanishOption).toBeVisible()
      await spanishOption.click()

      // Dropdown should close and language should change
      await expect(langTrigger).toHaveAttribute('aria-expanded', 'false')

      // HTML lang should update (Playwright auto-waits for condition)
      await expect(page.locator('html')).toHaveAttribute('lang', 'es')
    })

    test('trigger is focusable and has keyboard support', async ({ page }) => {
      const langTrigger = page.getByTestId('app-navbar-language-trigger')

      // Trigger is focusable
      await langTrigger.focus()
      await expect(langTrigger).toBeFocused()

      // Enter key opens dropdown
      await page.keyboard.press('Enter')
      await expect(langTrigger).toHaveAttribute('aria-expanded', 'true')

      // Click outside to close
      await page.mouse.click(10, 10)
      await expect(langTrigger).toHaveAttribute('aria-expanded', 'false')
    })

    test('has minimum touch target size', async ({ page }) => {
      const langTrigger = page.getByTestId('app-navbar-language-trigger')
      const box = await langTrigger.boundingBox()

      expect(box).not.toBeNull()
      // 44px is the minimum recommended touch target size
      expect(box!.width).toBeGreaterThanOrEqual(44)
      expect(box!.height).toBeGreaterThanOrEqual(44)
    })
  })

  test.describe('Theme Button (ADR-0009: NOT a dropdown)', () => {
    test('is a plain button, not a dropdown trigger', async ({ page }) => {
      const themeButton = page.getByTestId('app-navbar-theme-button')
      await expect(themeButton).toBeVisible()

      // Should NOT have aria-haspopup (not a popup trigger)
      await expect(themeButton).not.toHaveAttribute('aria-haspopup')

      // Should NOT have aria-expanded (not a popup trigger)
      await expect(themeButton).not.toHaveAttribute('aria-expanded')
    })

    test('cycles theme on click', async ({ page }) => {
      const themeButton = page.getByTestId('app-navbar-theme-button')

      // Default is system
      await expect(themeButton).toHaveAccessibleName(/system theme/i)

      // Click to cycle: system -> light
      await themeButton.click()
      await expect(themeButton).toHaveAccessibleName(/light mode/i)
      await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')

      // Click to cycle: light -> dark
      await themeButton.click()
      await expect(themeButton).toHaveAccessibleName(/dark mode/i)
      await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')

      // Click to cycle: dark -> system
      await themeButton.click()
      await expect(themeButton).toHaveAccessibleName(/system theme/i)
    })

    test('Enter key cycles theme', async ({ page }) => {
      const themeButton = page.getByTestId('app-navbar-theme-button')

      await themeButton.focus()
      await expect(themeButton).toBeFocused()

      // Default is system, Enter cycles to light
      await page.keyboard.press('Enter')
      await expect(themeButton).toHaveAccessibleName(/light mode/i)
    })

    test('Space key cycles theme', async ({ page }) => {
      const themeButton = page.getByTestId('app-navbar-theme-button')

      await themeButton.focus()

      // Default is system, Space cycles to light
      await page.keyboard.press('Space')
      await expect(themeButton).toHaveAccessibleName(/light mode/i)
    })

    test('icon changes per preference', async ({ page }) => {
      const themeButton = page.getByTestId('app-navbar-theme-button')

      // Get system icon
      const systemIcon = await themeButton.locator('svg').innerHTML()

      // Cycle to light
      await themeButton.click()
      const lightIcon = await themeButton.locator('svg').innerHTML()
      expect(lightIcon).not.toBe(systemIcon)

      // Cycle to dark
      await themeButton.click()
      const darkIcon = await themeButton.locator('svg').innerHTML()
      expect(darkIcon).not.toBe(lightIcon)
    })

    test('is icon-only (no visible text)', async ({ page }) => {
      const themeButton = page.getByTestId('app-navbar-theme-button')

      // Button should have an SVG icon
      await expect(themeButton.locator('svg')).toBeVisible()

      // Button text content should be empty (icon-only)
      const textContent = await themeButton.textContent()
      expect(textContent?.trim()).toBe('')
    })

    test('has minimum touch target size', async ({ page }) => {
      const themeButton = page.getByTestId('app-navbar-theme-button')
      const box = await themeButton.boundingBox()

      expect(box).not.toBeNull()
      expect(box!.width).toBeGreaterThanOrEqual(44)
      expect(box!.height).toBeGreaterThanOrEqual(44)
    })
  })

  test.describe('Country Dropdown', () => {
    test('opens and shows country options', async ({ page }) => {
      const countryTrigger = page.getByTestId('app-navbar-country-trigger')
      await expect(countryTrigger).toBeVisible()

      // Click to open dropdown
      await countryTrigger.click()

      // Verify dropdown is open
      await expect(countryTrigger).toHaveAttribute('aria-expanded', 'true')
    })

    test('selects country from dropdown', async ({ page }) => {
      const countryTrigger = page.getByTestId('app-navbar-country-trigger')

      // Initial state - US
      await expect(countryTrigger).toHaveAccessibleName(/united states/i)

      // Open dropdown and select Spain
      await countryTrigger.click()
      await page.getByTestId('app-navbar-country-option-ES').click()

      // Country should change
      await expect(countryTrigger).toHaveAccessibleName(/spain/i)
    })

    test('trigger is focusable and has keyboard support', async ({ page }) => {
      const countryTrigger = page.getByTestId('app-navbar-country-trigger')

      // Trigger is focusable
      await countryTrigger.focus()
      await expect(countryTrigger).toBeFocused()

      // Enter key opens dropdown
      await page.keyboard.press('Enter')
      await expect(countryTrigger).toHaveAttribute('aria-expanded', 'true')

      // Click outside to close
      await page.mouse.click(10, 10)
      await expect(countryTrigger).toHaveAttribute('aria-expanded', 'false')
    })
  })

  test.describe('Currency Dropdown', () => {
    test('opens and shows currency options', async ({ page }) => {
      const currencyTrigger = page.getByTestId('app-navbar-currency-trigger')
      await expect(currencyTrigger).toBeVisible()

      // Click to open dropdown
      await currencyTrigger.click()

      // Verify dropdown is open
      await expect(currencyTrigger).toHaveAttribute('aria-expanded', 'true')
    })

    test('selects currency from dropdown', async ({ page }) => {
      const currencyTrigger = page.getByTestId('app-navbar-currency-trigger')

      // Open dropdown and select EUR
      await currencyTrigger.click()
      await page.getByTestId('app-navbar-currency-option-EUR').click()

      // Currency should change
      await expect(currencyTrigger).toHaveAccessibleName(/eur/i)
    })
  })

  test.describe('All Controls', () => {
    test('three dropdown triggers are present (not 4 - theme is a button)', async ({ page }) => {
      const dropdownTriggers = page.locator('[aria-haspopup="listbox"]')
      await expect(dropdownTriggers).toHaveCount(3) // 3 navbar dropdowns (lang, country, currency)
    })

    test('navbar has proper navigation landmark', async ({ page }) => {
      const nav = page.getByRole('navigation')
      await expect(nav).toBeVisible()
      await expect(nav).toHaveAccessibleName(/settings/i)
    })

    test('respects prefers-reduced-motion', async ({ page }) => {
      // Emulate reduced motion preference
      await page.emulateMedia({ reducedMotion: 'reduce' })

      // Verify the theme button still works (functionality not affected)
      const themeButton = page.getByTestId('app-navbar-theme-button')
      await themeButton.click()
      await expect(themeButton).toHaveAccessibleName(/light mode/i)
    })
  })

  test.describe('Responsive Design', () => {
    test('controls are visible at 375px (mobile)', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })

      await expect(page.getByTestId('app-navbar-language-trigger')).toBeVisible()
      await expect(page.getByTestId('app-navbar-theme-button')).toBeVisible()
      await expect(page.getByTestId('app-navbar-country-trigger')).toBeVisible()
      await expect(page.getByTestId('app-navbar-currency-trigger')).toBeVisible()
    })

    test('controls are visible at 768px (tablet)', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 })

      await expect(page.getByTestId('app-navbar-language-trigger')).toBeVisible()
      await expect(page.getByTestId('app-navbar-theme-button')).toBeVisible()
      await expect(page.getByTestId('app-navbar-country-trigger')).toBeVisible()
      await expect(page.getByTestId('app-navbar-currency-trigger')).toBeVisible()
    })

    test('controls are visible at 1440px (desktop)', async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 })

      await expect(page.getByTestId('app-navbar-language-trigger')).toBeVisible()
      await expect(page.getByTestId('app-navbar-theme-button')).toBeVisible()
      await expect(page.getByTestId('app-navbar-country-trigger')).toBeVisible()
      await expect(page.getByTestId('app-navbar-currency-trigger')).toBeVisible()
    })
  })
})
