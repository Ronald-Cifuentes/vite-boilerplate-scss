import { render, screen, RenderResult, waitFor, act } from '@testing-library/react'
import { Greeting } from './Greeting'
import { I18nProvider } from '../../../../i18n'
import { localeSignal } from '../../../../i18n/signals/locale-signal'
import { RegionProvider, type SupportedRegion } from '../../../../region'
import { regionSignal } from '../../../../region/signals/region-signal'
import { ThemeProvider } from '../../../../theme'
import { CurrencyProvider, type SupportedCurrency } from '../../../../currency'
import { currencySignal, userOverriddenSignal } from '../../../../currency/signals/currency-signal'
import { ratesStateSignal } from '../../../../exchange-rates/signals/rates-signal'
import { DEFAULT_MOCK_RATES } from '../../.././../shared/test/act-utils'

describe('Greeting', () => {
  beforeEach(() => {
    // Reset signals before each test - wrapped in act
    localStorage.clear()
    act(() => {
      localeSignal.value = 'en'
      regionSignal.value = 'US'
      currencySignal.value = 'USD'
      userOverriddenSignal.value = false
      // Set mock rates for testing - these produce the exact user example values
      // $4,500 COP = $1.37 USD = EUR1.20 EUR = MX$23.94 MXN = GBP1.02 GBP
      ratesStateSignal.value = DEFAULT_MOCK_RATES
    })
  })

  interface RenderOptions {
    locale?: 'en' | 'es'
    region?: SupportedRegion
    currency?: SupportedCurrency
    props?: Record<string, unknown>
  }

  const renderWithProviders = (options: RenderOptions = {}): RenderResult => {
    const { locale = 'en', region = 'US', currency = 'USD', props = {} } = options
    return render(
      <ThemeProvider>
        <RegionProvider initialRegion={region}>
          <CurrencyProvider initialCurrency={currency}>
            <I18nProvider initialLocale={locale}>
              <Greeting {...props} />
            </I18nProvider>
          </CurrencyProvider>
        </RegionProvider>
      </ThemeProvider>
    )
  }

  describe('Given the Greeting component is rendered in English', () => {
    it('Then it displays the English greeting', () => {
      renderWithProviders({ locale: 'en' })

      expect(screen.getByTestId('greeting-title')).toHaveTextContent('Hello')
      expect(screen.getByTestId('greeting-subtitle')).toHaveTextContent(
        'Welcome to the application'
      )
    })
  })

  describe('Given the Greeting component is rendered in Spanish', () => {
    it('Then it displays the Spanish greeting', () => {
      renderWithProviders({ locale: 'es' })

      expect(screen.getByTestId('greeting-title')).toHaveTextContent('Hola')
      expect(screen.getByTestId('greeting-subtitle')).toHaveTextContent(
        'Bienvenido a la aplicacion'
      )
    })
  })

  describe('Given the Greeting component shows formatted date and price', () => {
    it('Then it displays date formatted for US region', () => {
      renderWithProviders({ locale: 'en', region: 'US' })

      expect(screen.getByTestId('greeting-date')).toBeInTheDocument()
    })

    it('Then it displays price for COP currency (identity conversion)', () => {
      renderWithProviders({ locale: 'en', region: 'US', currency: 'COP' })

      const priceElement = screen.getByTestId('greeting-price-value')
      // Base price is 4500 COP, displayed as $4,500 COP
      expect(priceElement.textContent).toBe('$4,500 COP')
    })

    it('Then it displays price converted to USD', async () => {
      renderWithProviders({ locale: 'en', region: 'US', currency: 'USD' })

      await waitFor(() => {
        const priceElement = screen.getByTestId('greeting-price-value')
        // 4500 / 3284.6715 = 1.37
        expect(priceElement.textContent).toBe('$1.37 USD')
      })
    })

    it('Then it displays price converted to GBP', async () => {
      renderWithProviders({ locale: 'en', region: 'GB', currency: 'GBP' })

      await waitFor(() => {
        const priceElement = screen.getByTestId('greeting-price-value')
        // 4500 / 4411.7647 = 1.02
        expect(priceElement.textContent).toBe('GBP1.02 GBP')
      })
    })

    it('Then it displays price converted to EUR', async () => {
      renderWithProviders({ locale: 'es', region: 'ES', currency: 'EUR' })

      await waitFor(() => {
        const priceElement = screen.getByTestId('greeting-price-value')
        // 4500 / 3750 = 1.20
        expect(priceElement.textContent).toBe('EUR1.20 EUR')
      })
    })

    it('Then it displays price converted to MXN', async () => {
      renderWithProviders({ locale: 'en', region: 'MX', currency: 'MXN' })

      await waitFor(() => {
        const priceElement = screen.getByTestId('greeting-price-value')
        // 4500 / 187.9699 = 23.94
        expect(priceElement.textContent).toBe('MX$23.94 MXN')
      })
    })
  })

  describe('Given rates are unavailable', () => {
    it('Then it falls back to COP display', () => {
      act(() => {
        ratesStateSignal.value = {
          status: 'unavailable',
          rates: {},
          error: 'All rate sources failed',
        }
      })

      renderWithProviders({ locale: 'en', currency: 'USD' })

      const priceElement = screen.getByTestId('greeting-price-value')
      // Fallback to COP when rate unavailable
      expect(priceElement.textContent).toBe('$4,500 COP')
    })

    it('Then it shows unavailable status indicator', () => {
      act(() => {
        ratesStateSignal.value = {
          status: 'unavailable',
          rates: {},
          error: 'All rate sources failed',
        }
      })

      renderWithProviders({ locale: 'en', currency: 'USD' })

      const statusElement = screen.getByTestId('greeting-rate-status')
      expect(statusElement.textContent).toContain('Rates unavailable')
    })
  })

  describe('Given rates are loading', () => {
    it('Then it shows loading status indicator', () => {
      act(() => {
        ratesStateSignal.value = {
          status: 'loading',
          rates: {},
        }
      })

      renderWithProviders({ locale: 'en', currency: 'USD' })

      const statusElement = screen.getByTestId('greeting-rate-status')
      expect(statusElement.textContent).toContain('Loading rates')
    })
  })

  describe('Given rates are stale', () => {
    it('Then it shows stale status indicator with hours and minutes', () => {
      act(() => {
        ratesStateSignal.value = {
          status: 'stale',
          rates: {
            USD: { copPerUnit: 3284.6715, sourceDate: new Date(), retrievedAt: new Date() },
          },
          staleAgeMs: 2 * 60 * 60 * 1000 + 30 * 60 * 1000, // 2h 30m
        }
      })

      renderWithProviders({ locale: 'en', currency: 'USD' })

      const statusElement = screen.getByTestId('greeting-rate-status')
      expect(statusElement.textContent).toContain('2h 30m')
    })

    it('Then it shows stale status indicator with only minutes when less than 1 hour', () => {
      act(() => {
        ratesStateSignal.value = {
          status: 'stale',
          rates: {
            USD: { copPerUnit: 3284.6715, sourceDate: new Date(), retrievedAt: new Date() },
          },
          staleAgeMs: 45 * 60 * 1000, // 45 minutes
        }
      })

      renderWithProviders({ locale: 'en', currency: 'USD' })

      const statusElement = screen.getByTestId('greeting-rate-status')
      expect(statusElement.textContent).toContain('45m')
    })

    it('Then it shows stale status indicator with fallback when staleAgeMs is missing', () => {
      act(() => {
        ratesStateSignal.value = {
          status: 'stale',
          rates: {
            USD: { copPerUnit: 3284.6715, sourceDate: new Date(), retrievedAt: new Date() },
          },
          // No staleAgeMs
        }
      })

      renderWithProviders({ locale: 'en', currency: 'USD' })

      const statusElement = screen.getByTestId('greeting-rate-status')
      expect(statusElement.textContent).toContain('?')
    })
  })

  describe('Given rates are partial', () => {
    it('Then it shows partial status indicator', () => {
      act(() => {
        ratesStateSignal.value = {
          status: 'partial',
          rates: {
            USD: { copPerUnit: 3284.6715, sourceDate: new Date(), retrievedAt: new Date() },
          },
          unavailableCurrencies: ['EUR', 'GBP', 'MXN'],
        }
      })

      renderWithProviders({ locale: 'en', currency: 'USD' })

      const statusElement = screen.getByTestId('greeting-rate-status')
      expect(statusElement.textContent).toContain('Some rates unavailable')
    })
  })

  describe('Given custom props are provided', () => {
    it('When dataTestId is provided, Then the custom test ID is used', () => {
      renderWithProviders({ props: { dataTestId: 'custom-greeting' } })

      expect(screen.getByTestId('custom-greeting')).toBeInTheDocument()
      expect(screen.getByTestId('custom-greeting-title')).toBeInTheDocument()
    })

    it('When className is provided, Then it is applied', () => {
      renderWithProviders({ props: { className: 'custom-class' } })

      const greeting = screen.getByTestId('greeting')
      expect(greeting.className).toContain('custom-class')
    })
  })
})
