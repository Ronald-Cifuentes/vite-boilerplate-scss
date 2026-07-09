import { renderHook, act } from '@testing-library/react'
import { useCurrency } from './useCurrency'
import {
  currencySignal,
  userOverriddenSignal,
  resetCurrencyOverride,
} from '../signals/currency-signal'
import { SUPPORTED_CURRENCIES } from '../config/currencies'

describe('useCurrency hook', () => {
  beforeEach(() => {
    currencySignal.value = 'USD'
    userOverriddenSignal.value = false
    resetCurrencyOverride()
  })

  it('should return current currency', () => {
    const { result } = renderHook(() => useCurrency())
    expect(result.current.currency).toBe('USD')
  })

  it('should return supportedCurrencies', () => {
    const { result } = renderHook(() => useCurrency())
    expect(result.current.supportedCurrencies).toEqual(SUPPORTED_CURRENCIES)
  })

  it('should return isUserOverridden', () => {
    const { result } = renderHook(() => useCurrency())
    expect(result.current.isUserOverridden).toBe(false)
  })

  it('should return formatCurrency function', () => {
    const { result } = renderHook(() => useCurrency())
    expect(typeof result.current.formatCurrency).toBe('function')
  })

  it('setCurrency should update currency and set override', () => {
    const { result } = renderHook(() => useCurrency())

    act(() => {
      result.current.setCurrency('EUR')
    })

    expect(result.current.currency).toBe('EUR')
    expect(result.current.isUserOverridden).toBe(true)
  })

  it('formatCurrency should format with current currency', () => {
    const { result } = renderHook(() => useCurrency())

    const formatted = result.current.formatCurrency(1000)
    expect(formatted).toContain('$')
    expect(formatted).toContain('1,000')
  })

  it('should react to signal changes', () => {
    const { result } = renderHook(() => useCurrency())

    act(() => {
      currencySignal.value = 'GBP'
    })

    expect(result.current.currency).toBe('GBP')
  })

  it('should react to override signal changes', () => {
    const { result } = renderHook(() => useCurrency())

    act(() => {
      userOverriddenSignal.value = true
    })

    expect(result.current.isUserOverridden).toBe(true)
  })
})
