import { test, expect } from '../helpers/fixtures'

/**
 * Dropdown Keyboard Navigation E2E Tests
 *
 * These tests validate the ADR-0007 keyboard contract in a real browser environment.
 * Tests cover: ArrowDown, ArrowUp, Home, End, Enter, Space, Escape, Tab
 *
 * NOTE: Theme is no longer a dropdown per ADR-0009 (now a tri-state cycle button).
 * Only Language, Country, and Currency dropdowns are tested here.
 *
 * STABILITY NOTE: The Dropdown component defers initial focus via setTimeout(..., 0)
 * after opening. Tests MUST await the initially-focused option to be focused BEFORE
 * sending any subsequent keypresses. This prevents race conditions where the keypress
 * lands on a stale target (FLAKE-1 mitigation per state.json harnessNotes).
 */
test.describe('Dropdown Keyboard Navigation (ADR-0007)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test.describe('Language Dropdown', () => {
    test('ArrowDown on trigger opens dropdown and focuses selected option', async ({ page }) => {
      const trigger = page.getByTestId('app-navbar-language-trigger')

      await trigger.focus()
      await expect(trigger).toBeFocused()

      // Press ArrowDown to open
      await page.keyboard.press('ArrowDown')

      await expect(trigger).toHaveAttribute('aria-expanded', 'true')

      // Verify focus moved to the selected option (should be 'en' by default)
      const selectedOption = page.getByTestId('app-navbar-language-option-en')
      await expect(selectedOption).toBeFocused()
    })

    test('ArrowDown navigates through options with wrap-around (4 locales: en, es, zh, ja)', async ({
      page,
    }) => {
      const trigger = page.getByTestId('app-navbar-language-trigger')
      const enOption = page.getByTestId('app-navbar-language-option-en')
      const esOption = page.getByTestId('app-navbar-language-option-es')
      const zhOption = page.getByTestId('app-navbar-language-option-zh')
      const jaOption = page.getByTestId('app-navbar-language-option-ja')

      await trigger.click()
      await expect(trigger).toHaveAttribute('aria-expanded', 'true')
      // CRITICAL: Wait for deferred focus to settle before sending keys
      await expect(enOption).toBeFocused()

      // ArrowDown moves through all 4 options
      await page.keyboard.press('ArrowDown')
      await expect(esOption).toBeFocused()
      await page.keyboard.press('ArrowDown')
      await expect(zhOption).toBeFocused()
      await page.keyboard.press('ArrowDown')
      await expect(jaOption).toBeFocused()

      // ArrowDown from last option (ja) wraps to first (en)
      await page.keyboard.press('ArrowDown')
      await expect(enOption).toBeFocused()
    })

    test('ArrowUp navigates through options with wrap-around (4 locales)', async ({ page }) => {
      const trigger = page.getByTestId('app-navbar-language-trigger')
      const enOption = page.getByTestId('app-navbar-language-option-en')
      const jaOption = page.getByTestId('app-navbar-language-option-ja')

      await trigger.click()
      await expect(trigger).toHaveAttribute('aria-expanded', 'true')
      // CRITICAL: Wait for deferred focus to settle before sending keys
      await expect(enOption).toBeFocused()

      // ArrowUp from first option (en) wraps to last (ja)
      await page.keyboard.press('ArrowUp')
      await expect(jaOption).toBeFocused()

      // ArrowUp again moves to previous (wraps back to zh then es then en)
      await page.keyboard.press('ArrowUp')
      const zhOption = page.getByTestId('app-navbar-language-option-zh')
      await expect(zhOption).toBeFocused()
    })

    test('Home key jumps to first option', async ({ page }) => {
      const trigger = page.getByTestId('app-navbar-language-trigger')
      const enOption = page.getByTestId('app-navbar-language-option-en')
      const jaOption = page.getByTestId('app-navbar-language-option-ja')

      await trigger.click()
      await expect(trigger).toHaveAttribute('aria-expanded', 'true')
      // CRITICAL: Wait for deferred focus to settle before sending keys
      await expect(enOption).toBeFocused()

      // Navigate to last option (ja is now the last with 4 locales)
      await page.keyboard.press('End')
      await expect(jaOption).toBeFocused()

      // Home should jump to first
      await page.keyboard.press('Home')
      await expect(enOption).toBeFocused()
    })

    test('End key jumps to last option (ja is now last with 4 locales)', async ({ page }) => {
      const trigger = page.getByTestId('app-navbar-language-trigger')
      const enOption = page.getByTestId('app-navbar-language-option-en')
      const jaOption = page.getByTestId('app-navbar-language-option-ja')

      await trigger.click()
      await expect(trigger).toHaveAttribute('aria-expanded', 'true')
      // CRITICAL: Wait for deferred focus to settle before sending keys
      await expect(enOption).toBeFocused()

      // End should jump to last (ja)
      await page.keyboard.press('End')
      await expect(jaOption).toBeFocused()
    })

    test('Enter on focused option selects it, closes dropdown, returns focus to trigger', async ({
      page,
    }) => {
      const trigger = page.getByTestId('app-navbar-language-trigger')
      const enOption = page.getByTestId('app-navbar-language-option-en')
      const esOption = page.getByTestId('app-navbar-language-option-es')

      await trigger.click()
      await expect(trigger).toHaveAttribute('aria-expanded', 'true')
      // CRITICAL: Wait for deferred focus to settle before sending keys
      await expect(enOption).toBeFocused()

      await page.keyboard.press('ArrowDown')
      await expect(esOption).toBeFocused()

      // Press Enter to select
      await page.keyboard.press('Enter')

      await expect(trigger).toHaveAttribute('aria-expanded', 'false')

      await expect(trigger).toBeFocused()

      await expect(page.locator('html')).toHaveAttribute('lang', 'es')
    })

    test('Escape closes dropdown without selection and returns focus to trigger', async ({
      page,
    }) => {
      const trigger = page.getByTestId('app-navbar-language-trigger')
      const enOption = page.getByTestId('app-navbar-language-option-en')

      await trigger.click()
      await expect(trigger).toHaveAttribute('aria-expanded', 'true')
      // CRITICAL: Wait for deferred focus to settle before sending keys
      await expect(enOption).toBeFocused()

      await page.keyboard.press('ArrowDown')
      const esOption = page.getByTestId('app-navbar-language-option-es')
      await expect(esOption).toBeFocused()

      await page.keyboard.press('Escape')

      await expect(trigger).toHaveAttribute('aria-expanded', 'false')

      await expect(trigger).toBeFocused()

      // Verify: selection NOT applied (still English)
      await expect(page.locator('html')).toHaveAttribute('lang', 'en')
    })

    test('Tab closes dropdown and moves focus to next element', async ({ page }) => {
      const langTrigger = page.getByTestId('app-navbar-language-trigger')
      const themeButton = page.getByTestId('app-navbar-theme-button')
      const enOption = page.getByTestId('app-navbar-language-option-en')

      await langTrigger.click()
      await expect(langTrigger).toHaveAttribute('aria-expanded', 'true')
      // CRITICAL: Wait for deferred focus to settle before sending keys
      await expect(enOption).toBeFocused()

      await page.keyboard.press('Tab')

      await expect(langTrigger).toHaveAttribute('aria-expanded', 'false')

      // Verify: focus moved to next focusable element (theme button)
      await expect(themeButton).toBeFocused()
    })
  })

  test.describe('Country Dropdown', () => {
    test('Full keyboard navigation cycle with 7 regions: US, ES, GB, MX, CO, CN, JP', async ({
      page,
    }) => {
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
      const coOption = page.getByTestId('app-navbar-country-option-CO')
      const cnOption = page.getByTestId('app-navbar-country-option-CN')
      const jpOption = page.getByTestId('app-navbar-country-option-JP')
      // CRITICAL: Wait for deferred focus to settle before sending keys
      await expect(usOption).toBeFocused()

      // ArrowDown through all 7 options
      await page.keyboard.press('ArrowDown')
      await expect(esOption).toBeFocused()
      await page.keyboard.press('ArrowDown')
      await expect(gbOption).toBeFocused()
      await page.keyboard.press('ArrowDown')
      await expect(mxOption).toBeFocused()
      await page.keyboard.press('ArrowDown')
      await expect(coOption).toBeFocused()
      await page.keyboard.press('ArrowDown')
      await expect(cnOption).toBeFocused()
      await page.keyboard.press('ArrowDown')
      await expect(jpOption).toBeFocused()

      // Wrap around (JP is now last, wraps to US)
      await page.keyboard.press('ArrowDown')
      await expect(usOption).toBeFocused()

      // End to last (JP is now the last)
      await page.keyboard.press('End')
      await expect(jpOption).toBeFocused()

      // Home to first
      await page.keyboard.press('Home')
      await expect(usOption).toBeFocused()

      // Navigate to GB and select
      await page.keyboard.press('ArrowDown')
      await expect(esOption).toBeFocused()
      await page.keyboard.press('ArrowDown')
      await expect(gbOption).toBeFocused()

      await page.keyboard.press('Enter')

      await expect(trigger).toHaveAttribute('aria-expanded', 'false')
      await expect(trigger).toBeFocused()

      // Verify country changed (aria-label should mention UK)
      await expect(trigger).toHaveAccessibleName(/united kingdom/i)
    })
  })

  test.describe('Currency Dropdown', () => {
    test('Keyboard navigation with ArrowUp (7 currencies: COP, USD, EUR, GBP, MXN, CNY, JPY)', async ({
      page,
    }) => {
      const trigger = page.getByTestId('app-navbar-currency-trigger')

      // Open with Enter
      await trigger.focus()
      await page.keyboard.press('Enter')
      await expect(trigger).toHaveAttribute('aria-expanded', 'true')

      // USD should be default (region US -> default currency USD)
      // Currency order per CONTRACTS v3.3.0: COP, USD, EUR, GBP, MXN, CNY, JPY
      const copOption = page.getByTestId('app-navbar-currency-option-COP')
      const usdOption = page.getByTestId('app-navbar-currency-option-USD')
      const jpyOption = page.getByTestId('app-navbar-currency-option-JPY')
      // CRITICAL: Wait for deferred focus to settle before sending keys
      await expect(usdOption).toBeFocused()

      // ArrowUp from USD (index 1) goes to COP (index 0)
      await page.keyboard.press('ArrowUp')
      await expect(copOption).toBeFocused()

      // ArrowUp from COP (index 0) wraps to JPY (index 6, the new last)
      await page.keyboard.press('ArrowUp')
      await expect(jpyOption).toBeFocused()

      // Select JPY with Enter
      await page.keyboard.press('Enter')

      await expect(trigger).toHaveAttribute('aria-expanded', 'false')
      await expect(trigger).toBeFocused()
      // aria-label uses full currency name "Japanese Yen", not currency code "JPY"
      await expect(trigger).toHaveAccessibleName(/japanese yen/i)
    })

    test('End key jumps to JPY (last currency) and Home jumps to COP (first)', async ({ page }) => {
      const trigger = page.getByTestId('app-navbar-currency-trigger')

      // Open with Enter
      await trigger.focus()
      await page.keyboard.press('Enter')
      await expect(trigger).toHaveAttribute('aria-expanded', 'true')

      const usdOption = page.getByTestId('app-navbar-currency-option-USD')
      const copOption = page.getByTestId('app-navbar-currency-option-COP')
      const jpyOption = page.getByTestId('app-navbar-currency-option-JPY')
      // CRITICAL: Wait for deferred focus
      await expect(usdOption).toBeFocused()

      // End to last (JPY)
      await page.keyboard.press('End')
      await expect(jpyOption).toBeFocused()

      // Home to first (COP)
      await page.keyboard.press('Home')
      await expect(copOption).toBeFocused()

      await page.keyboard.press('Escape')
      await expect(trigger).toHaveAttribute('aria-expanded', 'false')
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
        // CRITICAL: Wait for deferred focus to settle before sending keys
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
