import type { RateSnapshot } from '../types/Rate'
import { BANXICO_BASE_URL, BANXICO_SERIES } from '../config/series'
import { getBanxicoToken as getTokenFromEnv } from '../config/env'
import { fetchWithTimeout, parseJson, parseNum, parseDMY } from './http'

const isF = Number.isFinite

interface BxSeries {
  idSerie?: string
  datos?: Array<{ fecha?: string; dato?: string }>
}

function extractSeries(text: string): BxSeries | null {
  const j = parseJson(text) as { bmx?: { series?: BxSeries[] } } | null
  const s = j?.bmx?.series?.[0]
  return s?.idSerie === BANXICO_SERIES ? s : null
}

function parseBxResponse(text: string): { rate: number; fecha: string } | null {
  const s = extractSeries(text)
  if (!s) return null
  const d = s.datos?.[0]
  if (!d || d.dato === 'N/E') return null
  const rate = parseNum(d.dato)
  return rate ? { rate, fecha: d.fecha ?? '' } : null
}

const PH = 'your_banxico_token_here'
function getToken(): string | null {
  const t = getTokenFromEnv()
  return t && t !== PH ? t : null
}

export async function fetchBanxicoFix(): Promise<{ mxnPerUsd: number; sourceDate: Date } | null> {
  const token = getToken()
  if (!token) return null

  const url = `${BANXICO_BASE_URL}?token=${encodeURIComponent(token)}`
  const text = await fetchWithTimeout(url, { headers: { Accept: 'application/json' } })
  if (!text) return null

  const p = parseBxResponse(text)
  if (!p) return null

  return { mxnPerUsd: p.rate, sourceDate: parseDMY(p.fecha) ?? new Date() }
}

export function computeCopMxnCrossRate(copPerUsd: number, mxnPerUsd: number): number | null {
  if (!isF(copPerUsd) || copPerUsd <= 0) return null
  if (!isF(mxnPerUsd) || mxnPerUsd <= 0) return null
  const r = copPerUsd / mxnPerUsd
  /* istanbul ignore next */
  return isF(r) && r > 0 ? r : null
}

export async function fetchMxnRateViaCrossRate(copPerUsd: number): Promise<RateSnapshot | null> {
  const fix = await fetchBanxicoFix()
  if (!fix) return null
  const copPerMxn = computeCopMxnCrossRate(copPerUsd, fix.mxnPerUsd)
  if (!copPerMxn) return null
  return { copPerUnit: copPerMxn, sourceDate: fix.sourceDate, retrievedAt: new Date() }
}
