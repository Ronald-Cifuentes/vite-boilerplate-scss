import { render, screen, RenderResult } from '@testing-library/react'
import { Greeting } from './Greeting'
import { I18nProvider } from '../../../../i18n'

describe('Greeting', () => {
  const renderWithProvider = (locale: 'en' | 'es' = 'en', props = {}): RenderResult =>
    render(
      <I18nProvider initialLocale={locale}>
        <Greeting {...props} />
      </I18nProvider>
    )

  describe('Given the Greeting component is rendered in English', () => {
    it('Then it displays the English greeting', () => {
      renderWithProvider('en')

      expect(screen.getByTestId('greeting-title')).toHaveTextContent('Hello')
      expect(screen.getByTestId('greeting-subtitle')).toHaveTextContent(
        'Welcome to the application'
      )
    })
  })

  describe('Given the Greeting component is rendered in Spanish', () => {
    it('Then it displays the Spanish greeting', () => {
      renderWithProvider('es')

      expect(screen.getByTestId('greeting-title')).toHaveTextContent('Hola')
      expect(screen.getByTestId('greeting-subtitle')).toHaveTextContent(
        'Bienvenido a la aplicación'
      )
    })
  })

  describe('Given custom props are provided', () => {
    it('When dataTestId is provided, Then the custom test ID is used', () => {
      renderWithProvider('en', { dataTestId: 'custom-greeting' })

      expect(screen.getByTestId('custom-greeting')).toBeInTheDocument()
      expect(screen.getByTestId('custom-greeting-title')).toBeInTheDocument()
    })

    it('When className is provided, Then it is applied', () => {
      renderWithProvider('en', { className: 'custom-class' })

      const greeting = screen.getByTestId('greeting')
      expect(greeting.className).toContain('custom-class')
    })
  })
})
