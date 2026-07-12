import { render, screen, fireEvent } from '@testing-library/react'
import { MobileMenuSubmenu } from './MobileMenuSubmenu'

const mockOptions = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Espanol' },
  { value: 'zh', label: '中文' },
] as const

describe('MobileMenuSubmenu rendering', () => {
  it('renders all options', () => {
    render(
      <MobileMenuSubmenu options={mockOptions} selectedValue='en' onSelect={jest.fn()} isVisible />
    )
    expect(screen.getByText('English')).toBeInTheDocument()
    expect(screen.getByText('Espanol')).toBeInTheDocument()
    expect(screen.getByText('中文')).toBeInTheDocument()
  })

  it('renders with custom test id', () => {
    render(
      <MobileMenuSubmenu
        options={mockOptions}
        selectedValue='en'
        onSelect={jest.fn()}
        isVisible
        dataTestId='test-submenu'
      />
    )
    expect(screen.getByTestId('test-submenu')).toBeInTheDocument()
  })

  it('renders option icons when provided', () => {
    const optionsWithIcons = [
      { value: 'a', label: 'Option A', icon: <span data-testid='icon-a'>A</span> },
      { value: 'b', label: 'Option B', icon: <span data-testid='icon-b'>B</span> },
    ]
    render(
      <MobileMenuSubmenu
        options={optionsWithIcons}
        selectedValue='a'
        onSelect={jest.fn()}
        isVisible
      />
    )
    expect(screen.getByTestId('icon-a')).toBeInTheDocument()
    expect(screen.getByTestId('icon-b')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    render(
      <MobileMenuSubmenu
        options={mockOptions}
        selectedValue='en'
        onSelect={jest.fn()}
        isVisible
        className='custom-class'
        dataTestId='custom-menu'
      />
    )
    expect(screen.getByTestId('custom-menu').className).toContain('custom-class')
  })
})

describe('MobileMenuSubmenu interactions', () => {
  it('calls onSelect when option is clicked', () => {
    const handleSelect = jest.fn()
    render(
      <MobileMenuSubmenu
        options={mockOptions}
        selectedValue='en'
        onSelect={handleSelect}
        isVisible
      />
    )
    fireEvent.click(screen.getByText('Espanol'))
    expect(handleSelect).toHaveBeenCalledWith('es')
  })

  it('handles Enter key on option', () => {
    const handleSelect = jest.fn()
    render(
      <MobileMenuSubmenu
        options={mockOptions}
        selectedValue='en'
        onSelect={handleSelect}
        isVisible
      />
    )
    fireEvent.keyDown(screen.getByText('Espanol').closest('button')!, { key: 'Enter' })
    expect(handleSelect).toHaveBeenCalledWith('es')
  })

  it('handles Space key on option', () => {
    const handleSelect = jest.fn()
    render(
      <MobileMenuSubmenu
        options={mockOptions}
        selectedValue='en'
        onSelect={handleSelect}
        isVisible
      />
    )
    fireEvent.keyDown(screen.getByText('Espanol').closest('button')!, { key: ' ' })
    expect(handleSelect).toHaveBeenCalledWith('es')
  })

  it('ignores other keys on option', () => {
    const handleSelect = jest.fn()
    render(
      <MobileMenuSubmenu
        options={mockOptions}
        selectedValue='en'
        onSelect={handleSelect}
        isVisible
      />
    )
    const button = screen.getByText('Espanol').closest('button')!
    fireEvent.keyDown(button, { key: 'Tab' })
    fireEvent.keyDown(button, { key: 'Escape' })
    expect(handleSelect).not.toHaveBeenCalled()
  })
})

describe('MobileMenuSubmenu aria attributes', () => {
  it('marks selected option with aria-current', () => {
    render(
      <MobileMenuSubmenu options={mockOptions} selectedValue='es' onSelect={jest.fn()} isVisible />
    )
    expect(screen.getByText('Espanol').closest('button')).toHaveAttribute('aria-current', 'true')
  })

  it('does not mark non-selected options with aria-current', () => {
    render(
      <MobileMenuSubmenu options={mockOptions} selectedValue='es' onSelect={jest.fn()} isVisible />
    )
    expect(screen.getByText('English').closest('button')).not.toHaveAttribute('aria-current')
  })

  it('has role=menu on the list', () => {
    render(
      <MobileMenuSubmenu options={mockOptions} selectedValue='en' onSelect={jest.fn()} isVisible />
    )
    expect(screen.getByRole('menu')).toBeInTheDocument()
  })

  it('has role=menuitem on options', () => {
    render(
      <MobileMenuSubmenu options={mockOptions} selectedValue='en' onSelect={jest.fn()} isVisible />
    )
    expect(screen.getAllByRole('menuitem')).toHaveLength(3)
  })

  it('marks selected option with aria-current=true via testid', () => {
    render(
      <MobileMenuSubmenu
        options={mockOptions}
        selectedValue='es'
        onSelect={jest.fn()}
        isVisible
        dataTestId='submenu'
      />
    )
    expect(screen.getByTestId('submenu-option-es')).toHaveAttribute('aria-current', 'true')
  })
})

describe('MobileMenuSubmenu scrollIntoView (CONTRACTS §17)', () => {
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
    render(
      <MobileMenuSubmenu options={mockOptions} selectedValue='en' onSelect={jest.fn()} isVisible />
    )
    const button = screen.getByText('Espanol').closest('button')!
    fireEvent.focus(button)

    expect(mockScrollIntoView).toHaveBeenCalledWith({ block: 'nearest', behavior: 'smooth' })
  })

  it('uses auto behavior when prefers-reduced-motion is set', () => {
    mockMatchMedia.mockReturnValue({ matches: true })

    render(
      <MobileMenuSubmenu options={mockOptions} selectedValue='en' onSelect={jest.fn()} isVisible />
    )
    const button = screen.getByText('Espanol').closest('button')!
    fireEvent.focus(button)

    expect(mockScrollIntoView).toHaveBeenCalledWith({ block: 'nearest', behavior: 'auto' })
  })

  it('checks prefers-reduced-motion media query', () => {
    render(
      <MobileMenuSubmenu options={mockOptions} selectedValue='en' onSelect={jest.fn()} isVisible />
    )
    const button = screen.getByText('Espanol').closest('button')!
    fireEvent.focus(button)

    expect(mockMatchMedia).toHaveBeenCalledWith('(prefers-reduced-motion: reduce)')
  })
})

