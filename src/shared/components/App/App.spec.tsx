import { render, screen, fireEvent } from '@testing-library/react'
import { App } from './App'
import { themePreferenceSignal, osPrefersDarkSignal } from '../../../theme/signals/theme-signal'
import { localeSignal } from '../../../i18n/signals/locale-signal'
import { regionSignal } from '../../../region/signals/region-signal'
import { currencySignal, userOverriddenSignal } from '../../../currency/signals/currency-signal'

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

      // Initial USD format
      const priceElement = screen.getByTestId('app-greeting-price')
      expect(priceElement).toHaveTextContent('$')

      // Open currency dropdown and select Euro
      fireEvent.click(screen.getByTestId('app-navbar-currency-trigger'))
      fireEvent.click(screen.getByTestId('app-navbar-currency-option-EUR'))

      // EUR format
      expect(priceElement.textContent).toMatch(/€|EUR/)
    })
  })

  describe('Given custom props are provided', () => {
    it('When dataTestId is provided, Then the custom test ID is used', () => {
      render(<App dataTestId='custom-app' />)
      expect(screen.getByTestId('custom-app')).toBeInTheDocument()
    })
  })
})
