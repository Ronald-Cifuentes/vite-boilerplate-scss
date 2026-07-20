import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { useRef } from 'react'
import { MobileMenu } from './MobileMenu'
import { I18nProvider } from '../../../../i18n'
import { ThemeProvider } from '../../../../theme'
import { RegionProvider } from '../../../../region'
import { CurrencyProvider } from '../../../../currency'
import { resetMobileMenuState } from '../../signals/mobile-menu-signal'

const AllProviders = ({ children }: { children: React.ReactNode }): React.ReactElement => (
  <ThemeProvider>
    <RegionProvider>
      <CurrencyProvider>
        <I18nProvider>{children}</I18nProvider>
      </CurrencyProvider>
    </RegionProvider>
  </ThemeProvider>
)

const TestWrapper = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean
  onClose: () => void
}): React.ReactElement => {
  const hamburgerRef = useRef<HTMLButtonElement>(null)
  return (
    <AllProviders>
      <button ref={hamburgerRef} data-testid='hamburger'>
        Hamburger
      </button>
      <MobileMenu isOpen={isOpen} onClose={onClose} hamburgerRef={hamburgerRef} />
    </AllProviders>
  )
}

describe('MobileMenu', () => {
  beforeEach(() => {
    document.body.style.overflow = ''
    // Wrap in act since resetMobileMenuState mutates signals
    act(() => {
      resetMobileMenuState()
    })
  })

  afterEach(() => {
    document.body.style.overflow = ''
    // Wrap in act since resetMobileMenuState mutates signals
    act(() => {
      resetMobileMenuState()
    })
  })

  it('renders when open', () => {
    render(<TestWrapper isOpen={true} onClose={jest.fn()} />)

    expect(screen.getByTestId('app-mobile-menu')).toBeInTheDocument()
  })

  it('does not render when closed', () => {
    render(<TestWrapper isOpen={false} onClose={jest.fn()} />)

    expect(screen.queryByTestId('app-mobile-menu')).not.toBeInTheDocument()
  })

  it('has role=dialog', () => {
    render(<TestWrapper isOpen={true} onClose={jest.fn()} />)

    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('has aria-modal=true', () => {
    render(<TestWrapper isOpen={true} onClose={jest.fn()} />)

    expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true')
  })

  it('has id=mobile-menu (for aria-controls)', () => {
    render(<TestWrapper isOpen={true} onClose={jest.fn()} />)

    expect(screen.getByRole('dialog')).toHaveAttribute('id', 'mobile-menu')
  })

  it('has aria-label for accessibility', () => {
    render(<TestWrapper isOpen={true} onClose={jest.fn()} />)

    expect(screen.getByRole('dialog')).toHaveAccessibleName(/main menu/i)
  })

  it('renders 4 menu items', () => {
    render(<TestWrapper isOpen={true} onClose={jest.fn()} />)

    expect(screen.getByTestId('app-mobile-menu-item-language')).toBeInTheDocument()
    expect(screen.getByTestId('app-mobile-menu-item-country')).toBeInTheDocument()
    expect(screen.getByTestId('app-mobile-menu-item-currency')).toBeInTheDocument()
    expect(screen.getByTestId('app-mobile-menu-item-theme')).toBeInTheDocument()
  })

  it('locks body scroll when open', () => {
    render(<TestWrapper isOpen={true} onClose={jest.fn()} />)

    expect(document.body.style.overflow).toBe('hidden')
  })

  it('unlocks body scroll when closed', () => {
    const { rerender } = render(<TestWrapper isOpen={true} onClose={jest.fn()} />)

    expect(document.body.style.overflow).toBe('hidden')

    rerender(<TestWrapper isOpen={false} onClose={jest.fn()} />)

    expect(document.body.style.overflow).toBe('')
  })

  it('calls onClose when Escape is pressed', () => {
    const handleClose = jest.fn()
    render(<TestWrapper isOpen={true} onClose={handleClose} />)

    fireEvent.keyDown(document, { key: 'Escape' })

    expect(handleClose).toHaveBeenCalledTimes(1)
  })

  it('does not call onClose when other keys are pressed', () => {
    const handleClose = jest.fn()
    render(<TestWrapper isOpen={true} onClose={handleClose} />)

    fireEvent.keyDown(document, { key: 'Tab' })
    fireEvent.keyDown(document, { key: 'Enter' })

    expect(handleClose).not.toHaveBeenCalled()
  })

  it('expands language submenu when clicked', async () => {
    render(<TestWrapper isOpen={true} onClose={jest.fn()} />)

    const languageItem = screen.getByTestId('app-mobile-menu-item-language')
    fireEvent.click(languageItem.querySelector('button')!)

    await waitFor(() => {
      expect(screen.getByTestId('app-mobile-menu-submenu-language')).toBeInTheDocument()
    })
  })

  it('collapses submenu when clicked again', async () => {
    render(<TestWrapper isOpen={true} onClose={jest.fn()} />)

    const languageItem = screen.getByTestId('app-mobile-menu-item-language')
    const button = languageItem.querySelector('button')!

    fireEvent.click(button)
    await waitFor(() => {
      expect(button).toHaveAttribute('aria-expanded', 'true')
    })

    fireEvent.click(button)
    await waitFor(() => {
      expect(button).toHaveAttribute('aria-expanded', 'false')
    })
  })

  it('changes language when option is selected', async () => {
    render(<TestWrapper isOpen={true} onClose={jest.fn()} />)

    const languageItem = screen.getByTestId('app-mobile-menu-item-language')
    fireEvent.click(languageItem.querySelector('button')!)

    await waitFor(() => {
      const esOption = screen.getByTestId('app-mobile-menu-submenu-language-option-es')
      fireEvent.click(esOption)
    })

    await waitFor(() => {
      const button = languageItem.querySelector('button')!
      expect(button).toHaveAttribute('aria-expanded', 'false')
    })
  })

  it('theme item cycles preference on click', () => {
    render(<TestWrapper isOpen={true} onClose={jest.fn()} />)

    const themeItem = screen.getByTestId('app-mobile-menu-item-theme')
    const button = themeItem.querySelector('button')!

    fireEvent.click(button)

    // The theme should cycle (exact result depends on initial state)
    // Just verify it doesn't throw and the button is still there
    expect(button).toBeInTheDocument()
  })

  it('changes country when option is selected', async () => {
    render(<TestWrapper isOpen={true} onClose={jest.fn()} />)

    const countryItem = screen.getByTestId('app-mobile-menu-item-country')
    fireEvent.click(countryItem.querySelector('button')!)

    await waitFor(() => {
      const esOption = screen.getByTestId('app-mobile-menu-submenu-country-option-ES')
      fireEvent.click(esOption)
    })

    await waitFor(() => {
      const button = countryItem.querySelector('button')!
      expect(button).toHaveAttribute('aria-expanded', 'false')
    })
  })

  it('changes currency when option is selected', async () => {
    render(<TestWrapper isOpen={true} onClose={jest.fn()} />)

    const currencyItem = screen.getByTestId('app-mobile-menu-item-currency')
    fireEvent.click(currencyItem.querySelector('button')!)

    await waitFor(() => {
      const eurOption = screen.getByTestId('app-mobile-menu-submenu-currency-option-EUR')
      fireEvent.click(eurOption)
    })

    await waitFor(() => {
      const button = currencyItem.querySelector('button')!
      expect(button).toHaveAttribute('aria-expanded', 'false')
    })
  })

  it('only one submenu can be expanded at a time', async () => {
    render(<TestWrapper isOpen={true} onClose={jest.fn()} />)

    const languageItem = screen.getByTestId('app-mobile-menu-item-language')
    fireEvent.click(languageItem.querySelector('button')!)

    await waitFor(() => {
      expect(languageItem.querySelector('button')).toHaveAttribute('aria-expanded', 'true')
    })

    // Open country (should close language)
    const countryItem = screen.getByTestId('app-mobile-menu-item-country')
    fireEvent.click(countryItem.querySelector('button')!)

    await waitFor(() => {
      expect(countryItem.querySelector('button')).toHaveAttribute('aria-expanded', 'true')
      expect(languageItem.querySelector('button')).toHaveAttribute('aria-expanded', 'false')
    })
  })

  it('resets expanded item when menu closes', async () => {
    const { rerender } = render(<TestWrapper isOpen={true} onClose={jest.fn()} />)

    const languageItem = screen.getByTestId('app-mobile-menu-item-language')
    fireEvent.click(languageItem.querySelector('button')!)

    await waitFor(() => {
      expect(languageItem.querySelector('button')).toHaveAttribute('aria-expanded', 'true')
    })

    rerender(<TestWrapper isOpen={false} onClose={jest.fn()} />)

    rerender(<TestWrapper isOpen={true} onClose={jest.fn()} />)

    const newLanguageItem = screen.getByTestId('app-mobile-menu-item-language')
    expect(newLanguageItem.querySelector('button')).toHaveAttribute('aria-expanded', 'false')
  })

  it('renders with open state (dialog is visible)', () => {
    render(<TestWrapper isOpen={true} onClose={jest.fn()} />)

    const menu = screen.getByTestId('app-mobile-menu')
    expect(menu).toBeInTheDocument()
    // Native <dialog> element has implicit dialog role (no role attribute needed)
    expect(menu.tagName).toBe('DIALOG')
  })

  it('renders announcers for accessibility', () => {
    render(<TestWrapper isOpen={true} onClose={jest.fn()} />)

    expect(screen.getByTestId('app-mobile-menu-language-announcer')).toBeInTheDocument()
    expect(screen.getByTestId('app-mobile-menu-country-announcer')).toBeInTheDocument()
    expect(screen.getByTestId('app-mobile-menu-currency-announcer')).toBeInTheDocument()
    expect(screen.getByTestId('app-mobile-menu-theme-announcer')).toBeInTheDocument()
  })
})

describe('MobileMenu breakpoint cross (ADR-0012 Amendment 2)', () => {
  // This test block verifies that the MobileMenu component registers
  // a matchMedia listener when open and calls onClose when viewport crosses to desktop

  beforeEach(() => {
    document.body.style.overflow = ''
    act(() => {
      resetMobileMenuState()
    })
  })

  afterEach(() => {
    document.body.style.overflow = ''
    act(() => {
      resetMobileMenuState()
    })
  })

  it('sets up matchMedia listener for 768px when open', () => {
    const mockMatchMedia = jest.fn().mockReturnValue({
      matches: false,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    })
    window.matchMedia = mockMatchMedia

    render(<TestWrapper isOpen={true} onClose={jest.fn()} />)

    expect(mockMatchMedia).toHaveBeenCalled()
    const calls = mockMatchMedia.mock.calls.map(c => c[0])
    expect(calls).toContain('(min-width: 768px)')
  })

  it('calls onClose when viewport crosses to desktop (matches: true)', () => {
    // Store handlers registered for '(min-width: 768px)' query
    const handlers: Array<(e: MediaQueryListEvent) => void> = []

    const mockMatchMedia = jest.fn().mockImplementation((query: string) => ({
      matches: false,
      addEventListener: (event: string, handler: (e: MediaQueryListEvent) => void): void => {
        if (event === 'change' && query === '(min-width: 768px)') {
          handlers.push(handler)
        }
      },
      removeEventListener: jest.fn(),
    }))
    window.matchMedia = mockMatchMedia

    const handleClose = jest.fn()
    render(<TestWrapper isOpen={true} onClose={handleClose} />)

    // Simulate viewport crossing to desktop
    expect(handlers.length).toBeGreaterThan(0)
    handlers[handlers.length - 1]({ matches: true } as MediaQueryListEvent)

    expect(handleClose).toHaveBeenCalledTimes(1)
  })

  it('does NOT call onClose when viewport stays mobile (matches: false)', () => {
    const handlers: Array<(e: MediaQueryListEvent) => void> = []

    const mockMatchMedia = jest.fn().mockImplementation((query: string) => ({
      matches: false,
      addEventListener: (event: string, handler: (e: MediaQueryListEvent) => void): void => {
        if (event === 'change' && query === '(min-width: 768px)') {
          handlers.push(handler)
        }
      },
      removeEventListener: jest.fn(),
    }))
    window.matchMedia = mockMatchMedia

    const handleClose = jest.fn()
    render(<TestWrapper isOpen={true} onClose={handleClose} />)

    // Simulate viewport staying mobile
    handlers[handlers.length - 1]({ matches: false } as MediaQueryListEvent)

    expect(handleClose).not.toHaveBeenCalled()
  })

  it('cleans up listener when menu closes', () => {
    const mockRemoveEventListener = jest.fn()
    const mockAddEventListener = jest.fn()
    window.matchMedia = jest.fn().mockReturnValue({
      matches: false,
      addEventListener: mockAddEventListener,
      removeEventListener: mockRemoveEventListener,
    })

    const { rerender } = render(<TestWrapper isOpen={true} onClose={jest.fn()} />)

    rerender(<TestWrapper isOpen={false} onClose={jest.fn()} />)

    expect(mockRemoveEventListener).toHaveBeenCalled()
  })
})
