import {
  fetchBanxicoFix,
  fetchMxnRateViaCrossRate,
  computeCopMxnCrossRate,
} from './BanxicoRatesAdapter'
import { setMockBanxicoToken, resetMockBanxicoToken } from '../config/env'

// Mock fetch - type assertion for globalThis in test environment
const globalFetch = globalThis as unknown as { fetch: jest.Mock }
globalFetch.fetch = jest.fn()

// Shared setup/teardown
beforeEach(() => {
  jest.clearAllMocks()
  resetMockBanxicoToken()
})

describe('computeCopMxnCrossRate', () => {
  it('should compute cross-rate correctly', () => {
    // COP/MXN = (COP/USD) / (MXN/USD)
    // 3284.6715 / 17.4749 = 187.97
    const result = computeCopMxnCrossRate(3284.6715, 17.4749)
    expect(result).toBeCloseTo(187.97, 1)
  })

  it('should return null if copPerUsd is zero', () => {
    expect(computeCopMxnCrossRate(0, 17.4749)).toBeNull()
  })

  it('should return null if copPerUsd is negative', () => {
    expect(computeCopMxnCrossRate(-100, 17.4749)).toBeNull()
  })

  it('should return null if mxnPerUsd is zero', () => {
    expect(computeCopMxnCrossRate(3284.6715, 0)).toBeNull()
  })

  it('should return null if mxnPerUsd is negative', () => {
    expect(computeCopMxnCrossRate(3284.6715, -17.4749)).toBeNull()
  })

  it('should return null if copPerUsd is not finite', () => {
    expect(computeCopMxnCrossRate(Infinity, 17.4749)).toBeNull()
    expect(computeCopMxnCrossRate(NaN, 17.4749)).toBeNull()
  })

  it('should return null if mxnPerUsd is not finite', () => {
    expect(computeCopMxnCrossRate(3284.6715, Infinity)).toBeNull()
    expect(computeCopMxnCrossRate(3284.6715, NaN)).toBeNull()
  })
})

describe('fetchBanxicoFix - token handling', () => {
  it('should return null if token is not configured', async () => {
    // No token set
    const result = await fetchBanxicoFix()
    expect(result).toBeNull()
    expect(globalFetch.fetch).not.toHaveBeenCalled()
  })

  it('should return null if token is placeholder value', async () => {
    setMockBanxicoToken('your_banxico_token_here')
    const result = await fetchBanxicoFix()
    expect(result).toBeNull()
    expect(globalFetch.fetch).not.toHaveBeenCalled()
  })
})

describe('fetchBanxicoFix - successful parsing', () => {
  it('should fetch and parse rate correctly when token is configured', async () => {
    setMockBanxicoToken('valid_token')

    const mockResponse = {
      bmx: {
        series: [
          {
            idSerie: 'SF43718',
            titulo: 'Tipo de cambio FIX',
            datos: [{ fecha: '10/07/2026', dato: '17.5000' }],
          },
        ],
      },
    }

    globalFetch.fetch.mockResolvedValueOnce({
      ok: true,
      text: () => Promise.resolve(JSON.stringify(mockResponse)),
    })

    const result = await fetchBanxicoFix()

    expect(result).not.toBeNull()
    expect(result?.mxnPerUsd).toBe(17.5)
    expect(result?.sourceDate).toBeInstanceOf(Date)
  })

  it('should handle comma-decimal format', async () => {
    setMockBanxicoToken('valid_token')

    const mockResponse = {
      bmx: {
        series: [
          {
            idSerie: 'SF43718',
            datos: [{ fecha: '10/07/2026', dato: '17,5000' }], // Comma decimal
          },
        ],
      },
    }

    globalFetch.fetch.mockResolvedValueOnce({
      ok: true,
      text: () => Promise.resolve(JSON.stringify(mockResponse)),
    })

    const result = await fetchBanxicoFix()
    expect(result).not.toBeNull()
    expect(result?.mxnPerUsd).toBe(17.5)
  })
})

