import { render, screen, fireEvent } from '@testing-library/react'
import { HamburgerButton } from './HamburgerButton'
import { I18nProvider } from '../../../../i18n'

const renderWithI18n = (ui: React.ReactElement): ReturnType<typeof render> => {
  return render(<I18nProvider>{ui}</I18nProvider>)
}

describe('HamburgerButton', () => {
  it('renders with correct test id', () => {
    renderWithI18n(<HamburgerButton isOpen={false} onClick={jest.fn()} />)

    expect(screen.getByTestId('app-navbar-hamburger')).toBeInTheDocument()
  })

  it('renders with custom test id', () => {
    renderWithI18n(
      <HamburgerButton isOpen={false} onClick={jest.fn()} dataTestId='custom-hamburger' />
    )

    expect(screen.getByTestId('custom-hamburger')).toBeInTheDocument()
  })

  it('has aria-expanded=false when closed', () => {
    renderWithI18n(<HamburgerButton isOpen={false} onClick={jest.fn()} />)

    expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'false')
  })

  it('has aria-expanded=true when open', () => {
    renderWithI18n(<HamburgerButton isOpen={true} onClick={jest.fn()} />)

    expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'true')
  })

  it('has aria-controls pointing to mobile-menu', () => {
    renderWithI18n(<HamburgerButton isOpen={false} onClick={jest.fn()} />)

    expect(screen.getByRole('button')).toHaveAttribute('aria-controls', 'mobile-menu')
  })

  it('has "Open menu" aria-label when closed', () => {
    renderWithI18n(<HamburgerButton isOpen={false} onClick={jest.fn()} />)

    expect(screen.getByRole('button')).toHaveAccessibleName(/open menu/i)
  })

  it('has "Close menu" aria-label when open', () => {
    renderWithI18n(<HamburgerButton isOpen={true} onClick={jest.fn()} />)

    expect(screen.getByRole('button')).toHaveAccessibleName(/close menu/i)
  })

  it('calls onClick when clicked', () => {
    const handleClick = jest.fn()
    renderWithI18n(<HamburgerButton isOpen={false} onClick={handleClick} />)

    fireEvent.click(screen.getByRole('button'))

    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('has correct aria-expanded when isOpen is true (open state)', () => {
    renderWithI18n(<HamburgerButton isOpen={true} onClick={jest.fn()} />)

    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('aria-expanded', 'true')
  })

  it('has correct aria-expanded when isOpen is false (closed state)', () => {
    renderWithI18n(<HamburgerButton isOpen={false} onClick={jest.fn()} />)

    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('aria-expanded', 'false')
  })

  it('applies custom className', () => {
    renderWithI18n(<HamburgerButton isOpen={false} onClick={jest.fn()} className='custom-class' />)

    const button = screen.getByRole('button')
    expect(button.className).toContain('custom-class')
  })

  it('is a button element (semantic)', () => {
    renderWithI18n(<HamburgerButton isOpen={false} onClick={jest.fn()} />)

    const button = screen.getByRole('button')
    expect(button.tagName).toBe('BUTTON')
    expect(button).toHaveAttribute('type', 'button')
  })
})
