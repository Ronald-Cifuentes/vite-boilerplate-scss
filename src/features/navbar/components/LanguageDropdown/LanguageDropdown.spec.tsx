import { render, screen, fireEvent, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LanguageDropdown } from './LanguageDropdown'
import { I18nProvider } from '../../../../i18n'
import { ThemeProvider } from '../../../../theme'
import { RegionProvider } from '../../../../region'
import { localeSignal } from '../../../../i18n/signals/locale-signal'
import { resetAnnouncements } from '../../signals/announcement-signal'

function TestWrapper({ children }: { children: React.ReactNode }): React.JSX.Element {
  return (
    <ThemeProvider>
      <RegionProvider>
        <I18nProvider>{children}</I18nProvider>
      </RegionProvider>
    </ThemeProvider>
  )
}

describe('LanguageDropdown', () => {
  beforeEach(() => {
    localStorage.clear()
    // Wrap signal mutations in act - safe even before components mounted
    act(() => {
      localeSignal.value = 'en'
      resetAnnouncements()
    })
    // Clear any DOM state
    document.body.innerHTML = ''
  })

  afterEach(() => {
    // Reset fake timers if they were used
    jest.useRealTimers()
  })

  it('should render the dropdown trigger', () => {
    render(
      <TestWrapper>
        <LanguageDropdown />
      </TestWrapper>
    )
    expect(screen.getByTestId('language-dropdown-trigger')).toBeInTheDocument()
  })

  it('should have accessible trigger label', () => {
    render(
      <TestWrapper>
        <LanguageDropdown />
      </TestWrapper>
    )
    const trigger = screen.getByTestId('language-dropdown-trigger')
    expect(trigger).toHaveAttribute('aria-label')
    expect(trigger.getAttribute('aria-label')).toContain('English')
  })

  it('should open dropdown on click', async () => {
    render(
      <TestWrapper>
        <LanguageDropdown />
      </TestWrapper>
    )
    await userEvent.click(screen.getByTestId('language-dropdown-trigger'))
    expect(screen.getByTestId('language-dropdown-trigger')).toHaveAttribute('aria-expanded', 'true')
  })

  it('should display language options with native names', async () => {
    render(
      <TestWrapper>
        <LanguageDropdown />
      </TestWrapper>
    )
    await userEvent.click(screen.getByTestId('language-dropdown-trigger'))
    expect(screen.getByText('English')).toBeInTheDocument()
    expect(screen.getByText('Español')).toBeInTheDocument()
  })

  it('should change language when option is selected', async () => {
    render(
      <TestWrapper>
        <LanguageDropdown />
      </TestWrapper>
    )
    await userEvent.click(screen.getByTestId('language-dropdown-trigger'))
    await userEvent.click(screen.getByTestId('language-dropdown-option-es'))

    expect(localeSignal.value).toBe('es')
  })

  it('should call onLocaleChange callback', async () => {
    const onLocaleChange = jest.fn()
    render(
      <TestWrapper>
        <LanguageDropdown onLocaleChange={onLocaleChange} />
      </TestWrapper>
    )
    await userEvent.click(screen.getByTestId('language-dropdown-trigger'))
    await userEvent.click(screen.getByTestId('language-dropdown-option-es'))

    expect(onLocaleChange).toHaveBeenCalledWith('es')
  })

  it('should announce language change', async () => {
    jest.useFakeTimers()
    render(
      <TestWrapper>
        <LanguageDropdown />
      </TestWrapper>
    )

    // Use fireEvent with fake timers (userEvent doesn't work well with fake timers)
    fireEvent.click(screen.getByTestId('language-dropdown-trigger'))

    await act(async () => {
      fireEvent.click(screen.getByTestId('language-dropdown-option-es'))
      jest.runAllTimers()
    })

    const announcer = screen.getByTestId('language-dropdown-announcer')
    expect(announcer).toHaveTextContent('Español')
    jest.useRealTimers()
  })

  it('should close dropdown after selection', async () => {
    render(
      <TestWrapper>
        <LanguageDropdown />
      </TestWrapper>
    )

    // Use fireEvent for reliability
    fireEvent.click(screen.getByTestId('language-dropdown-trigger'))
    fireEvent.click(screen.getByTestId('language-dropdown-option-es'))

    expect(screen.getByTestId('language-dropdown-trigger')).toHaveAttribute(
      'aria-expanded',
      'false'
    )
  })

  it('should apply custom className', () => {
    render(
      <TestWrapper>
        <LanguageDropdown className='custom-class' />
      </TestWrapper>
    )
    expect(screen.getByTestId('language-dropdown')).toHaveClass('custom-class')
  })

  it('should have aria-haspopup="listbox" on trigger', () => {
    render(
      <TestWrapper>
        <LanguageDropdown />
      </TestWrapper>
    )
    expect(screen.getByTestId('language-dropdown-trigger')).toHaveAttribute(
      'aria-haspopup',
      'listbox'
    )
  })

  it('should mark current language as selected', () => {
    render(
      <TestWrapper>
        <LanguageDropdown />
      </TestWrapper>
    )

    // Use fireEvent for reliability
    fireEvent.click(screen.getByTestId('language-dropdown-trigger'))

    expect(screen.getByTestId('language-dropdown-option-en')).toHaveAttribute(
      'aria-selected',
      'true'
    )
    expect(screen.getByTestId('language-dropdown-option-es')).toHaveAttribute(
      'aria-selected',
      'false'
    )
  })

  describe('Icon presence (DEF-Q1)', () => {
    it('should render trigger with icon and no visible text', () => {
      render(
        <TestWrapper>
          <LanguageDropdown />
        </TestWrapper>
      )
      const trigger = screen.getByTestId('language-dropdown-trigger')
      expect(trigger.querySelector('svg')).toBeInTheDocument()
      expect(trigger.textContent).toBe('')
    })

    it('should render each option with an icon element', async () => {
      render(
        <TestWrapper>
          <LanguageDropdown />
        </TestWrapper>
      )
      await userEvent.click(screen.getByTestId('language-dropdown-trigger'))

      const enOption = screen.getByTestId('language-dropdown-option-en')
      const esOption = screen.getByTestId('language-dropdown-option-es')

      expect(enOption.querySelector('svg')).toBeInTheDocument()
      expect(esOption.querySelector('svg')).toBeInTheDocument()
    })
  })
})