describe('fetchBanxicoFix - error handling', () => {
  it('should return null if response is not ok', async () => {
    setMockBanxicoToken('valid_token')

    globalFetch.fetch.mockResolvedValueOnce({
      ok: false,
      text: () => Promise.resolve(''),
    })

    const result = await fetchBanxicoFix()
    expect(result).toBeNull()
  })

  it('should return null if JSON is invalid', async () => {
    setMockBanxicoToken('valid_token')

    globalFetch.fetch.mockResolvedValueOnce({
      ok: true,
      text: () => Promise.resolve('not valid json'),
    })

    const result = await fetchBanxicoFix()
    expect(result).toBeNull()
  })

  it('should return null on network error', async () => {
    setMockBanxicoToken('valid_token')

    globalFetch.fetch.mockRejectedValueOnce(new Error('Network error'))

    const result = await fetchBanxicoFix()
    expect(result).toBeNull()
  })
})

describe('fetchBanxicoFix - fail-closed validation', () => {
  it('should return null if idSerie does not match', async () => {
    setMockBanxicoToken('valid_token')

    const mockResponse = {
      bmx: {
        series: [
          {
            idSerie: 'WRONG_SERIES',
            datos: [{ fecha: '10/07/2026', dato: '17.5000' }],
          },
        ],
      },
    }

    globalFetch.fetch.mockResolvedValueOnce({
      ok: true,
      text: () => Promise.resolve(JSON.stringify(mockResponse)),
    })

    const result = await fetchBanxicoFix()
    expect(result).toBeNull()
  })

  it('should return null if dato is N/E (holidays)', async () => {
    setMockBanxicoToken('valid_token')

    const mockResponse = {
      bmx: {
        series: [
          {
            idSerie: 'SF43718',
            datos: [{ fecha: '10/07/2026', dato: 'N/E' }],
          },
        ],
      },
    }

    globalFetch.fetch.mockResolvedValueOnce({
      ok: true,
      text: () => Promise.resolve(JSON.stringify(mockResponse)),
    })

    const result = await fetchBanxicoFix()
    expect(result).toBeNull()
  })

  it('should return null if series array is empty', async () => {
    setMockBanxicoToken('valid_token')

    const mockResponse = {
      bmx: {
        series: [],
      },
    }

    globalFetch.fetch.mockResolvedValueOnce({
      ok: true,
      text: () => Promise.resolve(JSON.stringify(mockResponse)),
    })

    const result = await fetchBanxicoFix()
    expect(result).toBeNull()
  })

  it('should return null if datos array is empty', async () => {
    setMockBanxicoToken('valid_token')

    const mockResponse = {
      bmx: {
        series: [
          {
            idSerie: 'SF43718',
            datos: [],
          },
        ],
      },
    }

    globalFetch.fetch.mockResolvedValueOnce({
      ok: true,
      text: () => Promise.resolve(JSON.stringify(mockResponse)),
    })

    const result = await fetchBanxicoFix()
    expect(result).toBeNull()
  })

  it('should return null if rate is zero or negative', async () => {
    setMockBanxicoToken('valid_token')

    const mockResponse = {
      bmx: {
        series: [
          {
            idSerie: 'SF43718',
            datos: [{ fecha: '10/07/2026', dato: '0' }],
          },
        ],
      },
    }

    globalFetch.fetch.mockResolvedValueOnce({
      ok: true,
      text: () => Promise.resolve(JSON.stringify(mockResponse)),
    })

    const result = await fetchBanxicoFix()
    expect(result).toBeNull()
  })
})

