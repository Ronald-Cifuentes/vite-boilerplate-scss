import {
  currencySignal,
  userOverriddenSignal,
  currencyMetadataSignal,
  setCurrency,
  syncCurrencyToRegion,
  formatCurrency,
  resetCurrencyOverride,
} from './currency-signal'
import { CURRENCY_METADATA } from '../config/currencies'

describe('Currency Signal', () => {
  beforeEach(() => {
    // Reset to default state before each test
    currencySignal.value = 'USD'
    userOverriddenSignal.value = false
  })

  describe('currencySignal', () => {
    it('should have default value of USD', () => {
      expect(currencySignal.value).toBe('USD')
    })

    it('should be settable', () => {
      currencySignal.value = 'EUR'
      expect(currencySignal.value).toBe('EUR')
    })
  })

  describe('userOverriddenSignal', () => {
    it('should have default value of false', () => {
      expect(userOverriddenSignal.value).toBe(false)
    })

    it('should be settable', () => {
      userOverriddenSignal.value = true
      expect(userOverriddenSignal.value).toBe(true)
    })
  })

  describe('currencyMetadataSignal', () => {
    it('should return metadata for current currency', () => {
      expect(currencyMetadataSignal.value).toEqual(CURRENCY_METADATA.USD)
    })

    it('should update when currency changes', () => {
      currencySignal.value = 'GBP'
      expect(currencyMetadataSignal.value).toEqual(CURRENCY_METADATA.GBP)
    })
  })

  describe('setCurrency', () => {
    it('should set the currency', () => {
      setCurrency('EUR')
      expect(currencySignal.value).toBe('EUR')
    })

    it('should set userOverridden to true by default', () => {
      setCurrency('EUR')
      expect(userOverriddenSignal.value).toBe(true)
    })

    it('should not set userOverridden when isExplicit is false', () => {
      setCurrency('EUR', false)
      expect(currencySignal.value).toBe('EUR')
      expect(userOverriddenSignal.value).toBe(false)
    })

    it('should set userOverridden when isExplicit is true', () => {
      setCurrency('GBP', true)
      expect(userOverriddenSignal.value).toBe(true)
    })
  })

  describe('syncCurrencyToRegion', () => {
    it('should sync to region default when not overridden', () => {
      userOverriddenSignal.value = false
      syncCurrencyToRegion('ES')
      expect(currencySignal.value).toBe('EUR')
    })

    it('should sync to GB region (GBP)', () => {
      userOverriddenSignal.value = false
      syncCurrencyToRegion('GB')
      expect(currencySignal.value).toBe('GBP')
    })

    it('should sync to MX region (MXN)', () => {
      userOverriddenSignal.value = false
      syncCurrencyToRegion('MX')
      expect(currencySignal.value).toBe('MXN')
    })

    it('should NOT sync when user has overridden', () => {
      currencySignal.value = 'EUR'
      userOverriddenSignal.value = true
      syncCurrencyToRegion('US')
      expect(currencySignal.value).toBe('EUR') // Should stay EUR
    })
  })

  describe('formatCurrency', () => {
    it('should format USD correctly', () => {
      currencySignal.value = 'USD'
      const formatted = formatCurrency(1234.56)
      expect(formatted).toContain('1,234.56')
      expect(formatted).toContain('$')
    })

    it('should format EUR correctly', () => {
      currencySignal.value = 'EUR'
      const formatted = formatCurrency(1234.56)
      // EUR can be formatted as symbol (€) or code (EUR) depending on locale
      expect(formatted).toMatch(/€|EUR/)
      // EUR formats vary by locale (Spanish uses comma for decimal, different thousands separator)
      // Just check it contains the amount in some format
      expect(formatted).toMatch(/1[.\s]?234[.,]56/)
    })

    it('should format GBP correctly', () => {
      currencySignal.value = 'GBP'
      const formatted = formatCurrency(1234.56)
      expect(formatted).toContain('1,234.56')
      // GBP can be formatted as symbol (£) or code (GBP) depending on locale
      expect(formatted).toMatch(/£|GBP/)
    })

    it('should format MXN correctly', () => {
      currencySignal.value = 'MXN'
      const formatted = formatCurrency(1234.56)
      // MXN formats with Mexican locale
      expect(formatted).toMatch(/1[.,]234[.,]56/)
    })

    it('should handle zero', () => {
      currencySignal.value = 'USD'
      const formatted = formatCurrency(0)
      expect(formatted).toContain('$')
      expect(formatted).toContain('0')
    })

    it('should handle negative numbers', () => {
      currencySignal.value = 'USD'
      const formatted = formatCurrency(-500)
      expect(formatted).toContain('500')
    })
  })

  describe('resetCurrencyOverride', () => {
    it('should reset userOverridden to false', () => {
      userOverriddenSignal.value = true
      resetCurrencyOverride()
      expect(userOverriddenSignal.value).toBe(false)
    })
  })
})
