import type { SupportedCurrency } from '../types/Currency'

export interface CurrencyPort {
  currency: SupportedCurrency
  setCurrency: (currency: SupportedCurrency) => void
  supportedCurrencies: readonly SupportedCurrency[]
  isUserOverridden: boolean

  /** Format a value in the current currency */
  formatCurrency: (value: number) => string
}
