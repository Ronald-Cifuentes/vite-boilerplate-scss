import { render, screen, fireEvent, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CurrencyDropdown } from './CurrencyDropdown'
import { I18nProvider } from '../../../../i18n'
import { ThemeProvider } from '../../../../theme'
import { RegionProvider } from '../../../../region'
import { CurrencyProvider } from '../../../../currency'
import {
  currencySignal,
  userOverriddenSignal,
  resetCurrencyOverride,
} from '../../../../currency/signals/currency-signal'
import { clearCurrencyStorage } from '../../../../currency/adapters/localStorage'
import { resetAnnouncements } from '../../signals/announcement-signal'

function TestWrapper({ children }: { children: React.ReactNode }): React.JSX.Element {
  return (
    <ThemeProvider>
      <RegionProvider>
        <CurrencyProvider>
          <I18nProvider>{children}</I18nProvider>
        </CurrencyProvider>
      </RegionProvider>
    </ThemeProvider>
  )
}

describe('CurrencyDropdown', () => {
  beforeEach(() => {
    localStorage.clear()
    clearCurrencyStorage()
    // Wrap signal mutations in act
    act(() => {
      currencySignal.value = 'USD'
      userOverriddenSignal.value = false
      resetCurrencyOverride()
      resetAnnouncements()
    })
    document.body.innerHTML = ''
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('should render the dropdown trigger', () => {
    render(
      <TestWrapper>
        <CurrencyDropdown />
      </TestWrapper>
    )
    expect(screen.getByTestId('currency-dropdown-trigger')).toBeInTheDocument()
  })

  it('should have accessible trigger label', () => {
    render(
      <TestWrapper>
        <CurrencyDropdown />
      </TestWrapper>
    )
    const trigger = screen.getByTestId('currency-dropdown-trigger')
    expect(trigger).toHaveAttribute('aria-label')
    expect(trigger.getAttribute('aria-label')).toContain('US Dollar')
  })

  it('should open dropdown on click', async () => {
    render(
      <TestWrapper>
        <CurrencyDropdown />
      </TestWrapper>
    )
    await userEvent.click(screen.getByTestId('currency-dropdown-trigger'))
    expect(screen.getByTestId('currency-dropdown-trigger')).toHaveAttribute('aria-expanded', 'true')
  })

  it('should display all currency options', async () => {
    render(
      <TestWrapper>
        <CurrencyDropdown />
      </TestWrapper>
    )
    await userEvent.click(screen.getByTestId('currency-dropdown-trigger'))
    expect(screen.getByText('US Dollar')).toBeInTheDocument()
    expect(screen.getByText('Euro')).toBeInTheDocument()
    expect(screen.getByText('British Pound')).toBeInTheDocument()
    expect(screen.getByText('Mexican Peso')).toBeInTheDocument()
  })

  it('should change currency when option is selected', async () => {
    render(
      <TestWrapper>
        <CurrencyDropdown />
      </TestWrapper>
    )
    await userEvent.click(screen.getByTestId('currency-dropdown-trigger'))
    await userEvent.click(screen.getByTestId('currency-dropdown-option-EUR'))

    expect(currencySignal.value).toBe('EUR')
  })

  it('should set user override when currency is selected', () => {
    render(
      <TestWrapper>
        <CurrencyDropdown />
      </TestWrapper>
    )
    expect(userOverriddenSignal.value).toBe(false)

    fireEvent.click(screen.getByTestId('currency-dropdown-trigger'))
    fireEvent.click(screen.getByTestId('currency-dropdown-option-GBP'))

    expect(userOverriddenSignal.value).toBe(true)
  })

  it('should call onCurrencyChange callback', async () => {
    const onCurrencyChange = jest.fn()
    render(
      <TestWrapper>
        <CurrencyDropdown onCurrencyChange={onCurrencyChange} />
      </TestWrapper>
    )
    await userEvent.click(screen.getByTestId('currency-dropdown-trigger'))
    await userEvent.click(screen.getByTestId('currency-dropdown-option-MXN'))

    expect(onCurrencyChange).toHaveBeenCalledWith('MXN')
  })

  it('should announce currency change', async () => {
    jest.useFakeTimers()
    render(
      <TestWrapper>
        <CurrencyDropdown />
      </TestWrapper>
    )

    fireEvent.click(screen.getByTestId('currency-dropdown-trigger'))

    await act(async () => {
      fireEvent.click(screen.getByTestId('currency-dropdown-option-EUR'))
      jest.runAllTimers()
    })

    const announcer = screen.getByTestId('currency-dropdown-announcer')
    expect(announcer).toHaveTextContent('Euro')
  })

  it('should close dropdown after selection', () => {
    render(
      <TestWrapper>
        <CurrencyDropdown />
      </TestWrapper>
    )

    fireEvent.click(screen.getByTestId('currency-dropdown-trigger'))
    fireEvent.click(screen.getByTestId('currency-dropdown-option-GBP'))

    expect(screen.getByTestId('currency-dropdown-trigger')).toHaveAttribute(
      'aria-expanded',
      'false'
    )
  })

  it('should apply custom className', () => {
    render(
      <TestWrapper>
        <CurrencyDropdown className='custom-class' />
      </TestWrapper>
    )
    expect(screen.getByTestId('currency-dropdown')).toHaveClass('custom-class')
  })

  it('should have aria-haspopup="listbox" on trigger', () => {
    render(
      <TestWrapper>
        <CurrencyDropdown />
      </TestWrapper>
    )
    expect(screen.getByTestId('currency-dropdown-trigger')).toHaveAttribute(
      'aria-haspopup',
      'listbox'
    )
  })

  it('should mark current currency as selected', () => {
    render(
      <TestWrapper>
        <CurrencyDropdown />
      </TestWrapper>
    )

    fireEvent.click(screen.getByTestId('currency-dropdown-trigger'))

    expect(screen.getByTestId('currency-dropdown-option-USD')).toHaveAttribute(
      'aria-selected',
      'true'
    )
    expect(screen.getByTestId('currency-dropdown-option-EUR')).toHaveAttribute(
      'aria-selected',
      'false'
    )
  })

  describe('Icon presence (DEF-Q1)', () => {
    it('should render trigger with icon and no visible text', () => {
      render(
        <TestWrapper>
          <CurrencyDropdown />
        </TestWrapper>
      )
      const trigger = screen.getByTestId('currency-dropdown-trigger')
      expect(trigger.querySelector('svg')).toBeInTheDocument()
      expect(trigger.textContent).toBe('')
    })

    it('should render each option with an icon element', async () => {
      render(
        <TestWrapper>
          <CurrencyDropdown />
        </TestWrapper>
      )
      await userEvent.click(screen.getByTestId('currency-dropdown-trigger'))

      const usdOption = screen.getByTestId('currency-dropdown-option-USD')
      const eurOption = screen.getByTestId('currency-dropdown-option-EUR')
      const gbpOption = screen.getByTestId('currency-dropdown-option-GBP')
      const mxnOption = screen.getByTestId('currency-dropdown-option-MXN')

      expect(usdOption.querySelector('svg')).toBeInTheDocument()
      expect(eurOption.querySelector('svg')).toBeInTheDocument()
      expect(gbpOption.querySelector('svg')).toBeInTheDocument()
      expect(mxnOption.querySelector('svg')).toBeInTheDocument()
    })
  })
})
