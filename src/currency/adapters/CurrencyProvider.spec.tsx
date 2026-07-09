import { render, screen, act } from '@testing-library/react'
import {
  CurrencyProvider,
  cleanupCurrencyPersistence,
  createCleanupCallback,
} from './CurrencyProvider'
import { RegionProvider, setRegion } from '../../region'
import { ThemeProvider } from '../../theme'
import {
  currencySignal,
  userOverriddenSignal,
  resetCurrencyOverride,
} from '../signals/currency-signal'
import { useCurrency } from '../hooks/useCurrency'
import { clearCurrencyStorage, saveCurrency, saveUserOverridden } from './localStorage'

// Test component that displays current currency
function TestConsumer(): React.JSX.Element {
  const { currency, isUserOverridden, formatCurrency } = useCurrency()
  return (
    <div>
      <span data-testid='currency'>{currency}</span>
      <span data-testid='overridden'>{isUserOverridden.toString()}</span>
      <span data-testid='formatted'>{formatCurrency(100)}</span>
    </div>
  )
}

// Wrapper that provides all required providers
function TestWrapper({ children }: { children: React.ReactNode }): React.JSX.Element {
  return (
    <ThemeProvider>
      <RegionProvider>
        <CurrencyProvider>{children}</CurrencyProvider>
      </RegionProvider>
    </ThemeProvider>
  )
}

describe('CurrencyProvider', () => {
  beforeEach(() => {
    localStorage.clear()
    clearCurrencyStorage()
    currencySignal.value = 'USD'
    userOverriddenSignal.value = false
    resetCurrencyOverride()
    // Reset region to US
    setRegion('US')
  })

  it('should render children', () => {
    render(
      <TestWrapper>
        <div data-testid='child'>Hello</div>
      </TestWrapper>
    )
    expect(screen.getByTestId('child')).toHaveTextContent('Hello')
  })

  it('should initialize with region default currency when no override', () => {
    render(
      <ThemeProvider>
        <RegionProvider initialRegion='ES'>
          <CurrencyProvider>
            <TestConsumer />
          </CurrencyProvider>
        </RegionProvider>
      </ThemeProvider>
    )

    // Should use ES region's default (EUR)
    expect(screen.getByTestId('currency')).toHaveTextContent('EUR')
    expect(screen.getByTestId('overridden')).toHaveTextContent('false')
  })

  it('should use initialCurrency prop when provided', () => {
    render(
      <ThemeProvider>
        <RegionProvider>
          <CurrencyProvider initialCurrency='GBP'>
            <TestConsumer />
          </CurrencyProvider>
        </RegionProvider>
      </ThemeProvider>
    )

    expect(screen.getByTestId('currency')).toHaveTextContent('GBP')
    expect(screen.getByTestId('overridden')).toHaveTextContent('true')
  })

  it('should restore persisted currency when user had override', () => {
    // Simulate previous session with override
    saveCurrency('MXN')
    saveUserOverridden(true)

    render(
      <TestWrapper>
        <TestConsumer />
      </TestWrapper>
    )

    expect(screen.getByTestId('currency')).toHaveTextContent('MXN')
    expect(screen.getByTestId('overridden')).toHaveTextContent('true')
  })

  it('should sync to region when region changes and no override', async () => {
    render(
      <TestWrapper>
        <TestConsumer />
      </TestWrapper>
    )

    expect(screen.getByTestId('currency')).toHaveTextContent('USD')

    // Change region
    act(() => {
      setRegion('GB')
    })

    // Wait for effect
    await act(async () => {
      await new Promise(r => setTimeout(r, 0))
    })

    expect(screen.getByTestId('currency')).toHaveTextContent('GBP')
  })

  it('should NOT sync to region when user has override', async () => {
    saveCurrency('EUR')
    saveUserOverridden(true)

    render(
      <TestWrapper>
        <TestConsumer />
      </TestWrapper>
    )

    expect(screen.getByTestId('currency')).toHaveTextContent('EUR')

    // Change region
    act(() => {
      setRegion('GB')
    })

    await act(async () => {
      await new Promise(r => setTimeout(r, 0))
    })

    // Should still be EUR, not GBP
    expect(screen.getByTestId('currency')).toHaveTextContent('EUR')
  })

  it('should format currency correctly', () => {
    render(
      <TestWrapper>
        <TestConsumer />
      </TestWrapper>
    )

    const formatted = screen.getByTestId('formatted').textContent
    expect(formatted).toContain('$')
    expect(formatted).toContain('100')
  })

  it('should use region default when override flag is set but no currency is persisted', () => {
    // Set override flag without a persisted currency
    saveUserOverridden(true)
    // No saveCurrency() call - so loadCurrency() will return null

    render(
      <TestWrapper>
        <TestConsumer />
      </TestWrapper>
    )

    // Should fall back to the persisted state behavior (override is true but no currency)
    // The signal will have whatever value was set before (USD from beforeEach)
    expect(screen.getByTestId('currency')).toHaveTextContent('USD')
  })

  it('should cleanup persistence on unmount', () => {
    const { unmount } = render(
      <TestWrapper>
        <TestConsumer />
      </TestWrapper>
    )

    // Unmount should trigger cleanup without errors
    expect(() => unmount()).not.toThrow()
  })

  it('should cleanup and re-initialize when initialCurrency prop changes', () => {
    // This test verifies the useEffect cleanup runs when props change
    function ReRenderableProvider({ currency }: { currency: 'USD' | 'EUR' }): React.JSX.Element {
      return (
        <ThemeProvider>
          <RegionProvider>
            <CurrencyProvider initialCurrency={currency}>
              <TestConsumer />
            </CurrencyProvider>
          </RegionProvider>
        </ThemeProvider>
      )
    }

    const { rerender } = render(<ReRenderableProvider currency='USD' />)
    expect(screen.getByTestId('currency')).toHaveTextContent('USD')

    // Re-render with new currency - this triggers cleanup of first effect
    rerender(<ReRenderableProvider currency='EUR' />)
    expect(screen.getByTestId('currency')).toHaveTextContent('EUR')
  })
})

describe('cleanupCurrencyPersistence', () => {
  it('should call dispose when ref has a function', () => {
    const disposeMock = jest.fn()
    const disposeRef = { current: disposeMock }

    cleanupCurrencyPersistence(disposeRef)

    expect(disposeMock).toHaveBeenCalled()
    expect(disposeRef.current).toBe(null)
  })

  it('should do nothing when ref is null', () => {
    const disposeRef = { current: null }

    // Should not throw
    expect(() => cleanupCurrencyPersistence(disposeRef)).not.toThrow()
    expect(disposeRef.current).toBe(null)
  })
})

describe('createCleanupCallback', () => {
  it('should return a function that calls cleanupCurrencyPersistence', () => {
    const disposeMock = jest.fn()
    const disposeRef = { current: disposeMock }

    const cleanup = createCleanupCallback(disposeRef)

    // Verify it returns a function
    expect(typeof cleanup).toBe('function')

    // Call the cleanup function
    cleanup()

    // Verify it called the dispose
    expect(disposeMock).toHaveBeenCalled()
    expect(disposeRef.current).toBe(null)
  })
})
