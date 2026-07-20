import type { RateSnapshot } from '../types/Rate'
import { SUAMECA_BASE_URL, BANREP_SERIES } from '../config/series'
import { fetchWithTimeout, parseJson, parseNum, parseDMY } from './http'

const UNIDAD_RE = /^COP\/([A-Z]{3})$/

interface SuamecaEntry {
  unidad?: string
  valor?: number | string
  fecha?: string
}

export type BanrepCurrency = 'USD' | 'EUR' | 'GBP' | 'CNY' | 'JPY'

export async function fetchBanrepRate(currency: BanrepCurrency): Promise<RateSnapshot | null> {
  const url = `${SUAMECA_BASE_URL}?idSerie=${BANREP_SERIES[currency]}`
  const text = await fetchWithTimeout(url)
  if (!text) return null

  const data = parseJson(text)
  if (!Array.isArray(data) || !data.length) return null

  const e = data[0] as SuamecaEntry
  const m = typeof e.unidad === 'string' ? UNIDAD_RE.exec(e.unidad) : null
  if (m?.[1] !== currency) return null

  const copPerUnit = parseNum(e.valor)
  if (!copPerUnit) return null

  return {
    copPerUnit,
    sourceDate: parseDMY(e.fecha) ?? new Date(),
    retrievedAt: new Date(),
  }
}

export async function fetchAllBanrepRates(): Promise<
  Partial<Record<BanrepCurrency, RateSnapshot>>
> {
  const currencies: BanrepCurrency[] = ['USD', 'EUR', 'GBP', 'CNY', 'JPY']
  const results = await Promise.all(currencies.map(fetchBanrepRate))
  const rates: Partial<Record<BanrepCurrency, RateSnapshot>> = {}
  for (let i = 0; i < currencies.length; i++) {
    const r = results[i]
    if (r) rates[currencies[i]] = r
  }
  return rates
}
