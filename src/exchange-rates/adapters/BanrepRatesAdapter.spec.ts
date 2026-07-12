import { fetchBanrepRate, fetchAllBanrepRates } from './BanrepRatesAdapter'

// Mock fetch - type assertion for globalThis in test environment
const globalFetch = globalThis as unknown as { fetch: jest.Mock }
globalFetch.fetch = jest.fn()

// Shared setup/teardown
beforeEach(() => {
  jest.clearAllMocks()
  jest.useFakeTimers()
})

afterEach(() => {
  jest.useRealTimers()
})

describe('fetchBanrepRate - successful parsing', () => {
  it('should fetch and parse USD rate correctly', async () => {
    const mockResponse = [
      {
        id: 1,
        nombre: 'Tasa Representativa del Mercado (TRM)',
        unidad: 'COP/USD',
        valor: 3305.38,
        fecha: '10/07/2026',
      },
    ]

    globalFetch.fetch.mockResolvedValueOnce({
      ok: true,
      text: () => Promise.resolve(JSON.stringify(mockResponse)),
    })

    const result = await fetchBanrepRate('USD')

    expect(result).not.toBeNull()
    expect(result?.copPerUnit).toBe(3305.38)
    expect(result?.sourceDate).toBeInstanceOf(Date)
    expect(result?.retrievedAt).toBeInstanceOf(Date)
  })

  it('should fetch and parse EUR rate correctly', async () => {
    const mockResponse = [
      {
        id: 30,
        nombre: 'Euro - COP/EUR',
        unidad: 'COP/EUR',
        valor: 3818.05,
        fecha: '10/07/2026',
      },
    ]

    globalFetch.fetch.mockResolvedValueOnce({
      ok: true,
      text: () => Promise.resolve(JSON.stringify(mockResponse)),
    })

    const result = await fetchBanrepRate('EUR')

    expect(result).not.toBeNull()
    expect(result?.copPerUnit).toBe(3818.05)
  })

  it('should fetch and parse GBP rate correctly', async () => {
    const mockResponse = [
      {
        id: 31,
        nombre: 'Libra esterlina - COP/GBP',
        unidad: 'COP/GBP',
        valor: 4472.29,
        fecha: '10/07/2026',
      },
    ]

    globalFetch.fetch.mockResolvedValueOnce({
      ok: true,
      text: () => Promise.resolve(JSON.stringify(mockResponse)),
    })

    const result = await fetchBanrepRate('GBP')

    expect(result).not.toBeNull()
    expect(result?.copPerUnit).toBe(4472.29)
  })

  it('should handle comma-decimal format (M2 anti-pattern mitigation)', async () => {
    const mockResponse = [
      {
        id: 1,
        unidad: 'COP/USD',
        valor: '3305,38', // Comma-decimal format
        fecha: '10/07/2026',
      },
    ]

    globalFetch.fetch.mockResolvedValueOnce({
      ok: true,
      text: () => Promise.resolve(JSON.stringify(mockResponse)),
    })

    const result = await fetchBanrepRate('USD')
    expect(result).not.toBeNull()
    expect(result?.copPerUnit).toBe(3305.38)
  })
})

describe('fetchBanrepRate - error handling', () => {
  it('should return null if response is not ok', async () => {
    globalFetch.fetch.mockResolvedValueOnce({
      ok: false,
      text: () => Promise.resolve(''),
    })

    const result = await fetchBanrepRate('USD')
    expect(result).toBeNull()
  })

  it('should return null if JSON is invalid', async () => {
    globalFetch.fetch.mockResolvedValueOnce({
      ok: true,
      text: () => Promise.resolve('invalid json'),
    })

    const result = await fetchBanrepRate('USD')
    expect(result).toBeNull()
  })

  it('should return null on network error', async () => {
    globalFetch.fetch.mockRejectedValueOnce(new Error('Network error'))

    const result = await fetchBanrepRate('USD')
    expect(result).toBeNull()
  })

  it('should return null if response is empty array', async () => {
    globalFetch.fetch.mockResolvedValueOnce({
      ok: true,
      text: () => Promise.resolve('[]'),
    })

    const result = await fetchBanrepRate('USD')
    expect(result).toBeNull()
  })
})

