import { render, screen, fireEvent } from '@testing-library/react'
import { App } from './App'
import { themePreferenceSignal, osPrefersDarkSignal } from '../../../theme/signals/theme-signal'
import { localeSignal } from '../../../i18n/signals/locale-signal'
import { regionSignal } from '../../../region/signals/region-signal'
import { currencySignal, userOverriddenSignal } from '../../../currency/signals/currency-signal'
import { ratesStateSignal } from '../../../exchange-rates/signals/rates-signal'
import * as GeoDetectionHook from '../../../geo-detection/hooks/useGeoDetection'

// Mock the exchange-rates module to prevent actual network calls
jest.mock('../../../exchange-rates', () => ({
  ...jest.requireActual('../../../exchange-rates'),
  initializeRates: jest.fn(), // No-op to prevent overwriting our mock state
}))

// Mock the geo-detection hook to prevent actual detection calls
jest.mock('../../../geo-detection/hooks/useGeoDetection')

const mockUseGeoDetection = GeoDetectionHook.useGeoDetection as jest.Mock

describe('App', () => {
  let matchMediaMock: jest.Mock

  beforeEach(() => {
    localStorage.clear()
    document.documentElement.lang = 'en'
    document.documentElement.removeAttribute('data-theme')

    // Reset signals
    themePreferenceSignal.value = 'system'
    osPrefersDarkSignal.value = false
    localeSignal.value = 'en'
    regionSignal.value = 'US'
    currencySignal.value = 'USD'
    userOverriddenSignal.value = false

    // Set mock rates for testing
    ratesStateSignal.value = {
      status: 'live',
      rates: {
        USD: { copPerUnit: 3284.6715, sourceDate: new Date(), retrievedAt: new Date() },
        EUR: { copPerUnit: 3750.0, sourceDate: new Date(), retrievedAt: new Date() },
        GBP: { copPerUnit: 4411.7647, sourceDate: new Date(), retrievedAt: new Date() },
        MXN: { copPerUnit: 187.9699, sourceDate: new Date(), retrievedAt: new Date() },
      },
    }

    // Mock matchMedia
    matchMediaMock = jest.fn().mockReturnValue({
      matches: false,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    })
    window.matchMedia = matchMediaMock
  })

  describe('Given the App is rendered', () => {
    it('Then it renders the app container', () => {
      render(<App />)
      expect(screen.getByTestId('app')).toBeInTheDocument()
    })

    it('Then it renders the Navbar', () => {
      render(<App />)
      expect(screen.getByTestId('app-navbar')).toBeInTheDocument()
    })

    it('Then it renders the Greeting', () => {
      render(<App />)
      expect(screen.getByTestId('app-greeting')).toBeInTheDocument()
    })

    it('Then it syncs html lang attribute', () => {
      render(<App />)
      expect(document.documentElement.lang).toBe('en')
    })

    it('Then it sets data-theme attribute', () => {
      render(<App />)
      // Default preference is 'system', OS prefers light -> effective is light
      expect(document.documentElement.getAttribute('data-theme')).toBe('light')
    })
  })

  describe('Given the user selects a language via dropdown', () => {
    it('When Spanish is selected, Then all text updates', () => {
      render(<App />)

      // Initially English
      expect(screen.getByTestId('app-greeting-title')).toHaveTextContent('Hello')

      // Open language dropdown and select Spanish
      fireEvent.click(screen.getByTestId('app-navbar-language-trigger'))
      fireEvent.click(screen.getByTestId('app-navbar-language-option-es'))

      // Now Spanish
      expect(screen.getByTestId('app-greeting-title')).toHaveTextContent('Hola')
      expect(document.documentElement.lang).toBe('es')
    })
  })

  describe('Given the user clicks the theme button (ADR-0009: tri-state cycle)', () => {
    it('When clicked once from system default, Then preference changes to light', () => {
      render(<App />)

      // Default is system
      expect(themePreferenceSignal.value).toBe('system')

      // Click theme button (cycles: system -> light)
      fireEvent.click(screen.getByTestId('app-navbar-theme-button'))

      expect(themePreferenceSignal.value).toBe('light')
    })

    it('When clicked twice, Then preference changes to dark', () => {
      render(<App />)

      // Click twice: system -> light -> dark
      fireEvent.click(screen.getByTestId('app-navbar-theme-button'))
      fireEvent.click(screen.getByTestId('app-navbar-theme-button'))

      expect(themePreferenceSignal.value).toBe('dark')
    })

    it('When clicked three times, Then preference cycles back to system', () => {
      render(<App />)

      // Click three times: system -> light -> dark -> system
      fireEvent.click(screen.getByTestId('app-navbar-theme-button'))
      fireEvent.click(screen.getByTestId('app-navbar-theme-button'))
      fireEvent.click(screen.getByTestId('app-navbar-theme-button'))

      expect(themePreferenceSignal.value).toBe('system')
    })
  })

  describe('Given the user selects a country via dropdown', () => {
    it('When Spain is selected, Then region changes', () => {
      render(<App />)

      expect(regionSignal.value).toBe('US')

      // Open country dropdown and select Spain
      fireEvent.click(screen.getByTestId('app-navbar-country-trigger'))
      fireEvent.click(screen.getByTestId('app-navbar-country-option-ES'))

      expect(regionSignal.value).toBe('ES')
    })

    it('Then formatted date updates', () => {
      render(<App />)

      // Open country dropdown and select Spain
      fireEvent.click(screen.getByTestId('app-navbar-country-trigger'))
      fireEvent.click(screen.getByTestId('app-navbar-country-option-ES'))

      // Date format should update (region affects date formatting)
      const dateElement = screen.getByTestId('app-greeting-date')
      expect(dateElement).toBeInTheDocument()
    })
  })

  describe('Given the user selects a currency via dropdown', () => {
    it('When Euro is selected, Then currency changes', () => {
      render(<App />)

      expect(currencySignal.value).toBe('USD')

      // Open currency dropdown and select Euro
      fireEvent.click(screen.getByTestId('app-navbar-currency-trigger'))
      fireEvent.click(screen.getByTestId('app-navbar-currency-option-EUR'))

      expect(currencySignal.value).toBe('EUR')
    })

    it('Then formatted price updates', () => {
      render(<App />)

      // Initial USD format (converted from 4500 COP)
      const priceElement = screen.getByTestId('app-greeting-price-value')
      expect(priceElement.textContent).toBe('$1.37 USD')

      // Open currency dropdown and select Euro
      fireEvent.click(screen.getByTestId('app-navbar-currency-trigger'))
      fireEvent.click(screen.getByTestId('app-navbar-currency-option-EUR'))

      // EUR format (converted from 4500 COP)
      expect(priceElement.textContent).toBe('EUR1.20 EUR')
    })
  })

  describe('Given custom props are provided', () => {
    it('When dataTestId is provided, Then the custom test ID is used', () => {
      render(<App dataTestId='custom-app' />)
      expect(screen.getByTestId('custom-app')).toBeInTheDocument()
    })
  })
})

