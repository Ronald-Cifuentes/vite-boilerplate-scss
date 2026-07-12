import { FETCH_TIMEOUT_MS } from '../config/series'

const isF = Number.isFinite

/**
 * Fetch with timeout using AbortController.
 * Returns null on any error (network, timeout, non-2xx).
 */
export async function fetchWithTimeout(url: string, options?: RequestInit): Promise<string | null> {
  const ctrl = new AbortController()
  /* istanbul ignore next -- @preserve timeout callback only fires on slow networks */
  const abort = (): void => ctrl.abort()
  const t = setTimeout(abort, FETCH_TIMEOUT_MS)
  try {
    const r = await fetch(url, { ...options, signal: ctrl.signal })
    if (!r.ok) return null
    return r.text()
  } catch {
    return null
  } finally {
    clearTimeout(t)
  }
}

/** Safely parse JSON, returning null on failure. */
export function parseJson(text: string): unknown {
  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}

/**
 * Parse numeric value, handling comma-decimal format.
 * Returns null if not a positive finite number.
 */
export function parseNum(v: unknown): number | null {
  if (typeof v === 'number') {
    return isF(v) && v > 0 ? v : null
  }
  if (typeof v === 'string') {
    const n = Number(v.replace(',', '.'))
    return isF(n) && n > 0 ? n : null
  }
  return null
}

/**
 * Parse DD/MM/YYYY date string to Date.
 * Returns null on invalid format.
 */
export function parseDMY(s: unknown): Date | null {
  if (typeof s !== 'string' || !s) return null
  const p = s.split('/')
  if (p.length !== 3) return null
  const d = Number(p[0]),
    m = Number(p[1]) - 1,
    y = Number(p[2])
  if (!isF(d) || !isF(m) || !isF(y)) return null
  const dt = new Date(y, m, d)
  return isF(dt.getTime()) ? dt : null
}
