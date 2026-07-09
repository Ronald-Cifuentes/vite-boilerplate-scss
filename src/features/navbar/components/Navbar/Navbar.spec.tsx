import { render, screen } from '@testing-library/react'
import { Navbar } from './Navbar'
import { ThemeProvider } from '../../../../theme'
import { RegionProvider } from '../../../../region'
import { CurrencyProvider } from '../../../../currency'
import { I18nProvider } from '../../../../i18n'

describe('Navbar', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  const renderWithProviders = (props = {}): ReturnType<typeof render> =>
    render(
      <ThemeProvider initialPreference='light'>
        <RegionProvider initialRegion='US'>
          <CurrencyProvider>
            <I18nProvider initialLocale='en'>
              <Navbar {...props} />
            </I18nProvider>
          </CurrencyProvider>
        </RegionProvider>
      </ThemeProvider>
    )

  describe('Given the Navbar is rendered', () => {
    it('Then it has navigation role', () => {
      renderWithProviders()
      expect(screen.getByRole('navigation')).toBeInTheDocument()
    })

    it('Then it has aria-label for accessibility', () => {
      renderWithProviders()
      expect(screen.getByRole('navigation')).toHaveAccessibleName('Settings')
    })

    it('Then it contains language dropdown', () => {
      renderWithProviders({ dataTestId: 'nav' })
      expect(screen.getByTestId('nav-language')).toBeInTheDocument()
    })

    it('Then it contains theme button (not dropdown per ADR-0009)', () => {
      renderWithProviders({ dataTestId: 'nav' })
      expect(screen.getByTestId('nav-theme')).toBeInTheDocument()
    })

    it('Then it contains country dropdown', () => {
      renderWithProviders({ dataTestId: 'nav' })
      expect(screen.getByTestId('nav-country')).toBeInTheDocument()
    })

    it('Then it contains currency dropdown', () => {
      renderWithProviders({ dataTestId: 'nav' })
      expect(screen.getByTestId('nav-currency')).toBeInTheDocument()
    })

    it('Then it has 4 buttons total (3 dropdown triggers + 1 theme button)', () => {
      renderWithProviders()
      const buttons = screen.getAllByRole('button')
      expect(buttons).toHaveLength(4)
    })

    it('Then only 3 buttons have aria-haspopup (dropdowns, not theme)', () => {
      renderWithProviders()
      const buttons = screen.getAllByRole('button')
      const dropdownTriggers = buttons.filter(
        button => button.getAttribute('aria-haspopup') === 'listbox'
      )
      expect(dropdownTriggers).toHaveLength(3)
    })

    it('Then theme button does NOT have aria-haspopup (per ADR-0009)', () => {
      renderWithProviders({ dataTestId: 'nav' })
      const themeButton = screen.getByTestId('nav-theme-button')
      expect(themeButton).not.toHaveAttribute('aria-haspopup')
    })
  })

  describe('Given dataTestId is provided', () => {
    it('Then data-testid attribute is set', () => {
      renderWithProviders({ dataTestId: 'my-navbar' })
      expect(screen.getByTestId('my-navbar')).toBeInTheDocument()
    })
  })

  describe('Given className is provided', () => {
    it('Then custom className is applied', () => {
      renderWithProviders({ className: 'custom-class', dataTestId: 'nav' })
      expect(screen.getByTestId('nav').className).toContain('custom-class')
    })
  })
})
