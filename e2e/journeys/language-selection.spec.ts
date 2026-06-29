import { test, expect } from '@playwright/test'

test.describe('Language Selection Journey', () => {
  test.beforeEach(async ({ context }) => {
    // Playwright provides a fresh, isolated browser context per test
    // Storage is already empty - no need to clear localStorage
    await context.clearCookies()
  })

  test('Given a new user visits the app, When they view the page, Then content is in English', async ({
    page,
  }) => {
    await page.goto('/')

    await expect(page.getByTestId('greeting-title')).toHaveText('Hello')
    await expect(page.getByTestId('greeting-subtitle')).toHaveText('Welcome to the application')
    await expect(page.locator('html')).toHaveAttribute('lang', 'en')
  })

  test('Given a user on the app, When they switch to Spanish, Then all text updates', async ({
    page,
  }) => {
    // Given
    await page.goto('/')
    await expect(page.getByTestId('greeting-title')).toHaveText('Hello')

    // When
    await page.getByRole('combobox').selectOption('es')

    // Then
    await expect(page.getByTestId('greeting-title')).toHaveText('Hola')
    await expect(page.getByTestId('greeting-subtitle')).toHaveText('Bienvenido a la aplicación')
    await expect(page.locator('html')).toHaveAttribute('lang', 'es')
  })

  test('Given a user switches language multiple times, Then state remains consistent', async ({
    page,
  }) => {
    await page.goto('/')

    // Switch to Spanish
    await page.getByRole('combobox').selectOption('es')
    await expect(page.getByTestId('greeting-title')).toHaveText('Hola')

    // Switch back to English
    await page.getByRole('combobox').selectOption('en')
    await expect(page.getByTestId('greeting-title')).toHaveText('Hello')

    // Switch to Spanish again
    await page.getByRole('combobox').selectOption('es')
    await expect(page.getByTestId('greeting-title')).toHaveText('Hola')
  })
})
