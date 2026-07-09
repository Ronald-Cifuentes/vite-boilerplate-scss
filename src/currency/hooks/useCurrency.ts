import { useSignals } from '@preact/signals-react/runtime'
import type { CurrencyPort } from '../ports/Currency'
import type { SupportedCurrency } from '../types/Currency'
import {
  currencySignal,
  userOverriddenSignal,
  setCurrency,
  formatCurrency,
} from '../signals/currency-signal'
import { SUPPORTED_CURRENCIES } from '../config/currencies'

export function useCurrency(): CurrencyPort {
  useSignals()

  return {
    get currency(): SupportedCurrency {
      return currencySignal.value
    },
    setCurrency: (currency: SupportedCurrency) => setCurrency(currency, true),
    supportedCurrencies: SUPPORTED_CURRENCIES,
    get isUserOverridden(): boolean {
      return userOverriddenSignal.value
    },
    formatCurrency,
  }
}
