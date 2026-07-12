import { useSignals } from '@preact/signals-react/runtime'
import type { ExchangeRatesPort } from '../ports/ExchangeRates'
import type { SupportedCurrency } from '../../currency/types/Currency'
import {
  ratesStateSignal,
  refreshRates,
  convertCopTo,
  getLastRefresh,
} from '../signals/rates-signal'

/**
 * Hook providing access to exchange rates functionality.
 * Implements ExchangeRatesPort interface.
 */
export function useExchangeRates(): ExchangeRatesPort {
  useSignals()

  return {
    get state(): ExchangeRatesPort['state'] {
      return ratesStateSignal.value
    },
    refresh: refreshRates,
    convert: (amountCop: number, toCurrency: SupportedCurrency): number | null =>
      convertCopTo(amountCop, toCurrency),
    getLastRefresh,
  }
}
