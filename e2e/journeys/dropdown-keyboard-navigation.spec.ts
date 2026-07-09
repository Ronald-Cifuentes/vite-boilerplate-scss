import { test, expect } from '@playwright/test'

/**
 * Dropdown Keyboard Navigation E2E Tests
 *
 * These tests validate the ADR-0007 keyboard contract in a real browser environment.
 * Tests cover: ArrowDown, ArrowUp, Home, End, Enter, Space, Escape, Tab
 *
 * NOTE: Theme is no longer a dropdown per ADR-0009 (now a tri-state cycle button).
 * Only Language, Country, and Currency dropdowns are tested here.
 */
test.describe('Dropdown Keyboard Navigation (ADR-0007)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test.describe('Language Dropdown', () => {
    test('ArrowDown on trigger opens dropdown and focuses selected option', async ({ page }) => {
      const trigger = page.getByTestId('app-navbar-language-trigger')

      // Focus trigger
      await trigger.focus()
      await expect(trigger).toBeFocused()

      // Press ArrowDown to open
      await page.keyboard.press('ArrowDown')

      // Verify dropdown opened
      await expect(trigger).toHaveAttribute('aria-expanded', 'true')

      // Verify focus moved to the selected option (should be 'en' by default)
      const selectedOption = page.getByTestId('app-navbar-language-option-en')
      await expect(selectedOption).toBeFocused()
    })

    test('ArrowDown navigates through options with wrap-around', async ({ page }) => {
      const trigger = page.getByTestId('app-navbar-language-trigger')

      // Open dropdown
      await trigger.click()
      await expect(trigger).toHaveAttribute('aria-expanded', 'true')

      // First option should be focused (en is selected by default)
      const enOption = page.getByTestId('app-navbar-language-option-en')
      const esOption = page.getByTestId('app-navbar-language-option-es')
      await expect(enOption).toBeFocused()

      // ArrowDown moves to next option
      await page.keyboard.press('ArrowDown')
      await expect(esOption).toBeFocused()

      // ArrowDown from last option wraps to first
      await page.keyboard.press('ArrowDown')
      await expect(enOption).toBeFocused()
    })

    test('ArrowUp navigates through options with wrap-around', async ({ page }) => {
      const trigger = page.getByTestId('app-navbar-language-trigger')

      // Open dropdown
      await trigger.click()
      await expect(trigger).toHaveAttribute('aria-expanded', 'true')

      const enOption = page.getByTestId('app-navbar-language-option-en')
      const esOption = page.getByTestId('app-navbar-language-option-es')
      await expect(enOption).toBeFocused()

      // ArrowUp from first option wraps to last
      await page.keyboard.press('ArrowUp')
      await expect(esOption).toBeFocused()

      // ArrowUp again moves to previous (wraps back to en)
      await page.keyboard.press('ArrowUp')
      await expect(enOption).toBeFocused()
    })

    test('Home key jumps to first option', async ({ page }) => {
      const trigger = page.getByTestId('app-navbar-language-trigger')

      // Open dropdown
      await trigger.click()
      await expect(trigger).toHaveAttribute('aria-expanded', 'true')

      const enOption = page.getByTestId('app-navbar-language-option-en')
      const esOption = page.getByTestId('app-navbar-language-option-es')

      // Navigate to last option
      await page.keyboard.press('End')
      await expect(esOption).toBeFocused()

      // Home should jump to first
      await page.keyboard.press('Home')
      await expect(enOption).toBeFocused()
    })

    test('End key jumps to last option', async ({ page }) => {
      const trigger = page.getByTestId('app-navbar-language-trigger')

      // Open dropdown
      await trigger.click()
      await expect(trigger).toHaveAttribute('aria-expanded', 'true')

      const enOption = page.getByTestId('app-navbar-language-option-en')
      const esOption = page.getByTestId('app-navbar-language-option-es')
      await expect(enOption).toBeFocused()

      // End should jump to last
      await page.keyboard.press('End')
      await expect(esOption).toBeFocused()
    })

    test('Enter on focused option selects it, closes dropdown, returns focus to trigger', async ({
      page,
    }) => {
      const trigger = page.getByTestId('app-navbar-language-trigger')

      // Open dropdown
      await trigger.click()
      await expect(trigger).toHaveAttribute('aria-expanded', 'true')

      // Navigate to Spanish option
      await page.keyboard.press('ArrowDown')
      const esOption = page.getByTestId('app-navbar-language-option-es')
      await expect(esOption).toBeFocused()

      // Press Enter to select
      await page.keyboard.press('Enter')

      // Verify: dropdown closed
      await expect(trigger).toHaveAttribute('aria-expanded', 'false')

      // Verify: focus returned to trigger
      await expect(trigger).toBeFocused()

      // Verify: selection applied (html lang should be 'es')
      await expect(page.locator('html')).toHaveAttribute('lang', 'es')
    })

    test('Escape closes dropdown without selection and returns focus to trigger', async ({
      page,
    }) => {
      const trigger = page.getByTestId('app-navbar-language-trigger')

      // Open dropdown
      await trigger.click()
      await expect(trigger).toHaveAttribute('aria-expanded', 'true')

      // Navigate to Spanish
      await page.keyboard.press('ArrowDown')

      // Press Escape
      await page.keyboard.press('Escape')

      // Verify: dropdown closed
      await expect(trigger).toHaveAttribute('aria-expanded', 'false')

      // Verify: focus returned to trigger
      await expect(trigger).toBeFocused()

      // Verify: selection NOT applied (still English)
      await expect(page.locator('html')).toHaveAttribute('lang', 'en')
    })

    test('Tab closes dropdown and moves focus to next element', async ({ page }) => {
      const langTrigger = page.getByTestId('app-navbar-language-trigger')
      const themeButton = page.getByTestId('app-navbar-theme-button')

      // Open dropdown
      await langTrigger.click()
      await expect(langTrigger).toHaveAttribute('aria-expanded', 'true')

      // Press Tab
      await page.keyboard.press('Tab')

      // Verify: dropdown closed
      await expect(langTrigger).toHaveAttribute('aria-expanded', 'false')

      // Verify: focus moved to next focusable element (theme button)
      await expect(themeButton).toBeFocused()
    })
  })

  test.describe('Country Dropdown', () => {
    test('Full keyboard navigation cycle: ArrowDown/Up/Home/End/Enter', async ({ page }) => {
      const trigger = page.getByTestId('app-navbar-country-trigger')

      // Open with Space
      await trigger.focus()
      await page.keyboard.press('Space')
      await expect(trigger).toHaveAttribute('aria-expanded', 'true')

      // US should be selected by default
      const usOption = page.getByTestId('app-navbar-country-option-US')
      const esOption = page.getByTestId('app-navbar-country-option-ES')
      const gbOption = page.getByTestId('app-navbar-country-option-GB')
      const mxOption = page.getByTestId('app-navbar-country-option-MX')
      await expect(usOption).toBeFocused()

      // ArrowDown through all options
      await page.keyboard.press('ArrowDown')
      await expect(esOption).toBeFocused()
      await page.keyboard.press('ArrowDown')
      await expect(gbOption).toBeFocused()
      await page.keyboard.press('ArrowDown')
      await expect(mxOption).toBeFocused()

      // Wrap around
      await page.keyboard.press('ArrowDown')
      await expect(usOption).toBeFocused()

      // End to last
      await page.keyboard.press('End')
      await expect(mxOption).toBeFocused()

      // Home to first
      await page.keyboard.press('Home')
      await expect(usOption).toBeFocused()

      // Navigate to GB and select
      await page.keyboard.press('ArrowDown')
      await page.keyboard.press('ArrowDown')
      await expect(gbOption).toBeFocused()

      await page.keyboard.press('Enter')

      // Verify closed and focused
      await expect(trigger).toHaveAttribute('aria-expanded', 'false')
      await expect(trigger).toBeFocused()

      // Verify country changed (aria-label should mention UK)
      await expect(trigger).toHaveAccessibleName(/united kingdom/i)
    })
  })

  test.describe('Currency Dropdown', () => {
    test('Keyboard navigation with ArrowUp (reverse direction)', async ({ page }) => {
      const trigger = page.getByTestId('app-navbar-currency-trigger')

      // Open with Enter
      await trigger.focus()
      await page.keyboard.press('Enter')
      await expect(trigger).toHaveAttribute('aria-expanded', 'true')

      // USD should be default
      const usdOption = page.getByTestId('app-navbar-currency-option-USD')
      const mxnOption = page.getByTestId('app-navbar-currency-option-MXN')
      await expect(usdOption).toBeFocused()

      // ArrowUp wraps to last
      await page.keyboard.press('ArrowUp')
      await expect(mxnOption).toBeFocused()

      // Select MXN with Enter
      await page.keyboard.press('Enter')

      // Verify
      await expect(trigger).toHaveAttribute('aria-expanded', 'false')
      await expect(trigger).toBeFocused()
      // aria-label uses full currency name "Mexican Peso", not currency code "MXN"
      await expect(trigger).toHaveAccessibleName(/mexican peso/i)
    })
  })

  test.describe('Cross-dropdown consistency', () => {
    test('All three dropdowns respond to keyboard navigation identically', async ({ page }) => {
      // Note: Theme is not a dropdown per ADR-0009, so only 3 dropdowns
      const dropdowns = [
        { name: 'language', trigger: 'app-navbar-language-trigger', firstOption: 'en' },
        { name: 'country', trigger: 'app-navbar-country-trigger', firstOption: 'US' },
        { name: 'currency', trigger: 'app-navbar-currency-trigger', firstOption: 'USD' },
      ]

      for (const dd of dropdowns) {
        const trigger = page.getByTestId(dd.trigger)
        const firstOption = page.getByTestId(
          `${dd.trigger.replace('-trigger', '')}-option-${dd.firstOption}`
        )

        // Open with ArrowDown
        await trigger.focus()
        await page.keyboard.press('ArrowDown')
        await expect(trigger, `${dd.name} should open on ArrowDown`).toHaveAttribute(
          'aria-expanded',
          'true'
        )
        await expect(firstOption, `${dd.name} first option should be focused`).toBeFocused()

        // Close with Escape
        await page.keyboard.press('Escape')
        await expect(trigger, `${dd.name} should close on Escape`).toHaveAttribute(
          'aria-expanded',
          'false'
        )
        await expect(trigger, `${dd.name} focus should return to trigger`).toBeFocused()
      }
    })
  })
})
