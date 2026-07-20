import { signal } from '@preact/signals-react'
import type { RatesState, RateSnapshot, CachedRates } from '../types/Rate'
import type { SupportedCurrency } from '../../currency/types/Currency'
import { RATES_STORAGE_KEY, STALENESS_BOUND_MS } from '../config/series'
import { fetchAllBanrepRates } from '../adapters/BanrepRatesAdapter'
import { fetchMxnRateViaCrossRate } from '../adapters/BanxicoRatesAdapter'

/** Currency decimals: COP=0, JPY=0, others=2 */
export const CURRENCY_DECIMALS: Record<SupportedCurrency, number> = {
  COP: 0,
  USD: 2,
  EUR: 2,
  GBP: 2,
  MXN: 2,
  CNY: 2,
  JPY: 0, // Yen has no minor units
}

/** Currency symbols per ADR-0011 (CNY uses CN¥ to disambiguate from JPY ¥) */
export const CURRENCY_SYMBOLS: Record<SupportedCurrency, string> = {
  COP: '$',
  USD: '$',
  EUR: 'EUR',
  GBP: 'GBP',
  MXN: 'MX$',
  CNY: 'CN¥',
  JPY: '¥',
}

export const ratesStateSignal = signal<RatesState>({ status: 'loading', rates: {} })
export const lastRefreshSignal = signal<Date | null>(null)

function loadCache(): { rates: Partial<Record<SupportedCurrency, RateSnapshot>>; at: Date } | null {
  try {
    const s = localStorage.getItem(RATES_STORAGE_KEY)
    if (!s) return null
    const p = JSON.parse(s) as CachedRates
    if (!p.rates || !p.cachedAt) return null
    const at = new Date(p.cachedAt)
    if (!Number.isFinite(at.getTime())) return null
    const rates: Partial<Record<SupportedCurrency, RateSnapshot>> = {}
    for (const [k, v] of Object.entries(p.rates)) {
      if (v && typeof v.copPerUnit === 'number') {
        rates[k as SupportedCurrency] = {
          copPerUnit: v.copPerUnit,
          sourceDate: new Date(v.sourceDate),
          retrievedAt: new Date(v.retrievedAt),
        }
      }
    }
    return { rates, at }
  } catch {
    return null
  }
}

function saveCache(rates: Partial<Record<SupportedCurrency, RateSnapshot>>): void {
  try {
    const d: CachedRates = { rates: {}, cachedAt: new Date().toISOString() }
    for (const [k, v] of Object.entries(rates))
      // istanbul ignore next
      if (v)
        d.rates[k] = {
          copPerUnit: v.copPerUnit,
          sourceDate: v.sourceDate.toISOString(),
          retrievedAt: v.retrievedAt.toISOString(),
        }
    localStorage.setItem(RATES_STORAGE_KEY, JSON.stringify(d))
  } catch {
    /* storage unavailable */
  }
}

function applyStaleCache(): boolean {
  const c = loadCache()
  if (!c) return false
  const age = Date.now() - c.at.getTime()
  if (age >= STALENESS_BOUND_MS) return false
  ratesStateSignal.value = { status: 'stale', rates: c.rates, staleAgeMs: age }
  return true
}

/** Number of expected rates from all sources: USD, EUR, GBP, CNY, JPY (BanRep) + MXN (Banxico) */
const EXPECTED_RATE_COUNT = 6

export async function refreshRates(): Promise<void> {
  applyStaleCache()
  const br = await fetchAllBanrepRates()
  const mxn = br.USD ? await fetchMxnRateViaCrossRate(br.USD.copPerUnit) : null
  const unavail: SupportedCurrency[] = []
  for (const c of ['USD', 'EUR', 'GBP', 'CNY', 'JPY'] as const) if (!br[c]) unavail.push(c)
  if (!mxn) unavail.push('MXN')
  const all: Partial<Record<SupportedCurrency, RateSnapshot>> = { ...br }
  if (mxn) all.MXN = mxn
  const n = Object.keys(all).length
  if (n === EXPECTED_RATE_COUNT) {
    ratesStateSignal.value = { status: 'live', rates: all }
    lastRefreshSignal.value = new Date()
    saveCache(all)
  } else if (n > 0) {
    ratesStateSignal.value = { status: 'partial', rates: all, unavailableCurrencies: unavail }
    lastRefreshSignal.value = new Date()
    saveCache(all)
  } else if (!applyStaleCache()) {
    ratesStateSignal.value = { status: 'unavailable', rates: {}, error: '' }
  }
}

export function convertCopTo(amountCop: number, to: SupportedCurrency): number | null {
  if (to === 'COP') return amountCop
  const r = ratesStateSignal.value.rates[to]
  if (!r) return null
  const dec = CURRENCY_DECIMALS[to]
  return Math.round((amountCop / r.copPerUnit) * 10 ** dec) / 10 ** dec
}

/**
 * Intl.NumberFormat formatter for en-US locale with thousands separators.
 * Caches formatters per decimals count for performance.
 */
const numberFormatters: Record<number, Intl.NumberFormat> = {}

function getNumberFormatter(decimals: number): Intl.NumberFormat {
  if (!numberFormatters[decimals]) {
    numberFormatters[decimals] = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })
  }
  return numberFormatters[decimals]
}

export function formatAmount(v: number, c: SupportedCurrency): string {
  const decimals = CURRENCY_DECIMALS[c]
  const formatted = getNumberFormatter(decimals).format(v)
  const symbol = CURRENCY_SYMBOLS[c]
  return symbol + formatted + ' ' + c
}

export function initializeRates(): void {
  ratesStateSignal.value = { status: 'loading', rates: {} }
  applyStaleCache()
  void refreshRates()
}

export function getLastRefresh(): Date | null {
  return lastRefreshSignal.value
}