describe('fetchBanrepRate - fail-closed validation (H3 anti-pattern)', () => {
  it('should return null if unidad field is missing', async () => {
    const mockResponse = [
      {
        id: 1,
        nombre: 'TRM',
        valor: 3305.38,
        fecha: '10/07/2026',
        // Missing unidad field
      },
    ]

    globalFetch.fetch.mockResolvedValueOnce({
      ok: true,
      text: () => Promise.resolve(JSON.stringify(mockResponse)),
    })

    const result = await fetchBanrepRate('USD')
    expect(result).toBeNull()
  })

  it('should return null if unidad field has wrong orientation', async () => {
    const mockResponse = [
      {
        id: 1,
        nombre: 'TRM',
        unidad: 'USD/COP', // Wrong orientation - should be COP/USD
        valor: 3305.38,
        fecha: '10/07/2026',
      },
    ]

    globalFetch.fetch.mockResolvedValueOnce({
      ok: true,
      text: () => Promise.resolve(JSON.stringify(mockResponse)),
    })

    const result = await fetchBanrepRate('USD')
    expect(result).toBeNull()
  })
})

describe('fetchBanrepRate - valor validation', () => {
  it('should return null if valor is not a positive number', async () => {
    const mockResponse = [
      {
        id: 1,
        unidad: 'COP/USD',
        valor: -100,
        fecha: '10/07/2026',
      },
    ]

    globalFetch.fetch.mockResolvedValueOnce({
      ok: true,
      text: () => Promise.resolve(JSON.stringify(mockResponse)),
    })

    const result = await fetchBanrepRate('USD')
    expect(result).toBeNull()
  })

  it('should return null if valor is zero', async () => {
    const mockResponse = [
      {
        id: 1,
        unidad: 'COP/USD',
        valor: 0,
        fecha: '10/07/2026',
      },
    ]

    globalFetch.fetch.mockResolvedValueOnce({
      ok: true,
      text: () => Promise.resolve(JSON.stringify(mockResponse)),
    })

    const result = await fetchBanrepRate('USD')
    expect(result).toBeNull()
  })

  it('should return null if valor is not number or string', async () => {
    const mockResponse = [
      {
        id: 1,
        unidad: 'COP/USD',
        valor: { nested: 'object' }, // Not a number or string
        fecha: '10/07/2026',
      },
    ]

    globalFetch.fetch.mockResolvedValueOnce({
      ok: true,
      text: () => Promise.resolve(JSON.stringify(mockResponse)),
    })

    const result = await fetchBanrepRate('USD')
    expect(result).toBeNull()
  })

  it('should return null if valor string parses to invalid number', async () => {
    const mockResponse = [
      {
        id: 1,
        unidad: 'COP/USD',
        valor: 'not-a-number',
        fecha: '10/07/2026',
      },
    ]

    globalFetch.fetch.mockResolvedValueOnce({
      ok: true,
      text: () => Promise.resolve(JSON.stringify(mockResponse)),
    })

    const result = await fetchBanrepRate('USD')
    expect(result).toBeNull()
  })

  it('should return null if valor string parses to negative number', async () => {
    const mockResponse = [
      {
        id: 1,
        unidad: 'COP/USD',
        valor: '-100', // Negative as string
        fecha: '10/07/2026',
      },
    ]

    globalFetch.fetch.mockResolvedValueOnce({
      ok: true,
      text: () => Promise.resolve(JSON.stringify(mockResponse)),
    })

    const result = await fetchBanrepRate('USD')
    expect(result).toBeNull()
  })
})

