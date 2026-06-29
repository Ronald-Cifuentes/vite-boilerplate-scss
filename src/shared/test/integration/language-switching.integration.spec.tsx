import { render, screen, fireEvent, RenderResult } from '@testing-library/react'
import { I18nProvider } from '../../../i18n'
import { LanguageSelector } from '../../../features/language-selector'
import { Greeting } from '../../../features/greeting'

describe('Language Switching Integration', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.lang = ''
  })

  describe('Given LanguageSelector and Greeting are rendered together', () => {
    const renderComponents = (): RenderResult =>
      render(
        <I18nProvider initialLocale='en'>
          <LanguageSelector />
          <Greeting />
        </I18nProvider>
      )

    it('Then both display initial English content', () => {
      renderComponents()

      expect(screen.getByText('Language')).toBeInTheDocument()
      expect(screen.getByTestId('greeting-title')).toHaveTextContent('Hello')
    })

    it('When language is switched to Spanish, Then both update', () => {
      renderComponents()

      fireEvent.change(screen.getByRole('combobox'), { target: { value: 'es' } })

      expect(screen.getByText('Idioma')).toBeInTheDocument()
      expect(screen.getByTestId('greeting-title')).toHaveTextContent('Hola')
      expect(screen.getByTestId('greeting-subtitle')).toHaveTextContent(
        'Bienvenido a la aplicación'
      )
    })

    it('When switching multiple times, Then state remains consistent', () => {
      renderComponents()

      // Switch to Spanish
      fireEvent.change(screen.getByRole('combobox'), { target: { value: 'es' } })
      expect(screen.getByTestId('greeting-title')).toHaveTextContent('Hola')

      // Switch back to English
      fireEvent.change(screen.getByRole('combobox'), { target: { value: 'en' } })
      expect(screen.getByTestId('greeting-title')).toHaveTextContent('Hello')

      // Switch to Spanish again
      fireEvent.change(screen.getByRole('combobox'), { target: { value: 'es' } })
      expect(screen.getByTestId('greeting-title')).toHaveTextContent('Hola')
    })
  })

  describe('Given multiple components consuming i18n', () => {
    it('Then all components update on locale change', () => {
      render(
        <I18nProvider initialLocale='en'>
          <LanguageSelector dataTestId='selector-1' />
          <LanguageSelector dataTestId='selector-2' />
          <Greeting dataTestId='greeting-1' />
          <Greeting dataTestId='greeting-2' />
        </I18nProvider>
      )

      // Change via first selector
      fireEvent.change(screen.getByTestId('selector-1-select'), { target: { value: 'es' } })

      // All selectors update
      expect(screen.getByTestId('selector-1-select')).toHaveValue('es')
      expect(screen.getByTestId('selector-2-select')).toHaveValue('es')

      // All greetings update
      expect(screen.getByTestId('greeting-1-title')).toHaveTextContent('Hola')
      expect(screen.getByTestId('greeting-2-title')).toHaveTextContent('Hola')
    })
  })
})
