import type { SupportedCurrency } from '../../currency/types/Currency'
import type { RatesState } from '../types/Rate'

/**
 * Port interface for exchange rates functionality.
 * Implemented by the rates signal system and consumed via useExchangeRates hook.
 */
export interface ExchangeRatesPort {
  /** Current state of all exchange rates */
  state: RatesState
  /** Trigger a refresh of exchange rates */
  refresh: () => Promise<void>
  /** Convert an amount in COP to the target currency. Returns null if rate unavailable. */
  convert: (amountCop: number, toCurrency: SupportedCurrency) => number | null
  /** Get the timestamp of the last successful refresh, or null if never refreshed */
  getLastRefresh: () => Date | null
}
