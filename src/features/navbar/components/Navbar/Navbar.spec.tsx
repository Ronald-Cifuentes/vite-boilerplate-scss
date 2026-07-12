import { render, screen, fireEvent } from '@testing-library/react'
import { Navbar } from './Navbar'
import { ThemeProvider } from '../../../../theme'
import { RegionProvider } from '../../../../region'
import { CurrencyProvider } from '../../../../currency'
import { I18nProvider } from '../../../../i18n'
import { resetMobileMenuState } from '../../../mobile-menu/signals/mobile-menu-signal'

describe('Navbar', () => {
  beforeEach(() => {
    localStorage.clear()
    resetMobileMenuState()
  })

  afterEach(() => {
    resetMobileMenuState()
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

    it('Then it contains hamburger button for mobile', () => {
      renderWithProviders({ dataTestId: 'nav' })
      expect(screen.getByTestId('nav-hamburger')).toBeInTheDocument()
    })

    it('Then it contains language dropdown in desktop controls', () => {
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

    it('Then it has 5 buttons total (hamburger + 3 dropdown triggers + 1 theme button)', () => {
      renderWithProviders()
      const buttons = screen.getAllByRole('button')
      expect(buttons).toHaveLength(5)
    })

    it('Then only 3 buttons have aria-haspopup (dropdowns, not theme or hamburger)', () => {
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

    it('Then hamburger has aria-expanded=false initially', () => {
      renderWithProviders({ dataTestId: 'nav' })
      const hamburger = screen.getByTestId('nav-hamburger')
      expect(hamburger).toHaveAttribute('aria-expanded', 'false')
    })

    it('Then hamburger has aria-controls pointing to mobile-menu', () => {
      renderWithProviders({ dataTestId: 'nav' })
      const hamburger = screen.getByTestId('nav-hamburger')
      expect(hamburger).toHaveAttribute('aria-controls', 'mobile-menu')
    })
  })

  describe('Given hamburger button is clicked', () => {
    it('Then mobile menu opens', () => {
      renderWithProviders({ dataTestId: 'nav' })

      const hamburger = screen.getByTestId('nav-hamburger')
      fireEvent.click(hamburger)

      expect(screen.getByTestId('app-mobile-menu')).toBeInTheDocument()
    })

    it('Then hamburger aria-expanded becomes true', () => {
      renderWithProviders({ dataTestId: 'nav' })

      const hamburger = screen.getByTestId('nav-hamburger')
      fireEvent.click(hamburger)

      expect(hamburger).toHaveAttribute('aria-expanded', 'true')
    })

    it('Then clicking hamburger again closes menu', () => {
      renderWithProviders({ dataTestId: 'nav' })

      const hamburger = screen.getByTestId('nav-hamburger')
      fireEvent.click(hamburger) // Open
      fireEvent.click(hamburger) // Close

      expect(screen.queryByTestId('app-mobile-menu')).not.toBeInTheDocument()
    })

    it('Then pressing Escape closes menu', () => {
      renderWithProviders({ dataTestId: 'nav' })

      const hamburger = screen.getByTestId('nav-hamburger')
      fireEvent.click(hamburger) // Open

      expect(screen.getByTestId('app-mobile-menu')).toBeInTheDocument()

      // Press Escape
      fireEvent.keyDown(document, { key: 'Escape' })

      expect(screen.queryByTestId('app-mobile-menu')).not.toBeInTheDocument()
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
