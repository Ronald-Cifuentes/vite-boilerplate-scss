import { render, screen, fireEvent, act, waitFor } from '@testing-library/react'
import { App } from './App'
import { themePreferenceSignal } from '../../../theme/signals/theme-signal'
import { localeSignal } from '../../../i18n/signals/locale-signal'
import { regionSignal } from '../../../region/signals/region-signal'
import { currencySignal, userOverriddenSignal } from '../../../currency/signals/currency-signal'
import { LOCALE_STORAGE_KEY } from '../../../i18n/config/locales'
import { REGION_STORAGE_KEY } from '../../../region/config/regions'
import { CURRENCY_STORAGE_KEY } from '../../../currency/config/currencies'
import * as GeoDetectionHook from '../../../geo-detection/hooks/useGeoDetection'
import { resetAppState } from '../../test/act-utils'

// Mock the exchange-rates module to prevent actual network calls
jest.mock('../../../exchange-rates', () => ({
  ...jest.requireActual('../../../exchange-rates'),
  initializeRates: jest.fn(), // No-op to prevent overwriting our mock state
}))

// Mock the geo-detection hook to prevent actual detection calls
jest.mock('../../../geo-detection/hooks/useGeoDetection')

// Mock the lazy locale loading to be synchronous for tests
// This prevents the async promise from triggering act() violations
jest.mock('../../../i18n/translations', () => ({
  translations: {
    en: { greeting: { hello: 'Hello' } },
    es: { greeting: { hello: 'Hola' } },
    zh: { greeting: { hello: '你好' } },
    ja: { greeting: { hello: 'こんにちは' } },
  },
  isLocaleLoaded: (): boolean => true, // Pretend all locales are already loaded
  loadLocale: async (): Promise<void> => {}, // No-op since already "loaded"
}))

const mockUseGeoDetection = GeoDetectionHook.useGeoDetection as jest.Mock

describe('App', () => {
  let matchMediaMock: jest.Mock

  beforeEach(() => {
    // Use consolidated reset - act-wrapped and includes all signals
    resetAppState()

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

      fireEvent.click(screen.getByTestId('app-navbar-language-trigger'))
      fireEvent.click(screen.getByTestId('app-navbar-language-option-es'))

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

      fireEvent.click(screen.getByTestId('app-navbar-country-trigger'))
      fireEvent.click(screen.getByTestId('app-navbar-country-option-ES'))

      expect(regionSignal.value).toBe('ES')
    })

    it('Then formatted date updates', () => {
      render(<App />)

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

      fireEvent.click(screen.getByTestId('app-navbar-currency-trigger'))
      fireEvent.click(screen.getByTestId('app-navbar-currency-option-EUR'))

      expect(currencySignal.value).toBe('EUR')
    })

    it('Then formatted price updates', () => {
      render(<App />)

      // Initial USD format (converted from 4500 COP)
      const priceElement = screen.getByTestId('app-greeting-price-value')
      expect(priceElement.textContent).toBe('$1.37 USD')

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
    // Use consolidated reset - act-wrapped
    resetAppState()

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
    })

    describe('PATH 1: Full detection success (gps/ip)', () => {
      it('GPS source: applies all three prefs and locks currency', async () => {
        render(<App />)
        // Wrap callback invocation in act - it triggers signal writes
        act(() => {
          capturedCallback!({ locale: 'es', region: 'CO', currency: 'COP', source: 'gps' })
        })

        await waitFor(() => {
          expect(localeSignal.value).toBe('es')
        })
        expect(regionSignal.value).toBe('CO')
        expect(currencySignal.value).toBe('COP')
        expect(userOverriddenSignal.value).toBe(true)
      })

      it('IP source: applies all three prefs and locks currency', async () => {
        render(<App />)
        // Wrap callback invocation in act - it triggers signal writes
        act(() => {
          capturedCallback!({ locale: 'ja', region: 'JP', currency: 'JPY', source: 'ip' })
        })

        // Wait for any async updates to settle (locale lazy loading is mocked to be sync)
        await waitFor(() => {
          expect(localeSignal.value).toBe('ja')
        })
        expect(regionSignal.value).toBe('JP')
        expect(currencySignal.value).toBe('JPY')
        expect(userOverriddenSignal.value).toBe(true)
      })
    })

    describe('PATH 2: Device-language fallback', () => {
      it('applies ONLY locale, leaves region/currency pristine', async () => {
        render(<App />)
        // device-language only provides locale, region/currency are defaults
        act(() => {
          capturedCallback!({
            locale: 'es',
            region: 'US',
            currency: 'USD',
            source: 'device-language',
          })
        })

        await waitFor(() => {
          expect(localeSignal.value).toBe('es')
        })
        // Region should stay pristine (unchanged from initial US)
        expect(regionSignal.value).toBe('US')
        // Currency should stay pristine (unchanged from initial USD)
        expect(currencySignal.value).toBe('USD')
        // userOverridden should stay false - sync must remain functional
        expect(userOverriddenSignal.value).toBe(false)
      })

      it('does NOT lock currency - region sync remains functional', async () => {
        render(<App />)
        act(() => {
          capturedCallback!({
            locale: 'ja',
            region: 'US',
            currency: 'USD',
            source: 'device-language',
          })
        })

        // Wait for async updates to settle
        await waitFor(() => {
          expect(localeSignal.value).toBe('ja')
        })
        // userOverridden must be false so syncCurrencyToRegion works
        expect(userOverriddenSignal.value).toBe(false)
      })

      it('ignores invalid locale in device-language fallback', () => {
        render(<App />)
        // device-language with invalid locale - should not change anything
        act(() => {
          capturedCallback!({
            locale: 'invalid',
            region: 'US',
            currency: 'USD',
            source: 'device-language',
          })
        })

        expect(localeSignal.value).toBe('en')
        expect(regionSignal.value).toBe('US')
        expect(currencySignal.value).toBe('USD')
        expect(userOverriddenSignal.value).toBe(false)
      })
    })

    describe('PATH 3: Total failure (default)', () => {
      it('applies NOTHING - all signals stay pristine', () => {
        // Pre-populate localStorage so providers preserve these values on mount
        localStorage.setItem(LOCALE_STORAGE_KEY, 'zh')
        localStorage.setItem(REGION_STORAGE_KEY, 'CN')
        localStorage.setItem(CURRENCY_STORAGE_KEY, 'CNY')

        render(<App />)

        // Verify the values were preserved through mount
        expect(localeSignal.value).toBe('zh')
        expect(regionSignal.value).toBe('CN')
        expect(currencySignal.value).toBe('CNY')

        act(() => {
          capturedCallback!({ locale: 'en', region: 'US', currency: 'USD', source: 'default' })
        })

        // Nothing should change - source: 'default' does nothing
        expect(localeSignal.value).toBe('zh')
        expect(regionSignal.value).toBe('CN')
        expect(currencySignal.value).toBe('CNY')
        expect(userOverriddenSignal.value).toBe(false)
      })

      it('does NOT lock currency - region sync remains functional', () => {
        render(<App />)
        act(() => {
          capturedCallback!({ locale: 'en', region: 'US', currency: 'USD', source: 'default' })
        })

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

    // Simulate with invalid values - should not throw or change valid signals
    act(() => {
      capturedCallback!({ locale: 'invalid', region: 'XX', currency: 'ZZZ', source: 'ip' })
    })

    // Should not change from defaults
    expect(localeSignal.value).toBe('en')
    expect(regionSignal.value).toBe('US')
    expect(currencySignal.value).toBe('USD')
  })
})
