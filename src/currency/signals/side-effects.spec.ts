import { setupCurrencyPersistence } from './side-effects'
import { currencySignal, userOverriddenSignal } from './currency-signal'
import { loadCurrency, loadUserOverridden } from '../adapters/localStorage'

describe('Currency Side Effects', () => {
  beforeEach(() => {
    localStorage.clear()
    currencySignal.value = 'USD'
    userOverriddenSignal.value = false
  })

  describe('setupCurrencyPersistence', () => {
    it('should persist currency changes when userOverridden is true', () => {
      const dispose = setupCurrencyPersistence()

      // ADR-0014: Only persist when user explicitly changed currency
      userOverriddenSignal.value = true
      currencySignal.value = 'EUR'

      expect(loadCurrency()).toBe('EUR')

      dispose()
    })

    it('should NOT persist currency when userOverridden is false', () => {
      const dispose = setupCurrencyPersistence()

      // Default sync - should not persist
      currencySignal.value = 'EUR'

      expect(loadCurrency()).toBe(null)

      dispose()
    })

    it('should persist userOverridden changes when set to true', () => {
      const dispose = setupCurrencyPersistence()

      userOverriddenSignal.value = true

      expect(loadUserOverridden()).toBe(true)

      dispose()
    })

    it('should NOT persist userOverridden when false', () => {
      const dispose = setupCurrencyPersistence()

      userOverriddenSignal.value = false

      // loadUserOverridden returns false (not null) when key doesn't exist
      expect(loadUserOverridden()).toBe(false)

      dispose()
    })

    it('should stop persisting after dispose is called', () => {
      const dispose = setupCurrencyPersistence()

      // Change with override and verify it persists
      userOverriddenSignal.value = true
      currencySignal.value = 'GBP'
      expect(loadCurrency()).toBe('GBP')

      dispose()

      // Clear localStorage and change signal
      localStorage.clear()
      currencySignal.value = 'MXN'

      // Should NOT have persisted after dispose
      expect(loadCurrency()).toBe(null)
    })

    it('should return a cleanup function', () => {
      const dispose = setupCurrencyPersistence()
      expect(typeof dispose).toBe('function')
      dispose()
    })
  })
})
