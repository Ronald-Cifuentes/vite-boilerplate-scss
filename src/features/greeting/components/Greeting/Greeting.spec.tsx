import { render, screen, RenderResult } from '@testing-library/react'
import { Greeting } from './Greeting'
import { I18nProvider } from '../../../../i18n'
import { localeSignal } from '../../../../i18n/signals/locale-signal'
import { RegionProvider, type SupportedRegion } from '../../../../region'
import { regionSignal } from '../../../../region/signals/region-signal'
import { ThemeProvider } from '../../../../theme'
import { CurrencyProvider, type SupportedCurrency } from '../../../../currency'
import { currencySignal, userOverriddenSignal } from '../../../../currency/signals/currency-signal'

describe('Greeting', () => {
  beforeEach(() => {
    // Reset signals before each test
    localStorage.clear()
    localeSignal.value = 'en'
    regionSignal.value = 'US'
    currencySignal.value = 'USD'
    userOverriddenSignal.value = false
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

    it('Then it displays price formatted for USD currency', () => {
      renderWithProviders({ locale: 'en', region: 'US', currency: 'USD' })

      const priceElement = screen.getByTestId('greeting-price')
      expect(priceElement.textContent).toMatch(/\$1,234\.56/)
    })

    it('Then it displays price formatted for GBP currency', () => {
      renderWithProviders({ locale: 'en', region: 'GB', currency: 'GBP' })

      const priceElement = screen.getByTestId('greeting-price')
      expect(priceElement.textContent).toMatch(/£1,234\.56/)
    })

    it('Then it displays price formatted for EUR currency', () => {
      renderWithProviders({ locale: 'es', region: 'ES', currency: 'EUR' })

      const priceElement = screen.getByTestId('greeting-price')
      expect(priceElement.textContent).toMatch(/€|EUR/)
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