describe('Geo detection integration', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.lang = 'en'
    document.documentElement.removeAttribute('data-theme')
    themePreferenceSignal.value = 'system'
    osPrefersDarkSignal.value = false
    localeSignal.value = 'en'
    regionSignal.value = 'US'
    currencySignal.value = 'USD'
    userOverriddenSignal.value = false
    window.matchMedia = jest.fn().mockReturnValue({
      matches: false,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    })
  })

  it('calls useGeoDetection with onDetected callback', () => {
    mockUseGeoDetection.mockClear()

    render(<App />)

    expect(mockUseGeoDetection).toHaveBeenCalledWith(
      expect.objectContaining({
        onDetected: expect.any(Function),
      })
    )
  })

  describe('ADR-0014 Three-Path Matrix', () => {
    let capturedCallback: (result: {
      locale: string
      region: string
      currency: string
      source: string
    }) => void

    beforeEach(() => {
      mockUseGeoDetection.mockImplementation(
        (options: { onDetected?: typeof capturedCallback }) => {
          if (options.onDetected) {
            capturedCallback = options.onDetected
          }
        }
      )
      // Reset to known state
      localeSignal.value = 'en'
      regionSignal.value = 'US'
      currencySignal.value = 'USD'
      userOverriddenSignal.value = false
    })

    describe('PATH 1: Full detection success (gps/ip)', () => {
      it('GPS source: applies all three prefs and locks currency', () => {
        render(<App />)
        capturedCallback!({ locale: 'es', region: 'CO', currency: 'COP', source: 'gps' })

        expect(localeSignal.value).toBe('es')
        expect(regionSignal.value).toBe('CO')
        expect(currencySignal.value).toBe('COP')
        expect(userOverriddenSignal.value).toBe(true)
      })

      it('IP source: applies all three prefs and locks currency', () => {
        render(<App />)
        capturedCallback!({ locale: 'ja', region: 'JP', currency: 'JPY', source: 'ip' })

        expect(localeSignal.value).toBe('ja')
        expect(regionSignal.value).toBe('JP')
        expect(currencySignal.value).toBe('JPY')
        expect(userOverriddenSignal.value).toBe(true)
      })
    })

    describe('PATH 2: Device-language fallback', () => {
      it('applies ONLY locale, leaves region/currency pristine', () => {
        render(<App />)
        // device-language only provides locale, region/currency are defaults
        capturedCallback!({
          locale: 'es',
          region: 'US',
          currency: 'USD',
          source: 'device-language',
        })

        // Locale should change
        expect(localeSignal.value).toBe('es')
        // Region should stay pristine (unchanged from initial US)
        expect(regionSignal.value).toBe('US')
        // Currency should stay pristine (unchanged from initial USD)
        expect(currencySignal.value).toBe('USD')
        // userOverridden should stay false - sync must remain functional
        expect(userOverriddenSignal.value).toBe(false)
      })

      it('does NOT lock currency - region sync remains functional', () => {
        render(<App />)
        capturedCallback!({
          locale: 'ja',
          region: 'US',
          currency: 'USD',
          source: 'device-language',
        })

        // userOverridden must be false so syncCurrencyToRegion works
        expect(userOverriddenSignal.value).toBe(false)
      })

      it('ignores invalid locale in device-language fallback', () => {
        render(<App />)
        // device-language with invalid locale - should not change anything
        capturedCallback!({
          locale: 'invalid',
          region: 'US',
          currency: 'USD',
          source: 'device-language',
        })

        // Locale should stay unchanged
        expect(localeSignal.value).toBe('en')
        // Region stays pristine
        expect(regionSignal.value).toBe('US')
        // Currency stays pristine
        expect(currencySignal.value).toBe('USD')
        // userOverridden stays false
        expect(userOverriddenSignal.value).toBe(false)
      })
    })

    describe('PATH 3: Total failure (default)', () => {
      it('applies NOTHING - all signals stay pristine', () => {
        render(<App />)
        // Set non-default values first to prove nothing changes
        localeSignal.value = 'zh'
        regionSignal.value = 'CN'
        currencySignal.value = 'CNY'

        capturedCallback!({ locale: 'en', region: 'US', currency: 'USD', source: 'default' })

        // Nothing should change
        expect(localeSignal.value).toBe('zh')
        expect(regionSignal.value).toBe('CN')
        expect(currencySignal.value).toBe('CNY')
        expect(userOverriddenSignal.value).toBe(false)
      })

      it('does NOT lock currency - region sync remains functional', () => {
        render(<App />)
        capturedCallback!({ locale: 'en', region: 'US', currency: 'USD', source: 'default' })

        expect(userOverriddenSignal.value).toBe(false)
      })
    })
  })

  it('handleGeoDetected ignores invalid values in full detection', () => {
    let capturedCallback: (result: {
      locale: string
      region: string
      currency: string
      source: string
    }) => void

    mockUseGeoDetection.mockImplementation((options: { onDetected?: typeof capturedCallback }) => {
      if (options.onDetected) {
        capturedCallback = options.onDetected
      }
    })

    render(<App />)

    // Reset to known state
    localeSignal.value = 'en'
    regionSignal.value = 'US'
    currencySignal.value = 'USD'

    // Simulate with invalid values - should not throw or change valid signals
    capturedCallback!({ locale: 'invalid', region: 'XX', currency: 'ZZZ', source: 'ip' })

    // Should not change from defaults
    expect(localeSignal.value).toBe('en')
    expect(regionSignal.value).toBe('US')
    expect(currencySignal.value).toBe('USD')
  })
})
