import { effect } from '@preact/signals-react'
import { currencySignal, userOverriddenSignal } from './currency-signal'
import { saveCurrency, saveUserOverridden } from '../adapters/localStorage'

/**
 * Side effect: persist currency to localStorage when it changes.
 * ADR-0014: Only persist when user has explicitly chosen a currency,
 * not on initial default sync from region. This allows geo detection
 * to run on first visit.
 */
export function setupCurrencyPersistence(): () => void {
  const disposeCurrency = effect(() => {
    // Read both signals to track dependencies
    const currency = currencySignal.value
    const isOverridden = userOverriddenSignal.value
    // Only persist if user explicitly changed currency
    if (isOverridden) {
      saveCurrency(currency)
    }
  })

  const disposeOverride = effect(() => {
    const isOverridden = userOverriddenSignal.value
    // Only persist override flag when true
    if (isOverridden) {
      saveUserOverridden(isOverridden)
    }
  })

  return () => {
    disposeCurrency()
    disposeOverride()
  }
}
