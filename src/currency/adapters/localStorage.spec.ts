import {
  loadCurrency,
  saveCurrency,
  loadUserOverridden,
  saveUserOverridden,
  clearCurrencyStorage,
} from './localStorage'
import { CURRENCY_STORAGE_KEY } from '../config/currencies'

describe('Currency localStorage adapter', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe('saveCurrency', () => {
    it('should save currency to localStorage', () => {
      saveCurrency('EUR')
      expect(localStorage.getItem(CURRENCY_STORAGE_KEY)).toBe('EUR')
    })

    it('should overwrite existing currency', () => {
      saveCurrency('USD')
      saveCurrency('GBP')
      expect(localStorage.getItem(CURRENCY_STORAGE_KEY)).toBe('GBP')
    })
  })

  describe('loadCurrency', () => {
    it('should return stored currency', () => {
      localStorage.setItem(CURRENCY_STORAGE_KEY, 'MXN')
      expect(loadCurrency()).toBe('MXN')
    })

    it('should return null when no currency stored', () => {
      expect(loadCurrency()).toBeNull()
    })

    it('should return null for invalid currency', () => {
      localStorage.setItem(CURRENCY_STORAGE_KEY, 'INVALID')
      expect(loadCurrency()).toBeNull()
    })

    it('should handle localStorage errors gracefully', () => {
      const mockGetItem = jest.spyOn(Storage.prototype, 'getItem')
      mockGetItem.mockImplementation(() => {
        throw new Error('localStorage unavailable')
      })

      expect(loadCurrency()).toBeNull()
      mockGetItem.mockRestore()
    })
  })

  describe('saveUserOverridden', () => {
    it('should save true as string', () => {
      saveUserOverridden(true)
      expect(localStorage.getItem(`${CURRENCY_STORAGE_KEY}-override`)).toBe('true')
    })

    it('should remove item when false', () => {
      localStorage.setItem(`${CURRENCY_STORAGE_KEY}-override`, 'true')
      saveUserOverridden(false)
      expect(localStorage.getItem(`${CURRENCY_STORAGE_KEY}-override`)).toBeNull()
    })
  })

  describe('loadUserOverridden', () => {
    it('should return true when stored as true', () => {
      localStorage.setItem(`${CURRENCY_STORAGE_KEY}-override`, 'true')
      expect(loadUserOverridden()).toBe(true)
    })

    it('should return false when not stored', () => {
      expect(loadUserOverridden()).toBe(false)
    })

    it('should return false for any value other than true', () => {
      localStorage.setItem(`${CURRENCY_STORAGE_KEY}-override`, 'false')
      expect(loadUserOverridden()).toBe(false)
    })

    it('should handle localStorage errors gracefully', () => {
      const mockGetItem = jest.spyOn(Storage.prototype, 'getItem')
      mockGetItem.mockImplementation(() => {
        throw new Error('localStorage unavailable')
      })

      expect(loadUserOverridden()).toBe(false)
      mockGetItem.mockRestore()
    })
  })

  describe('clearCurrencyStorage', () => {
    it('should clear both currency and override keys', () => {
      localStorage.setItem(CURRENCY_STORAGE_KEY, 'EUR')
      localStorage.setItem(`${CURRENCY_STORAGE_KEY}-override`, 'true')

      clearCurrencyStorage()

      expect(localStorage.getItem(CURRENCY_STORAGE_KEY)).toBeNull()
      expect(localStorage.getItem(`${CURRENCY_STORAGE_KEY}-override`)).toBeNull()
    })
  })

  describe('error handling', () => {
    it('saveCurrency should handle errors gracefully', () => {
      const mockSetItem = jest.spyOn(Storage.prototype, 'setItem')
      mockSetItem.mockImplementation(() => {
        throw new Error('QuotaExceededError')
      })

      // Should not throw
      expect(() => saveCurrency('USD')).not.toThrow()
      mockSetItem.mockRestore()
    })

    it('saveUserOverridden should handle errors gracefully', () => {
      const mockSetItem = jest.spyOn(Storage.prototype, 'setItem')
      mockSetItem.mockImplementation(() => {
        throw new Error('QuotaExceededError')
      })

      expect(() => saveUserOverridden(true)).not.toThrow()
      mockSetItem.mockRestore()
    })

    it('clearCurrencyStorage should handle errors gracefully', () => {
      const mockRemoveItem = jest.spyOn(Storage.prototype, 'removeItem')
      mockRemoveItem.mockImplementation(() => {
        throw new Error('localStorage unavailable')
      })

      expect(() => clearCurrencyStorage()).not.toThrow()
      mockRemoveItem.mockRestore()
    })
  })
})
