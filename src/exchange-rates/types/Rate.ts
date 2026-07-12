import type { SupportedCurrency } from '../../currency/types/Currency'

/**
 * Status of the exchange rates system.
 * - loading: Initial fetch in progress
 * - live: Fresh rates successfully fetched
 * - stale: Using cached rates (fresh fetch failed)
 * - partial: Some sources failed, some currencies unavailable
 * - unavailable: All sources failed, no usable cached rates
 */
export type RateStatus = 'loading' | 'live' | 'stale' | 'partial' | 'unavailable'

/**
 * A snapshot of an exchange rate at a point in time.
 * All rates are stored as COP per 1 foreign unit.
 */
export interface RateSnapshot {
  /** COP per 1 foreign unit (e.g., 3305.38 for USD means 1 USD = 3305.38 COP) */
  copPerUnit: number
  /** Date the rate was published by the central bank */
  sourceDate: Date
  /** When we fetched the rate */
  retrievedAt: Date
}

/**
 * Current state of the exchange rates system.
 */
export interface RatesState {
  /** Overall status of the rates */
  status: RateStatus
  /** Available rates by currency */
  rates: Partial<Record<SupportedCurrency, RateSnapshot>>
  /** If status === 'stale', how old the cache is in milliseconds */
  staleAgeMs?: number
  /** If status === 'partial', which currencies failed to load */
  unavailableCurrencies?: SupportedCurrency[]
  /** If status === 'unavailable', reason for failure */
  error?: string
}

/**
 * Shape of cached rates in localStorage.
 */
export interface CachedRates {
  rates: Record<string, { copPerUnit: number; sourceDate: string; retrievedAt: string }>
  cachedAt: string
}
