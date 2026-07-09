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
    it('should persist currency changes to localStorage', () => {
      const dispose = setupCurrencyPersistence()

      currencySignal.value = 'EUR'

      expect(loadCurrency()).toBe('EUR')

      dispose()
    })

    it('should persist userOverridden changes to localStorage', () => {
      const dispose = setupCurrencyPersistence()

      userOverriddenSignal.value = true

      expect(loadUserOverridden()).toBe(true)

      dispose()
    })

    it('should stop persisting after dispose is called', () => {
      const dispose = setupCurrencyPersistence()

      // Change and verify it persists
      currencySignal.value = 'GBP'
      expect(loadCurrency()).toBe('GBP')

      // Dispose
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
