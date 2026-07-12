import { test, expect } from '../helpers/fixtures'

test.describe('Language Selection Journey', () => {
  test.beforeEach(async ({ page, context }) => {
    // Playwright provides a fresh, isolated browser context per test
    // Storage is already empty - no need to clear localStorage
    await context.clearCookies()

    // Mock geo detection to return US defaults - ensures English locale
    // (ADR-0014: E2E tests need deterministic initial state)
    await context.clearPermissions() // GPS denied
    await page.route('https://api.country.is/', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ ip: '1.2.3.4', country: 'US' }),
      })
    })
    await page.route('https://get.geojs.io/v1/ip/country.json', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ country: 'US', ip: '1.2.3.4' }),
      })
    })
  })

  test('Given a new user visits the app, When they view the page, Then content is in English', async ({
    page,
  }) => {
    await page.goto('/')

    await expect(page.getByTestId('app-greeting-title')).toHaveText('Hello')
    await expect(page.getByTestId('app-greeting-subtitle')).toHaveText('Welcome to the application')
    await expect(page.locator('html')).toHaveAttribute('lang', 'en')
  })

  test('Given a user on the app, When they switch to Spanish, Then all text updates', async ({
    page,
  }) => {
    // Given
    await page.goto('/')
    await expect(page.getByTestId('app-greeting-title')).toHaveText('Hello')

    // When - open language dropdown and select Spanish
    const langTrigger = page.getByTestId('app-navbar-language-trigger')
    await langTrigger.click()
    await page.getByTestId('app-navbar-language-option-es').click()

    // Then
    await expect(page.getByTestId('app-greeting-title')).toHaveText('Hola')
    await expect(page.getByTestId('app-greeting-subtitle')).toHaveText('Bienvenido a la aplicacion')
    await expect(page.locator('html')).toHaveAttribute('lang', 'es')
  })

  test('Given a user switches language multiple times, Then state remains consistent', async ({
    page,
  }) => {
    await page.goto('/')
    const langTrigger = page.getByTestId('app-navbar-language-trigger')

    // Switch to Spanish
    await langTrigger.click()
    await page.getByTestId('app-navbar-language-option-es').click()
    await expect(page.getByTestId('app-greeting-title')).toHaveText('Hola')

    // Switch back to English
    await langTrigger.click()
    await page.getByTestId('app-navbar-language-option-en').click()
    await expect(page.getByTestId('app-greeting-title')).toHaveText('Hello')

    // Switch to Spanish again
    await langTrigger.click()
    await page.getByTestId('app-navbar-language-option-es').click()
    await expect(page.getByTestId('app-greeting-title')).toHaveText('Hola')
  })

  /**
   * PROOF TEST: Chinese locale renders actual zh UI strings (not just option existing).
   * Proves zh.ts translations are complete and wired up correctly.
   */
  test('Given a user on the app, When they switch to Chinese, Then UI renders in Chinese', async ({
    page,
  }) => {
    await page.goto('/')
    await expect(page.getByTestId('app-greeting-title')).toHaveText('Hello')

    const langTrigger = page.getByTestId('app-navbar-language-trigger')
    await langTrigger.click()
    await page.getByTestId('app-navbar-language-option-zh').click()

    // Verify actual Chinese UI strings render (not just lang attribute)
    await expect(page.getByTestId('app-greeting-title')).toHaveText('你好')
    await expect(page.getByTestId('app-greeting-subtitle')).toHaveText('欢迎使用本应用')
    await expect(page.locator('html')).toHaveAttribute('lang', 'zh')
  })

  /**
   * PROOF TEST: Japanese locale renders actual ja UI strings.
   * Proves ja.ts translations are complete and wired up correctly.
   */
  test('Given a user on the app, When they switch to Japanese, Then UI renders in Japanese', async ({
    page,
  }) => {
    await page.goto('/')
    await expect(page.getByTestId('app-greeting-title')).toHaveText('Hello')

    const langTrigger = page.getByTestId('app-navbar-language-trigger')
    await langTrigger.click()
    await page.getByTestId('app-navbar-language-option-ja').click()

    // Verify actual Japanese UI strings render (not just lang attribute)
    await expect(page.getByTestId('app-greeting-title')).toHaveText('こんにちは')
    await expect(page.getByTestId('app-greeting-subtitle')).toHaveText('アプリケーションへようこそ')
    await expect(page.locator('html')).toHaveAttribute('lang', 'ja')
  })
})
