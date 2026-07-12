export type { ExchangeRatesPort } from './ports/ExchangeRates'
export type { RateStatus, RateSnapshot, RatesState, CachedRates } from './types/Rate'

export {
  BANREP_SERIES,
  BANXICO_SERIES,
  SUAMECA_BASE_URL,
  BANXICO_BASE_URL,
  RATES_STORAGE_KEY,
  STALENESS_BOUND_MS,
  FETCH_TIMEOUT_MS,
  BASE_PRICE_COP,
} from './config'

// Signals (for direct access when needed)
export {
  ratesStateSignal,
  lastRefreshSignal,
  refreshRates,
  convertCopTo,
  formatAmount,
  initializeRates,
  getLastRefresh,
  CURRENCY_DECIMALS,
  CURRENCY_SYMBOLS,
} from './signals'

// Hook (primary consumer interface)
export { useExchangeRates } from './hooks'
