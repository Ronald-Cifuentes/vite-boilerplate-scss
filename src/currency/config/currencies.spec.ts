import {
  CURRENCY_STORAGE_KEY,
  SUPPORTED_CURRENCIES,
  CURRENCY_METADATA,
  isValidCurrency,
} from './currencies'

describe('Currency Configuration', () => {
  describe('CURRENCY_STORAGE_KEY', () => {
    it('should be a non-empty string', () => {
      expect(CURRENCY_STORAGE_KEY).toBe('app-currency')
      expect(typeof CURRENCY_STORAGE_KEY).toBe('string')
    })
  })

  describe('SUPPORTED_CURRENCIES', () => {
    it('should contain exactly 4 currencies', () => {
      expect(SUPPORTED_CURRENCIES).toHaveLength(4)
    })

    it('should include USD, EUR, GBP, MXN', () => {
      expect(SUPPORTED_CURRENCIES).toContain('USD')
      expect(SUPPORTED_CURRENCIES).toContain('EUR')
      expect(SUPPORTED_CURRENCIES).toContain('GBP')
      expect(SUPPORTED_CURRENCIES).toContain('MXN')
    })

    it('should be a constant array', () => {
      // TypeScript enforces readonly via `as const` at compile time
      // At runtime, we verify it's an array with expected values
      expect(Array.isArray(SUPPORTED_CURRENCIES)).toBe(true)
      expect(SUPPORTED_CURRENCIES).toEqual(['USD', 'EUR', 'GBP', 'MXN'])
    })
  })

  describe('CURRENCY_METADATA', () => {
    it('should have metadata for all supported currencies', () => {
      for (const currency of SUPPORTED_CURRENCIES) {
        expect(CURRENCY_METADATA[currency]).toBeDefined()
      }
    })

    it('should have correct structure for USD', () => {
      expect(CURRENCY_METADATA.USD).toEqual({
        code: 'USD',
        symbol: '$',
        name: 'US Dollar',
        localizedNameKey: 'currency.usd',
      })
    })

    it('should have correct structure for EUR', () => {
      expect(CURRENCY_METADATA.EUR).toEqual({
        code: 'EUR',
        symbol: 'EUR',
        name: 'Euro',
        localizedNameKey: 'currency.eur',
      })
    })

    it('should have correct structure for GBP', () => {
      expect(CURRENCY_METADATA.GBP).toEqual({
        code: 'GBP',
        symbol: 'GBP',
        name: 'British Pound',
        localizedNameKey: 'currency.gbp',
      })
    })

    it('should have correct structure for MXN', () => {
      expect(CURRENCY_METADATA.MXN).toEqual({
        code: 'MXN',
        symbol: 'MX$',
        name: 'Mexican Peso',
        localizedNameKey: 'currency.mxn',
      })
    })

    it('each currency should have all required fields', () => {
      for (const currency of SUPPORTED_CURRENCIES) {
        const meta = CURRENCY_METADATA[currency]
        expect(meta.code).toBe(currency)
        expect(typeof meta.symbol).toBe('string')
        expect(meta.symbol.length).toBeGreaterThan(0)
        expect(typeof meta.name).toBe('string')
        expect(meta.name.length).toBeGreaterThan(0)
        expect(typeof meta.localizedNameKey).toBe('string')
        expect(meta.localizedNameKey).toMatch(/^currency\./)
      }
    })
  })

  describe('isValidCurrency', () => {
    it('should return true for valid currencies', () => {
      expect(isValidCurrency('USD')).toBe(true)
      expect(isValidCurrency('EUR')).toBe(true)
      expect(isValidCurrency('GBP')).toBe(true)
      expect(isValidCurrency('MXN')).toBe(true)
    })

    it('should return false for invalid currencies', () => {
      expect(isValidCurrency('JPY')).toBe(false)
      expect(isValidCurrency('CHF')).toBe(false)
      expect(isValidCurrency('CAD')).toBe(false)
      expect(isValidCurrency('')).toBe(false)
      expect(isValidCurrency('usd')).toBe(false) // case sensitive
    })
  })
})