describe('fetchMxnRateViaCrossRate', () => {
  it('should compute COP/MXN rate from cross-rate', async () => {
    setMockBanxicoToken('valid_token')

    const mockResponse = {
      bmx: {
        series: [
          {
            idSerie: 'SF43718',
            datos: [{ fecha: '10/07/2026', dato: '17.4749' }],
          },
        ],
      },
    }

    globalFetch.fetch.mockResolvedValueOnce({
      ok: true,
      text: () => Promise.resolve(JSON.stringify(mockResponse)),
    })

    // Pass COP/USD rate of 3284.6715
    const result = await fetchMxnRateViaCrossRate(3284.6715)

    expect(result).not.toBeNull()
    // COP/MXN = 3284.6715 / 17.4749 = 187.97
    expect(result?.copPerUnit).toBeCloseTo(187.97, 1)
  })

  it('should return null if Banxico fetch fails', async () => {
    setMockBanxicoToken('valid_token')

    globalFetch.fetch.mockRejectedValueOnce(new Error('Network error'))

    const result = await fetchMxnRateViaCrossRate(3284.6715)
    expect(result).toBeNull()
  })

  it('should return null if token is not configured', async () => {
    // No token set
    const result = await fetchMxnRateViaCrossRate(3284.6715)
    expect(result).toBeNull()
  })

  it('should return null if cross-rate computation fails (invalid copPerUsd)', async () => {
    setMockBanxicoToken('valid_token')

    const mockResponse = {
      bmx: {
        series: [
          {
            idSerie: 'SF43718',
            datos: [{ fecha: '10/07/2026', dato: '17.4749' }],
          },
        ],
      },
    }

    globalFetch.fetch.mockResolvedValueOnce({
      ok: true,
      text: () => Promise.resolve(JSON.stringify(mockResponse)),
    })

    // Pass invalid copPerUsd (0)
    const result = await fetchMxnRateViaCrossRate(0)
    expect(result).toBeNull()
  })
})

describe('parseBanxicoDate edge cases', () => {
  it('should handle missing fecha in datos', async () => {
    setMockBanxicoToken('valid_token')

    const mockResponse = {
      bmx: {
        series: [
          {
            idSerie: 'SF43718',
            datos: [{ dato: '17.5000' }], // No fecha field at all
          },
        ],
      },
    }

    globalFetch.fetch.mockResolvedValueOnce({
      ok: true,
      text: () => Promise.resolve(JSON.stringify(mockResponse)),
    })

    // Should still return a rate (falls back to new Date())
    const result = await fetchBanxicoFix()
    expect(result).not.toBeNull()
  })

  it('should handle empty fecha string in response', async () => {
    setMockBanxicoToken('valid_token')

    const mockResponse = {
      bmx: {
        series: [
          {
            idSerie: 'SF43718',
            datos: [{ fecha: '', dato: '17.5000' }], // Empty fecha
          },
        ],
      },
    }

    globalFetch.fetch.mockResolvedValueOnce({
      ok: true,
      text: () => Promise.resolve(JSON.stringify(mockResponse)),
    })

    // Should still return a rate (falls back to new Date())
    const result = await fetchBanxicoFix()
    expect(result).not.toBeNull()
  })

  it('should handle invalid fecha format', async () => {
    setMockBanxicoToken('valid_token')

    const mockResponse = {
      bmx: {
        series: [
          {
            idSerie: 'SF43718',
            datos: [{ fecha: '2026-07-10', dato: '17.5000' }], // ISO format instead of DD/MM/YYYY
          },
        ],
      },
    }

    globalFetch.fetch.mockResolvedValueOnce({
      ok: true,
      text: () => Promise.resolve(JSON.stringify(mockResponse)),
    })

    // Should still return a rate (falls back to new Date())
    const result = await fetchBanxicoFix()
    expect(result).not.toBeNull()
  })

  it('should handle non-numeric fecha parts', async () => {
    setMockBanxicoToken('valid_token')

    const mockResponse = {
      bmx: {
        series: [
          {
            idSerie: 'SF43718',
            datos: [{ fecha: 'aa/bb/cccc', dato: '17.5000' }], // Non-numeric parts
          },
        ],
      },
    }

    globalFetch.fetch.mockResolvedValueOnce({
      ok: true,
      text: () => Promise.resolve(JSON.stringify(mockResponse)),
    })

    // Should still return a rate (falls back to new Date())
    const result = await fetchBanxicoFix()
    expect(result).not.toBeNull()
  })
})
