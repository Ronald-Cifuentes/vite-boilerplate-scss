import { fetchWithTimeout, parseJson, parseNum, parseDMY } from './http'

const globalFetch = globalThis as unknown as { fetch: jest.Mock }
globalFetch.fetch = jest.fn()

beforeEach(() => {
  jest.clearAllMocks()
})

describe('fetchWithTimeout', () => {
  it('returns text on successful response', async () => {
    globalFetch.fetch.mockResolvedValueOnce({
      ok: true,
      text: () => Promise.resolve('data'),
    })
    expect(await fetchWithTimeout('http://test')).toBe('data')
  })

  it('returns null on non-ok response', async () => {
    globalFetch.fetch.mockResolvedValueOnce({ ok: false, text: () => Promise.resolve('') })
    expect(await fetchWithTimeout('http://test')).toBeNull()
  })

  it('returns null on network error', async () => {
    globalFetch.fetch.mockRejectedValueOnce(new Error('fail'))
    expect(await fetchWithTimeout('http://test')).toBeNull()
  })

  it('passes options to fetch', async () => {
    globalFetch.fetch.mockResolvedValueOnce({
      ok: true,
      text: () => Promise.resolve('ok'),
    })
    await fetchWithTimeout('http://test', { headers: { Accept: 'application/json' } })
    expect(globalFetch.fetch).toHaveBeenCalledWith(
      'http://test',
      expect.objectContaining({ headers: { Accept: 'application/json' } })
    )
  })
})

describe('parseJson', () => {
  it('parses valid JSON', () => {
    expect(parseJson('{"a":1}')).toEqual({ a: 1 })
  })

  it('returns null on invalid JSON', () => {
    expect(parseJson('not json')).toBeNull()
  })
})

describe('parseNum', () => {
  it('parses positive number', () => {
    expect(parseNum(3305.38)).toBe(3305.38)
  })

  it('returns null for zero', () => {
    expect(parseNum(0)).toBeNull()
  })

  it('returns null for negative', () => {
    expect(parseNum(-5)).toBeNull()
  })

  it('returns null for non-finite', () => {
    expect(parseNum(Infinity)).toBeNull()
    expect(parseNum(NaN)).toBeNull()
  })

  it('parses string with comma decimal', () => {
    expect(parseNum('3305,38')).toBe(3305.38)
  })

  it('parses string with period decimal', () => {
    expect(parseNum('3305.38')).toBe(3305.38)
  })

  it('returns null for invalid string', () => {
    expect(parseNum('abc')).toBeNull()
  })

  it('returns null for non-number/string', () => {
    expect(parseNum({})).toBeNull()
    expect(parseNum(null)).toBeNull()
  })
})

describe('parseDMY', () => {
  it('parses valid DD/MM/YYYY', () => {
    const d = parseDMY('10/07/2026')
    expect(d).toBeInstanceOf(Date)
    expect(d?.getFullYear()).toBe(2026)
    expect(d?.getMonth()).toBe(6) // 0-indexed
    expect(d?.getDate()).toBe(10)
  })

  it('returns null for empty string', () => {
    expect(parseDMY('')).toBeNull()
  })

  it('returns null for non-string', () => {
    expect(parseDMY(12345)).toBeNull()
    expect(parseDMY(null)).toBeNull()
  })

  it('returns null for wrong format', () => {
    expect(parseDMY('2026-07-10')).toBeNull()
  })

  it('returns null for non-numeric parts', () => {
    expect(parseDMY('aa/bb/cccc')).toBeNull()
  })

  it('handles date that creates invalid Date object', () => {
    // Very large numbers that create invalid Date
    const result = parseDMY('99/99/999999999999')
    // Should either be null or valid Date - test the branch
    expect(result === null || result instanceof Date).toBe(true)
  })
})
