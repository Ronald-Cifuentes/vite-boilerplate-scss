import { test, expect } from '@playwright/test'

test.describe('Theme Persistence (Tri-State per ADR-0009)', () => {
  test.describe('Preference persistence across page reloads', () => {
    test('persists light preference across page reloads', async ({ page }) => {
      await page.goto('/')

      // Find theme button and click to cycle: system -> light
      const themeButton = page.getByTestId('app-navbar-theme-button')

      // Default is system, first click goes to light
      await themeButton.click()
      await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')

      // Reload the page
      await page.reload()

      // Theme should persist as light
      await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
    })

    test('persists dark preference across page reloads', async ({ page }) => {
      await page.goto('/')

      const themeButton = page.getByTestId('app-navbar-theme-button')

      // Cycle: system -> light -> dark
      await themeButton.click() // light
      await themeButton.click() // dark
      await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')

      // Reload the page
      await page.reload()

      // Theme should persist as dark
      await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
    })

    test('persists system preference across page reloads', async ({ page }) => {
      await page.goto('/')

      const themeButton = page.getByTestId('app-navbar-theme-button')

      // Cycle: system -> light -> dark -> system
      await themeButton.click() // light
      await themeButton.click() // dark
      await themeButton.click() // system
      await expect(themeButton).toHaveAccessibleName(/system/i)

      // Reload the page
      await page.reload()

      // Preference should still be system (resolved based on OS)
      await expect(page.getByTestId('app-navbar-theme-button')).toHaveAccessibleName(/system/i)
    })
  })

  test.describe('Tri-state cycle order', () => {
    test('cycles light -> dark -> system -> light', async ({ page }) => {
      // Set initial state to light
      await page.goto('/')
      const themeButton = page.getByTestId('app-navbar-theme-button')

      // Cycle to light first (from system default)
      await themeButton.click()
      await expect(themeButton).toHaveAccessibleName(/light mode/i)
      await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')

      // light -> dark
      await themeButton.click()
      await expect(themeButton).toHaveAccessibleName(/dark mode/i)
      await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')

      // dark -> system
      await themeButton.click()
      await expect(themeButton).toHaveAccessibleName(/system theme/i)

      // system -> light
      await themeButton.click()
      await expect(themeButton).toHaveAccessibleName(/light mode/i)
      await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
    })

    test('icon changes per preference', async ({ page }) => {
      await page.goto('/')
      const themeButton = page.getByTestId('app-navbar-theme-button')

      // Get initial icon (system)
      const systemIcon = await themeButton.locator('svg').innerHTML()

      // Cycle to light
      await themeButton.click()
      const lightIcon = await themeButton.locator('svg').innerHTML()
      expect(lightIcon).not.toBe(systemIcon)

      // Cycle to dark
      await themeButton.click()
      const darkIcon = await themeButton.locator('svg').innerHTML()
      expect(darkIcon).not.toBe(lightIcon)
      expect(darkIcon).not.toBe(systemIcon)

      // Cycle back to system
      await themeButton.click()
      const systemIconAgain = await themeButton.locator('svg').innerHTML()
      expect(systemIconAgain).toBe(systemIcon)
    })
  })

  test.describe('System preference follows OS live', () => {
    test('system follows OS LIVE: dark -> light without reload', async ({ page }) => {
      // Start with OS preferring dark
      await page.emulateMedia({ colorScheme: 'dark' })
      await page.goto('/')

      // Default preference is 'system', so should show dark
      await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
      const themeButton = page.getByTestId('app-navbar-theme-button')
      await expect(themeButton).toHaveAccessibleName(/system theme/i)

      // Change OS preference to light WITHOUT reload
      await page.emulateMedia({ colorScheme: 'light' })

      // data-theme should flip to light automatically
      await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')

      // Preference is still 'system' (icon should still show system)
      await expect(themeButton).toHaveAccessibleName(/system theme/i)
    })

    test('system follows OS LIVE: light -> dark without reload', async ({ page }) => {
      // Start with OS preferring light
      await page.emulateMedia({ colorScheme: 'light' })
      await page.goto('/')

      // Default preference is 'system', should show light
      await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')

      // Change OS preference to dark WITHOUT reload
      await page.emulateMedia({ colorScheme: 'dark' })

      // data-theme should flip to dark automatically
      await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
    })

    test('explicit preference ignores OS changes', async ({ page }) => {
      await page.emulateMedia({ colorScheme: 'light' })
      await page.goto('/')

      const themeButton = page.getByTestId('app-navbar-theme-button')

      // Set explicit dark preference: system -> light -> dark
      await themeButton.click() // light
      await themeButton.click() // dark
      await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')

      // Change OS to light
      await page.emulateMedia({ colorScheme: 'light' })

      // Theme should stay dark (explicit preference)
      await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
    })
  })

  test.describe('FOUC prevention', () => {
    test('data-theme is set synchronously (no flash)', async ({ page }) => {
      await page.goto('/')

      // Verify the FOUC prevention script has set the theme attribute
      const theme = await page.locator('html').getAttribute('data-theme')
      expect(theme).toMatch(/^(light|dark)$/)
      expect(theme).toBeTruthy()
    })

    test('FOUC script resolves system preference via matchMedia', async ({ page }) => {
      // Emulate dark mode preference
      await page.emulateMedia({ colorScheme: 'dark' })
      await page.goto('/')

      // FOUC script should have resolved 'system' (or absent) to 'dark'
      await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
    })

    test('FOUC script respects explicit light preference', async ({ page, context }) => {
      // Set preference to light in storage
      await context.addInitScript(() => {
        localStorage.setItem('app-theme', 'light')
      })

      // Emulate dark OS preference
      await page.emulateMedia({ colorScheme: 'dark' })
      await page.goto('/')

      // FOUC script should use stored 'light', not OS preference
      await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
    })

    test('FOUC script respects explicit dark preference', async ({ page, context }) => {
      // Set preference to dark in storage
      await context.addInitScript(() => {
        localStorage.setItem('app-theme', 'dark')
      })

      // Emulate light OS preference
      await page.emulateMedia({ colorScheme: 'light' })
      await page.goto('/')

      // FOUC script should use stored 'dark', not OS preference
      await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
    })

    test('FOUC script handles stored system value via matchMedia', async ({ page, context }) => {
      // Set preference to 'system' in storage
      await context.addInitScript(() => {
        localStorage.setItem('app-theme', 'system')
      })

      // Emulate dark OS preference
      await page.emulateMedia({ colorScheme: 'dark' })
      await page.goto('/')

      // FOUC script should resolve 'system' via matchMedia -> dark
      await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
    })
  })

  test.describe('Default preference', () => {
    test('new users default to system preference', async ({ page, context }) => {
      // Clear storage
      await context.clearCookies()

      await page.goto('/')

      const themeButton = page.getByTestId('app-navbar-theme-button')
      await expect(themeButton).toHaveAccessibleName(/system theme/i)
    })
  })

  test.describe('Backward compatibility', () => {
    test('existing light preference in localStorage still works', async ({ page, context }) => {
      await context.addInitScript(() => {
        localStorage.setItem('app-theme', 'light')
      })

      await page.goto('/')

      const themeButton = page.getByTestId('app-navbar-theme-button')
      await expect(themeButton).toHaveAccessibleName(/light mode/i)
      await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
    })

    test('existing dark preference in localStorage still works', async ({ page, context }) => {
      await context.addInitScript(() => {
        localStorage.setItem('app-theme', 'dark')
      })

      await page.goto('/')

      const themeButton = page.getByTestId('app-navbar-theme-button')
      await expect(themeButton).toHaveAccessibleName(/dark mode/i)
      await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
    })
  })
})
