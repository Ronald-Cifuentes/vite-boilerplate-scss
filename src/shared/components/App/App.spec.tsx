import { render, screen, fireEvent } from '@testing-library/react'
import { App } from './App'

describe('App', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.lang = 'en'
  })

  describe('Given the App is rendered', () => {
    it('Then it renders the app container', () => {
      render(<App />)

      expect(screen.getByTestId('app')).toBeInTheDocument()
    })

    it('Then it renders the LanguageSelector', () => {
      render(<App />)

      expect(screen.getByTestId('language-selector')).toBeInTheDocument()
    })

    it('Then it renders the Greeting', () => {
      render(<App />)

      expect(screen.getByTestId('greeting')).toBeInTheDocument()
    })

    it('Then it syncs html lang attribute', () => {
      render(<App />)

      expect(document.documentElement.lang).toBe('en')
    })
  })

  describe('Given the user switches language', () => {
    it('When Spanish is selected, Then all text updates', () => {
      render(<App />)

      // Initially English
      expect(screen.getByTestId('greeting-title')).toHaveTextContent('Hello')

      // Switch to Spanish
      fireEvent.change(screen.getByRole('combobox'), { target: { value: 'es' } })

      // Now Spanish
      expect(screen.getByTestId('greeting-title')).toHaveTextContent('Hola')
      expect(document.documentElement.lang).toBe('es')
    })
  })

  describe('Given custom props are provided', () => {
    it('When dataTestId is provided, Then the custom test ID is used', () => {
      render(<App dataTestId='custom-app' />)

      expect(screen.getByTestId('custom-app')).toBeInTheDocument()
    })
  })
})
