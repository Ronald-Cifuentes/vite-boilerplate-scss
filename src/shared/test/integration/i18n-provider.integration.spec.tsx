import { render, screen, fireEvent, act, within } from '@testing-library/react'
import { JSX } from 'react'
import { I18nProvider, useTranslation } from '../../../i18n'
import { LanguageDropdown } from '../../../features/navbar'
import { ThemeProvider } from '../../../theme'
import { RegionProvider } from '../../../region'
import { CurrencyProvider } from '../../../currency'
import { LOCALE_STORAGE_KEY } from '../../../i18n/config/locales'
import { localeSignal } from '../../../i18n/signals/locale-signal'

// Test consumer component
const TestConsumer = (): JSX.Element => {
  const { t, locale } = useTranslation()
  return (
    <div>
      <span data-testid='greeting'>{t('greeting.hello')}</span>
      <span data-testid='locale'>{locale}</span>
    </div>
  )
}

// Full provider wrapper for dropdown components
const TestWrapper = ({
  children,
  initialLocale,
}: {
  children: React.ReactNode
  initialLocale?: 'en' | 'es'
}): React.JSX.Element => (
  <ThemeProvider>
    <RegionProvider>
      <CurrencyProvider>
        <I18nProvider initialLocale={initialLocale}>{children}</I18nProvider>
      </CurrencyProvider>
    </RegionProvider>
  </ThemeProvider>
)

describe('I18nProvider Integration', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.lang = ''
    localeSignal.value = 'en'
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  describe('Given the provider wraps consumers', () => {
    it('Then consumers receive translation function', () => {
      render(
        <TestWrapper initialLocale='en'>
          <TestConsumer />
        </TestWrapper>
      )

      expect(screen.getByTestId('greeting')).toHaveTextContent('Hello')
    })
  })

  describe('Given LanguageDropdown changes locale', () => {
    it('When Spanish is selected, Then all consumers update', () => {
      render(
        <TestWrapper initialLocale='en'>
          <LanguageDropdown dataTestId='lang-dropdown' />
          <TestConsumer />
        </TestWrapper>
      )

      // Open dropdown and select Spanish
      fireEvent.click(screen.getByTestId('lang-dropdown-trigger'))
      fireEvent.click(within(screen.getByRole('listbox')).getByText(/espa/i))

      // Advance timers for announcer debounce
      act(() => {
        jest.advanceTimersByTime(100)
      })

      expect(screen.getByTestId('greeting')).toHaveTextContent('Hola')
      expect(screen.getByTestId('locale')).toHaveTextContent('es')
    })
  })

  describe('Given locale persistence', () => {
    it('When locale changes, Then it persists to localStorage', () => {
      render(
        <TestWrapper>
          <LanguageDropdown dataTestId='lang-dropdown' />
        </TestWrapper>
      )

      // Open dropdown and select Spanish
      fireEvent.click(screen.getByTestId('lang-dropdown-trigger'))
      fireEvent.click(within(screen.getByRole('listbox')).getByText(/espa/i))

      // Advance timers for announcer debounce
      act(() => {
        jest.advanceTimersByTime(100)
      })

      expect(localStorage.getItem(LOCALE_STORAGE_KEY)).toBe('es')
    })

    it('When app mounts with persisted locale, Then it restores the preference', () => {
      localStorage.setItem(LOCALE_STORAGE_KEY, 'es')

      render(
        <TestWrapper>
          <TestConsumer />
        </TestWrapper>
      )

      expect(screen.getByTestId('greeting')).toHaveTextContent('Hola')
      expect(screen.getByTestId('locale')).toHaveTextContent('es')
    })
  })

  describe('Given html lang attribute', () => {
    it('When locale changes, Then html lang updates', () => {
      render(
        <TestWrapper initialLocale='en'>
          <LanguageDropdown dataTestId='lang-dropdown' />
        </TestWrapper>
      )

      expect(document.documentElement.lang).toBe('en')

      // Open dropdown and select Spanish
      fireEvent.click(screen.getByTestId('lang-dropdown-trigger'))
      fireEvent.click(within(screen.getByRole('listbox')).getByText(/espa/i))

      // Advance timers for announcer debounce
      act(() => {
        jest.advanceTimersByTime(100)
      })

      expect(document.documentElement.lang).toBe('es')
    })
  })
})