describe('fetchBanrepRate - fecha parsing', () => {
  it('should handle fecha that is not a string', async () => {
    const mockResponse = [
      {
        id: 1,
        unidad: 'COP/USD',
        valor: 3305.38,
        fecha: 12345, // Not a string
      },
    ]

    globalFetch.fetch.mockResolvedValueOnce({
      ok: true,
      text: () => Promise.resolve(JSON.stringify(mockResponse)),
    })

    const result = await fetchBanrepRate('USD')
    // Should still succeed (fecha parsing returns null, falls back to new Date())
    expect(result).not.toBeNull()
  })

  it('should handle fecha with invalid format', async () => {
    const mockResponse = [
      {
        id: 1,
        unidad: 'COP/USD',
        valor: 3305.38,
        fecha: '2026-07-10', // Wrong format (ISO instead of DD/MM/YYYY)
      },
    ]

    globalFetch.fetch.mockResolvedValueOnce({
      ok: true,
      text: () => Promise.resolve(JSON.stringify(mockResponse)),
    })

    const result = await fetchBanrepRate('USD')
    // Should still succeed (fecha parsing returns null, falls back to new Date())
    expect(result).not.toBeNull()
  })

  it('should handle fecha with non-numeric parts', async () => {
    const mockResponse = [
      {
        id: 1,
        unidad: 'COP/USD',
        valor: 3305.38,
        fecha: 'aa/bb/cccc', // Non-numeric parts
      },
    ]

    globalFetch.fetch.mockResolvedValueOnce({
      ok: true,
      text: () => Promise.resolve(JSON.stringify(mockResponse)),
    })

    const result = await fetchBanrepRate('USD')
    // Should still succeed (fecha parsing returns null, falls back to new Date())
    expect(result).not.toBeNull()
  })

  it('should handle fecha that creates invalid Date', async () => {
    const mockResponse = [
      {
        id: 1,
        unidad: 'COP/USD',
        valor: 3305.38,
        fecha: '99/99/9999', // Valid format but invalid date
      },
    ]

    globalFetch.fetch.mockResolvedValueOnce({
      ok: true,
      text: () => Promise.resolve(JSON.stringify(mockResponse)),
    })

    const result = await fetchBanrepRate('USD')
    // Should still succeed (falls back to new Date())
    expect(result).not.toBeNull()
  })
})

describe('fetchAllBanrepRates', () => {
  it('should fetch all three rates in parallel', async () => {
    const mockUsdResponse = [{ id: 1, unidad: 'COP/USD', valor: 3305.38, fecha: '10/07/2026' }]
    const mockEurResponse = [{ id: 30, unidad: 'COP/EUR', valor: 3818.05, fecha: '10/07/2026' }]
    const mockGbpResponse = [{ id: 31, unidad: 'COP/GBP', valor: 4472.29, fecha: '10/07/2026' }]

    globalFetch.fetch
      .mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(JSON.stringify(mockUsdResponse)),
      })
      .mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(JSON.stringify(mockEurResponse)),
      })
      .mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(JSON.stringify(mockGbpResponse)),
      })

    const result = await fetchAllBanrepRates()

    expect(result.USD).toBeDefined()
    expect(result.EUR).toBeDefined()
    expect(result.GBP).toBeDefined()
    expect(result.USD?.copPerUnit).toBe(3305.38)
    expect(result.EUR?.copPerUnit).toBe(3818.05)
    expect(result.GBP?.copPerUnit).toBe(4472.29)
  })

  it('should return partial results if some fail', async () => {
    const mockUsdResponse = [{ id: 1, unidad: 'COP/USD', valor: 3305.38, fecha: '10/07/2026' }]

    globalFetch.fetch
      .mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(JSON.stringify(mockUsdResponse)),
      })
      .mockResolvedValueOnce({ ok: false, text: () => Promise.resolve('') })
      .mockResolvedValueOnce({ ok: false, text: () => Promise.resolve('') })

    const result = await fetchAllBanrepRates()

    expect(result.USD).toBeDefined()
    expect(result.EUR).toBeUndefined()
    expect(result.GBP).toBeUndefined()
  })

  it('should return empty object if all fail', async () => {
    globalFetch.fetch
      .mockResolvedValueOnce({ ok: false, text: () => Promise.resolve('') })
      .mockResolvedValueOnce({ ok: false, text: () => Promise.resolve('') })
      .mockResolvedValueOnce({ ok: false, text: () => Promise.resolve('') })

    const result = await fetchAllBanrepRates()

    expect(Object.keys(result)).toHaveLength(0)
  })
})
