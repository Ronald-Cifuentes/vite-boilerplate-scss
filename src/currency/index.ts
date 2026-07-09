// Types
export type { CurrencyPort } from './ports/Currency'
export type { SupportedCurrency, CurrencyMetadata } from './types/Currency'

// Config
export {
  SUPPORTED_CURRENCIES,
  CURRENCY_STORAGE_KEY,
  CURRENCY_METADATA,
  isValidCurrency,
} from './config/currencies'

// Adapter
export { CurrencyProvider } from './adapters/CurrencyProvider'
export type { CurrencyProviderProps } from './adapters/CurrencyProvider'

// Hook
export { useCurrency } from './hooks/useCurrency'

// Signals (for testing)
export {
  currencySignal,
  userOverriddenSignal,
  setCurrency,
  syncCurrencyToRegion,
  resetCurrencyOverride,
} from './signals/currency-signal'