describe('MobileMenuSubmenu visibility', () => {
  it('has aria-hidden=true when not visible', () => {
    render(
      <MobileMenuSubmenu
        options={mockOptions}
        selectedValue='en'
        onSelect={jest.fn()}
        isVisible={false}
        dataTestId='hidden-submenu'
      />
    )
    expect(screen.getByTestId('hidden-submenu')).toHaveAttribute('aria-hidden', 'true')
  })

  it('has aria-hidden=false when visible', () => {
    render(
      <MobileMenuSubmenu
        options={mockOptions}
        selectedValue='en'
        onSelect={jest.fn()}
        isVisible
        dataTestId='visible-submenu'
      />
    )
    expect(screen.getByTestId('visible-submenu')).toHaveAttribute('aria-hidden', 'false')
  })

  it('sets tabIndex=-1 on options when not visible', () => {
    render(
      <MobileMenuSubmenu
        options={mockOptions}
        selectedValue='en'
        onSelect={jest.fn()}
        isVisible={false}
      />
    )
    screen.getAllByRole('menuitem', { hidden: true }).forEach(btn => {
      expect(btn).toHaveAttribute('tabindex', '-1')
    })
  })

  it('sets tabIndex=0 on options when visible', () => {
    render(
      <MobileMenuSubmenu options={mockOptions} selectedValue='en' onSelect={jest.fn()} isVisible />
    )
    screen.getAllByRole('menuitem').forEach(btn => {
      expect(btn).toHaveAttribute('tabindex', '0')
    })
  })

  it('has aria-hidden=false when isVisible (visible state)', () => {
    render(
      <MobileMenuSubmenu
        options={mockOptions}
        selectedValue='en'
        onSelect={jest.fn()}
        isVisible
        dataTestId='visible-menu'
      />
    )
    expect(screen.getByTestId('visible-menu')).toHaveAttribute('aria-hidden', 'false')
  })
})
