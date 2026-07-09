import { render, screen, fireEvent, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CountryDropdown } from './CountryDropdown'
import { I18nProvider } from '../../../../i18n'
import { ThemeProvider } from '../../../../theme'
import { RegionProvider } from '../../../../region'
import { regionSignal } from '../../../../region/signals/region-signal'
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

describe('CountryDropdown', () => {
  beforeEach(() => {
    localStorage.clear()
    regionSignal.value = 'US'
    resetAnnouncements()
    document.body.innerHTML = ''
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('should render the dropdown trigger', () => {
    render(
      <TestWrapper>
        <CountryDropdown />
      </TestWrapper>
    )
    expect(screen.getByTestId('country-dropdown-trigger')).toBeInTheDocument()
  })

  it('should have accessible trigger label', () => {
    render(
      <TestWrapper>
        <CountryDropdown />
      </TestWrapper>
    )
    const trigger = screen.getByTestId('country-dropdown-trigger')
    expect(trigger).toHaveAttribute('aria-label')
    expect(trigger.getAttribute('aria-label')).toContain('United States')
  })

  it('should open dropdown on click', async () => {
    render(
      <TestWrapper>
        <CountryDropdown />
      </TestWrapper>
    )
    await userEvent.click(screen.getByTestId('country-dropdown-trigger'))
    expect(screen.getByTestId('country-dropdown-trigger')).toHaveAttribute('aria-expanded', 'true')
  })

  it('should display all country options', async () => {
    render(
      <TestWrapper>
        <CountryDropdown />
      </TestWrapper>
    )
    await userEvent.click(screen.getByTestId('country-dropdown-trigger'))
    expect(screen.getByText('United States')).toBeInTheDocument()
    expect(screen.getByText('Spain')).toBeInTheDocument()
    expect(screen.getByText('United Kingdom')).toBeInTheDocument()
    expect(screen.getByText('Mexico')).toBeInTheDocument()
  })

  it('should change region when option is selected', async () => {
    render(
      <TestWrapper>
        <CountryDropdown />
      </TestWrapper>
    )
    await userEvent.click(screen.getByTestId('country-dropdown-trigger'))
    await userEvent.click(screen.getByTestId('country-dropdown-option-GB'))

    expect(regionSignal.value).toBe('GB')
  })

  it('should call onRegionChange callback', async () => {
    const onRegionChange = jest.fn()
    render(
      <TestWrapper>
        <CountryDropdown onRegionChange={onRegionChange} />
      </TestWrapper>
    )
    await userEvent.click(screen.getByTestId('country-dropdown-trigger'))
    await userEvent.click(screen.getByTestId('country-dropdown-option-ES'))

    expect(onRegionChange).toHaveBeenCalledWith('ES')
  })

  it('should announce country change', async () => {
    jest.useFakeTimers()
    render(
      <TestWrapper>
        <CountryDropdown />
      </TestWrapper>
    )

    fireEvent.click(screen.getByTestId('country-dropdown-trigger'))

    await act(async () => {
      fireEvent.click(screen.getByTestId('country-dropdown-option-MX'))
      jest.runAllTimers()
    })

    const announcer = screen.getByTestId('country-dropdown-announcer')
    expect(announcer).toHaveTextContent('Mexico')
  })

  it('should close dropdown after selection', () => {
    render(
      <TestWrapper>
        <CountryDropdown />
      </TestWrapper>
    )

    fireEvent.click(screen.getByTestId('country-dropdown-trigger'))
    fireEvent.click(screen.getByTestId('country-dropdown-option-GB'))

    expect(screen.getByTestId('country-dropdown-trigger')).toHaveAttribute('aria-expanded', 'false')
  })

  it('should apply custom className', () => {
    render(
      <TestWrapper>
        <CountryDropdown className='custom-class' />
      </TestWrapper>
    )
    expect(screen.getByTestId('country-dropdown')).toHaveClass('custom-class')
  })

  it('should have aria-haspopup="listbox" on trigger', () => {
    render(
      <TestWrapper>
        <CountryDropdown />
      </TestWrapper>
    )
    expect(screen.getByTestId('country-dropdown-trigger')).toHaveAttribute(
      'aria-haspopup',
      'listbox'
    )
  })

  it('should mark current country as selected', () => {
    render(
      <TestWrapper>
        <CountryDropdown />
      </TestWrapper>
    )

    fireEvent.click(screen.getByTestId('country-dropdown-trigger'))

    expect(screen.getByTestId('country-dropdown-option-US')).toHaveAttribute(
      'aria-selected',
      'true'
    )
    expect(screen.getByTestId('country-dropdown-option-ES')).toHaveAttribute(
      'aria-selected',
      'false'
    )
  })

  describe('Icon presence (DEF-Q1)', () => {
    it('should render trigger with icon and no visible text', () => {
      render(
        <TestWrapper>
          <CountryDropdown />
        </TestWrapper>
      )
      const trigger = screen.getByTestId('country-dropdown-trigger')
      expect(trigger.querySelector('svg')).toBeInTheDocument()
      expect(trigger.textContent).toBe('')
    })

    it('should render each option with an icon element', async () => {
      render(
        <TestWrapper>
          <CountryDropdown />
        </TestWrapper>
      )
      await userEvent.click(screen.getByTestId('country-dropdown-trigger'))

      const usOption = screen.getByTestId('country-dropdown-option-US')
      const esOption = screen.getByTestId('country-dropdown-option-ES')
      const gbOption = screen.getByTestId('country-dropdown-option-GB')
      const mxOption = screen.getByTestId('country-dropdown-option-MX')

      expect(usOption.querySelector('svg')).toBeInTheDocument()
      expect(esOption.querySelector('svg')).toBeInTheDocument()
      expect(gbOption.querySelector('svg')).toBeInTheDocument()
      expect(mxOption.querySelector('svg')).toBeInTheDocument()
    })
  })
})
