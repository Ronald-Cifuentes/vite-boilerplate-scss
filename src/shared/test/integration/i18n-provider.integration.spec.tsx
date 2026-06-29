import { render, screen, fireEvent } from '@testing-library/react'
import { JSX } from 'react'
import { I18nProvider, useTranslation } from '../../../i18n'
import { LanguageSelector } from '../../../features/language-selector'
import { LOCALE_STORAGE_KEY } from '../../../i18n/config/locales'

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

describe('I18nProvider Integration', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.lang = ''
  })

  describe('Given the provider wraps consumers', () => {
    it('Then consumers receive translation function', () => {
      render(
        <I18nProvider initialLocale='en'>
          <TestConsumer />
        </I18nProvider>
      )

      expect(screen.getByTestId('greeting')).toHaveTextContent('Hello')
    })
  })

  describe('Given LanguageSelector changes locale', () => {
    it('When Spanish is selected, Then all consumers update', () => {
      render(
        <I18nProvider initialLocale='en'>
          <LanguageSelector />
          <TestConsumer />
        </I18nProvider>
      )

      fireEvent.change(screen.getByRole('combobox'), { target: { value: 'es' } })

      expect(screen.getByTestId('greeting')).toHaveTextContent('Hola')
      expect(screen.getByTestId('locale')).toHaveTextContent('es')
    })
  })

  describe('Given locale persistence', () => {
    it('When locale changes, Then it persists to localStorage', () => {
      render(
        <I18nProvider>
          <LanguageSelector />
        </I18nProvider>
      )

      fireEvent.change(screen.getByRole('combobox'), { target: { value: 'es' } })

      expect(localStorage.getItem(LOCALE_STORAGE_KEY)).toBe('es')
    })

    it('When app mounts with persisted locale, Then it restores the preference', () => {
      localStorage.setItem(LOCALE_STORAGE_KEY, 'es')

      render(
        <I18nProvider>
          <TestConsumer />
        </I18nProvider>
      )

      expect(screen.getByTestId('greeting')).toHaveTextContent('Hola')
      expect(screen.getByTestId('locale')).toHaveTextContent('es')
    })
  })

  describe('Given html lang attribute', () => {
    it('When locale changes, Then html lang updates', () => {
      render(
        <I18nProvider initialLocale='en'>
          <LanguageSelector />
        </I18nProvider>
      )

      expect(document.documentElement.lang).toBe('en')

      fireEvent.change(screen.getByRole('combobox'), { target: { value: 'es' } })

      expect(document.documentElement.lang).toBe('es')
    })
  })
})
