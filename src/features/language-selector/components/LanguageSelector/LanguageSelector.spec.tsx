import { render, screen, fireEvent, RenderResult } from '@testing-library/react'
import { LanguageSelector } from './LanguageSelector'
import { I18nProvider } from '../../../../i18n'

describe('LanguageSelector', () => {
  const renderWithProvider = (locale: 'en' | 'es' = 'en', props = {}): RenderResult =>
    render(
      <I18nProvider initialLocale={locale}>
        <LanguageSelector {...props} />
      </I18nProvider>
    )

  describe('Given the selector is rendered', () => {
    it('Then it displays the label', () => {
      renderWithProvider()

      expect(screen.getByLabelText(/language/i)).toBeInTheDocument()
    })

    it('Then it shows all supported locales', () => {
      renderWithProvider()

      expect(screen.getByRole('option', { name: 'English' })).toBeInTheDocument()
      expect(screen.getByRole('option', { name: 'Español' })).toBeInTheDocument()
    })

    it('Then the current locale is selected', () => {
      renderWithProvider('en')

      expect(screen.getByRole('combobox')).toHaveValue('en')
    })

    it('Then it has accessible description', () => {
      renderWithProvider()

      const select = screen.getByRole('combobox')
      const describedBy = select.getAttribute('aria-describedby')
      expect(describedBy).toBeTruthy()
      expect(document.getElementById(describedBy!)).toHaveTextContent(
        'Select your preferred language'
      )
    })
  })

  describe('Given the user selects a different locale', () => {
    it('When Spanish is selected, Then the locale changes', () => {
      renderWithProvider()

      fireEvent.change(screen.getByRole('combobox'), { target: { value: 'es' } })

      expect(screen.getByRole('combobox')).toHaveValue('es')
    })

    it('When a locale is selected, Then onLocaleChange callback fires', () => {
      const onLocaleChange = jest.fn()
      renderWithProvider('en', { onLocaleChange })

      fireEvent.change(screen.getByRole('combobox'), { target: { value: 'es' } })

      expect(onLocaleChange).toHaveBeenCalledWith('es')
    })
  })

  describe('Given Spanish locale is active', () => {
    it('Then the label is displayed in Spanish', () => {
      renderWithProvider('es')

      expect(screen.getByText('Idioma')).toBeInTheDocument()
    })
  })

  describe('Given custom props are provided', () => {
    it('When dataTestId is provided, Then the custom test ID is used', () => {
      renderWithProvider('en', { dataTestId: 'custom-selector' })

      expect(screen.getByTestId('custom-selector')).toBeInTheDocument()
      expect(screen.getByTestId('custom-selector-select')).toBeInTheDocument()
    })

    it('When className is provided, Then it is applied', () => {
      renderWithProvider('en', { className: 'custom-class' })

      const selector = screen.getByTestId('language-selector')
      expect(selector.className).toContain('custom-class')
    })
  })
})
