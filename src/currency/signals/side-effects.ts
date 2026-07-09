import { effect } from '@preact/signals-react'
import { currencySignal, userOverriddenSignal } from './currency-signal'
import { saveCurrency, saveUserOverridden } from '../adapters/localStorage'

/**
 * Side effect: persist currency to localStorage when it changes.
 * Also persists the user override flag.
 */
export function setupCurrencyPersistence(): () => void {
  const disposeCurrency = effect(() => {
    saveCurrency(currencySignal.value)
  })

  const disposeOverride = effect(() => {
    saveUserOverridden(userOverriddenSignal.value)
  })

  return () => {
    disposeCurrency()
    disposeOverride()
  }
}
