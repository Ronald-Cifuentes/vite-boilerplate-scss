import { render, screen, fireEvent } from '@testing-library/react'
import { MobileMenuItem } from './MobileMenuItem'
import { I18nProvider } from '../../../../i18n'

const renderWithI18n = (ui: React.ReactElement): ReturnType<typeof render> => {
  return render(<I18nProvider>{ui}</I18nProvider>)
}

describe('MobileMenuItem', () => {
  it('renders with translated label', () => {
    renderWithI18n(<MobileMenuItem labelKey='mobileMenu.language' />)

    expect(screen.getByText('Language')).toBeInTheDocument()
  })

  it('renders with custom test id', () => {
    renderWithI18n(<MobileMenuItem labelKey='mobileMenu.language' dataTestId='test-item' />)

    expect(screen.getByTestId('test-item')).toBeInTheDocument()
  })

  it('calls onClick when clicked (no submenu)', () => {
    const handleClick = jest.fn()
    renderWithI18n(<MobileMenuItem labelKey='mobileMenu.theme' onClick={handleClick} />)

    fireEvent.click(screen.getByRole('button'))

    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('calls onToggleSubmenu when item has submenu', () => {
    const handleToggle = jest.fn()
    renderWithI18n(
      <MobileMenuItem labelKey='mobileMenu.language' hasSubmenu onToggleSubmenu={handleToggle}>
        <div>Submenu content</div>
      </MobileMenuItem>
    )

    fireEvent.click(screen.getByRole('button'))

    expect(handleToggle).toHaveBeenCalledTimes(1)
  })

  it('has aria-expanded when hasSubmenu is true', () => {
    renderWithI18n(
      <MobileMenuItem labelKey='mobileMenu.language' hasSubmenu isExpanded={false}>
        <div>Submenu</div>
      </MobileMenuItem>
    )

    expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'false')
  })

  it('has aria-expanded=true when expanded', () => {
    renderWithI18n(
      <MobileMenuItem labelKey='mobileMenu.language' hasSubmenu isExpanded={true}>
        <div>Submenu</div>
      </MobileMenuItem>
    )

    expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'true')
  })

  it('does not have aria-expanded when no submenu', () => {
    renderWithI18n(<MobileMenuItem labelKey='mobileMenu.theme' onClick={jest.fn()} />)

    expect(screen.getByRole('button')).not.toHaveAttribute('aria-expanded')
  })

  it('has aria-haspopup=menu when hasSubmenu', () => {
    renderWithI18n(
      <MobileMenuItem labelKey='mobileMenu.language' hasSubmenu>
        <div>Submenu</div>
      </MobileMenuItem>
    )

    expect(screen.getByRole('button')).toHaveAttribute('aria-haspopup', 'menu')
  })

  it('handles Enter key', () => {
    const handleClick = jest.fn()
    renderWithI18n(<MobileMenuItem labelKey='mobileMenu.theme' onClick={handleClick} />)

    fireEvent.keyDown(screen.getByRole('button'), { key: 'Enter' })

    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('handles Space key', () => {
    const handleClick = jest.fn()
    renderWithI18n(<MobileMenuItem labelKey='mobileMenu.theme' onClick={handleClick} />)

    fireEvent.keyDown(screen.getByRole('button'), { key: ' ' })

    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('ignores other keys', () => {
    const handleClick = jest.fn()
    renderWithI18n(<MobileMenuItem labelKey='mobileMenu.theme' onClick={handleClick} />)

    fireEvent.keyDown(screen.getByRole('button'), { key: 'Tab' })
    fireEvent.keyDown(screen.getByRole('button'), { key: 'Escape' })

    expect(handleClick).not.toHaveBeenCalled()
  })

  it('does nothing when no onClick or onToggleSubmenu is provided', () => {
    renderWithI18n(<MobileMenuItem labelKey='mobileMenu.theme' dataTestId='noop-item' />)

    const button = screen.getByRole('button')
    // Should not throw
    fireEvent.click(button)
    expect(button).toBeInTheDocument()
  })

  it('renders icon when provided', () => {
    renderWithI18n(
      <MobileMenuItem
        labelKey='mobileMenu.theme'
        icon={<span data-testid='test-icon'>Icon</span>}
      />
    )

    expect(screen.getByTestId('test-icon')).toBeInTheDocument()
  })

  it('renders submenu children when hasSubmenu', () => {
    renderWithI18n(
      <MobileMenuItem labelKey='mobileMenu.language' hasSubmenu isExpanded={true}>
        <div data-testid='submenu-content'>Submenu content</div>
      </MobileMenuItem>
    )

    expect(screen.getByTestId('submenu-content')).toBeInTheDocument()
  })

  it('renders with siblingHovered prop (visual dimming via CSS)', () => {
    // CSS module classes are mocked in tests; we verify the prop is accepted
    renderWithI18n(
      <MobileMenuItem
        labelKey='mobileMenu.language'
        siblingHovered={true}
        dataTestId='dimmed-item'
      />
    )

    const item = screen.getByTestId('dimmed-item')
    expect(item).toBeInTheDocument()
  })

  it('shows expanded state via aria-expanded attribute', () => {
    renderWithI18n(
      <MobileMenuItem
        labelKey='mobileMenu.language'
        hasSubmenu
        isExpanded={true}
        dataTestId='expanded-item'
      >
        <div>Submenu</div>
      </MobileMenuItem>
    )

    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('aria-expanded', 'true')
  })

  it('sets item index as CSS custom property', () => {
    renderWithI18n(
      <MobileMenuItem labelKey='mobileMenu.language' index={2} dataTestId='indexed-item' />
    )

    const item = screen.getByTestId('indexed-item')
    expect(item.style.getPropertyValue('--item-index')).toBe('2')
  })

  it('applies custom className', () => {
    renderWithI18n(
      <MobileMenuItem
        labelKey='mobileMenu.language'
        className='custom-class'
        dataTestId='custom-item'
      />
    )

    const item = screen.getByTestId('custom-item')
    expect(item.className).toContain('custom-class')
  })
})

describe('MobileMenuItem scrollIntoView (CONTRACTS §17)', () => {
  let mockScrollIntoView: jest.Mock
  let mockMatchMedia: jest.Mock

  beforeEach(() => {
    mockScrollIntoView = jest.fn()
    Element.prototype.scrollIntoView = mockScrollIntoView

    mockMatchMedia = jest.fn().mockReturnValue({
      matches: false, // Default: no reduced motion
    })
    window.matchMedia = mockMatchMedia
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('calls scrollIntoView on focus with smooth behavior by default', () => {
    render(<MobileMenuItem labelKey='mobileMenu.language' dataTestId='scroll-item' />)
    const button = screen.getByRole('button')
    fireEvent.focus(button)

    expect(mockScrollIntoView).toHaveBeenCalledWith({ block: 'nearest', behavior: 'smooth' })
  })

  it('uses auto behavior when prefers-reduced-motion is set', () => {
    mockMatchMedia.mockReturnValue({ matches: true })

    render(<MobileMenuItem labelKey='mobileMenu.language' dataTestId='scroll-item' />)
    const button = screen.getByRole('button')
    fireEvent.focus(button)

    expect(mockScrollIntoView).toHaveBeenCalledWith({ block: 'nearest', behavior: 'auto' })
  })

  it('checks prefers-reduced-motion media query', () => {
    render(<MobileMenuItem labelKey='mobileMenu.language' dataTestId='scroll-item' />)
    const button = screen.getByRole('button')
    fireEvent.focus(button)

    expect(mockMatchMedia).toHaveBeenCalledWith('(prefers-reduced-motion: reduce)')
  })
})
