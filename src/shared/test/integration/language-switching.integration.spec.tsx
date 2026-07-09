import { render, screen, fireEvent, RenderResult, act, within } from '@testing-library/react'
import { I18nProvider } from '../../../i18n'
import { LanguageDropdown } from '../../../features/navbar'
import { Greeting } from '../../../features/greeting'
import { ThemeProvider } from '../../../theme'
import { RegionProvider } from '../../../region'
import { CurrencyProvider } from '../../../currency'
import { localeSignal } from '../../../i18n/signals/locale-signal'

// Full provider wrapper for dropdown components
const TestWrapper = ({ children }: { children: React.ReactNode }): React.JSX.Element => (
  <ThemeProvider>
    <RegionProvider>
      <CurrencyProvider>
        <I18nProvider initialLocale='en'>{children}</I18nProvider>
      </CurrencyProvider>
    </RegionProvider>
  </ThemeProvider>
)

describe('Language Switching Integration', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.lang = ''
    localeSignal.value = 'en'
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  describe('Given LanguageDropdown and Greeting are rendered together', () => {
    const renderComponents = (): RenderResult =>
      render(
        <TestWrapper>
          <LanguageDropdown dataTestId='lang-dropdown' />
          <Greeting />
        </TestWrapper>
      )

    it('Then both display initial English content', () => {
      renderComponents()

      // Trigger shows language icon with proper aria-label
      expect(screen.getByTestId('lang-dropdown-trigger')).toHaveAttribute(
        'aria-label',
        expect.stringMatching(/english/i)
      )
      // Greeting shows English text
      expect(screen.getByTestId('greeting-title')).toHaveTextContent('Hello')
    })

    it('When Spanish is selected via dropdown, Then both update', () => {
      renderComponents()

      // Open the dropdown
      fireEvent.click(screen.getByTestId('lang-dropdown-trigger'))

      // Find and click Spanish option
      const panel = screen.getByRole('listbox')
      const spanishOption = within(panel).getByText(/espa/i)
      fireEvent.click(spanishOption)

      // Advance timers for announcer debounce
      act(() => {
        jest.advanceTimersByTime(100)
      })

      // Trigger shows Spanish in aria-label
      expect(screen.getByTestId('lang-dropdown-trigger')).toHaveAttribute(
        'aria-label',
        expect.stringMatching(/espa/i)
      )
      // Greeting shows Spanish text
      expect(screen.getByTestId('greeting-title')).toHaveTextContent('Hola')
      expect(screen.getByTestId('greeting-subtitle')).toHaveTextContent(
        'Bienvenido a la aplicacion'
      )
    })

    it('When switching languages multiple times, Then state remains consistent', () => {
      renderComponents()

      // Switch to Spanish
      fireEvent.click(screen.getByTestId('lang-dropdown-trigger'))
      fireEvent.click(within(screen.getByRole('listbox')).getByText(/espa/i))

      act(() => {
        jest.advanceTimersByTime(100)
      })

      expect(screen.getByTestId('greeting-title')).toHaveTextContent('Hola')

      // Switch back to English
      fireEvent.click(screen.getByTestId('lang-dropdown-trigger'))
      fireEvent.click(within(screen.getByRole('listbox')).getByText(/english/i))

      act(() => {
        jest.advanceTimersByTime(100)
      })

      expect(screen.getByTestId('greeting-title')).toHaveTextContent('Hello')

      // Switch to Spanish again
      fireEvent.click(screen.getByTestId('lang-dropdown-trigger'))
      fireEvent.click(within(screen.getByRole('listbox')).getByText(/espa/i))

      act(() => {
        jest.advanceTimersByTime(100)
      })

      expect(screen.getByTestId('greeting-title')).toHaveTextContent('Hola')
    })
  })

  describe('Given multiple components consuming i18n', () => {
    it('Then all components update on locale change', () => {
      render(
        <TestWrapper>
          <LanguageDropdown dataTestId='dropdown-1' />
          <LanguageDropdown dataTestId='dropdown-2' />
          <Greeting dataTestId='greeting-1' />
          <Greeting dataTestId='greeting-2' />
        </TestWrapper>
      )

      // Change via first dropdown
      fireEvent.click(screen.getByTestId('dropdown-1-trigger'))
      fireEvent.click(within(screen.getByTestId('dropdown-1-panel')).getByText(/espa/i))

      // Advance timers for announcer debounce
      act(() => {
        jest.advanceTimersByTime(100)
      })

      // All dropdowns show Spanish in aria-label
      expect(screen.getByTestId('dropdown-1-trigger')).toHaveAttribute(
        'aria-label',
        expect.stringMatching(/espa/i)
      )
      expect(screen.getByTestId('dropdown-2-trigger')).toHaveAttribute(
        'aria-label',
        expect.stringMatching(/espa/i)
      )

      // All greetings update
      expect(screen.getByTestId('greeting-1-title')).toHaveTextContent('Hola')
      expect(screen.getByTestId('greeting-2-title')).toHaveTextContent('Hola')
    })
  })
})
