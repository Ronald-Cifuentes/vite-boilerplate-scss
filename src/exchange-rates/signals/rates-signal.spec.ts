import {
  ratesStateSignal,
  lastRefreshSignal,
  convertCopTo,
  formatAmount,
  initializeRates,
  getLastRefresh,
  refreshRates,
  CURRENCY_DECIMALS,
  CURRENCY_SYMBOLS,
} from './rates-signal'
import { RATES_STORAGE_KEY, STALENESS_BOUND_MS } from '../config/series'
import { setMockBanxicoToken, resetMockBanxicoToken } from '../config/env'

// Mock fetch - type assertion for globalThis in test environment
const globalFetch = globalThis as unknown as { fetch: jest.Mock }
globalFetch.fetch = jest.fn()

// Mock localStorage
const localStorageMock = ((): {
  getItem: jest.Mock
  setItem: jest.Mock
  removeItem: jest.Mock
  clear: jest.Mock
} => {
  let store: Record<string, string> = {}
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key]
    }),
    clear: jest.fn(() => {
      store = {}
    }),
  }
})()
Object.defineProperty(window, 'localStorage', { value: localStorageMock })

// Shared setup/teardown
beforeEach(() => {
  jest.clearAllMocks()
  jest.useFakeTimers()
  localStorageMock.clear()
  ratesStateSignal.value = { status: 'loading', rates: {} }
  lastRefreshSignal.value = null
  resetMockBanxicoToken()
})

afterEach(() => {
  jest.useRealTimers()
})

describe('CURRENCY_DECIMALS', () => {
  it('should have 0 decimals for COP', () => {
    expect(CURRENCY_DECIMALS.COP).toBe(0)
  })

  it('should have 2 decimals for USD, EUR, GBP, MXN, CNY', () => {
    expect(CURRENCY_DECIMALS.USD).toBe(2)
    expect(CURRENCY_DECIMALS.EUR).toBe(2)
    expect(CURRENCY_DECIMALS.GBP).toBe(2)
    expect(CURRENCY_DECIMALS.MXN).toBe(2)
    expect(CURRENCY_DECIMALS.CNY).toBe(2)
  })

  it('should have 0 decimals for JPY (no minor units)', () => {
    expect(CURRENCY_DECIMALS.JPY).toBe(0)
  })
})

describe('CURRENCY_SYMBOLS', () => {
  it('should have $ for COP and USD', () => {
    expect(CURRENCY_SYMBOLS.COP).toBe('$')
    expect(CURRENCY_SYMBOLS.USD).toBe('$')
  })

  it('should have correct symbols for EUR, GBP, MXN', () => {
    expect(CURRENCY_SYMBOLS.EUR).toBe('EUR')
    expect(CURRENCY_SYMBOLS.GBP).toBe('GBP')
    expect(CURRENCY_SYMBOLS.MXN).toBe('MX$')
  })

  it('should have distinct symbols for CNY and JPY (ADR-0011 disambiguation)', () => {
    // CNY uses CN¥ to distinguish from JPY ¥
    expect(CURRENCY_SYMBOLS.CNY).toBe('CN¥')
    expect(CURRENCY_SYMBOLS.JPY).toBe('¥')
    // Verify they are different
    expect(CURRENCY_SYMBOLS.CNY).not.toBe(CURRENCY_SYMBOLS.JPY)
  })
})

describe('convertCopTo', () => {
  beforeEach(() => {
    // Set up mock rates including CNY and JPY per ADR-0011
    // CNY: 4500 / 487.62345 = 9.23
    // JPY: 4500 / 20.42564 = 220 (0 decimals)
    ratesStateSignal.value = {
      status: 'live',
      rates: {
        USD: { copPerUnit: 3284.6715, sourceDate: new Date(), retrievedAt: new Date() },
        EUR: { copPerUnit: 3750.0, sourceDate: new Date(), retrievedAt: new Date() },
        GBP: { copPerUnit: 4411.7647, sourceDate: new Date(), retrievedAt: new Date() },
        MXN: { copPerUnit: 187.9699, sourceDate: new Date(), retrievedAt: new Date() },
        CNY: { copPerUnit: 487.62345, sourceDate: new Date(), retrievedAt: new Date() },
        JPY: { copPerUnit: 20.42564, sourceDate: new Date(), retrievedAt: new Date() },
      },
    }
  })

  it('should return the same amount for COP (identity conversion)', () => {
    expect(convertCopTo(4500, 'COP')).toBe(4500)
  })

  it('should convert COP to USD correctly', () => {
    // 4500 / 3284.6715 = 1.37
    expect(convertCopTo(4500, 'USD')).toBe(1.37)
  })

  it('should convert COP to EUR correctly', () => {
    // 4500 / 3750 = 1.20
    expect(convertCopTo(4500, 'EUR')).toBe(1.2)
  })

  it('should convert COP to GBP correctly', () => {
    // 4500 / 4411.7647 = 1.02
    expect(convertCopTo(4500, 'GBP')).toBe(1.02)
  })

  it('should convert COP to MXN correctly', () => {
    // 4500 / 187.9699 = 23.94
    expect(convertCopTo(4500, 'MXN')).toBe(23.94)
  })

  it('should convert COP to CNY correctly with 2 decimals (ADR-0011)', () => {
    // 4500 / 487.62345 = 9.228... -> rounded to 9.23
    expect(convertCopTo(4500, 'CNY')).toBe(9.23)
  })

  it('should convert COP to JPY correctly with 0 decimals (ADR-0011)', () => {
    // 4500 / 20.42564 = 220.29... -> rounded to 220 (0 decimals)
    expect(convertCopTo(4500, 'JPY')).toBe(220)
  })

  it('should return null if rate is unavailable', () => {
    ratesStateSignal.value = { status: 'loading', rates: {} }
    expect(convertCopTo(4500, 'USD')).toBeNull()
  })
})

describe('formatAmount', () => {
  it('should format COP with $ symbol and no decimals', () => {
    expect(formatAmount(4500, 'COP')).toBe('$4,500 COP')
  })

  it('should format USD with $ symbol and 2 decimals', () => {
    expect(formatAmount(1.37, 'USD')).toBe('$1.37 USD')
  })

  it('should format EUR with EUR symbol and 2 decimals', () => {
    expect(formatAmount(1.2, 'EUR')).toBe('EUR1.20 EUR')
  })

  it('should format GBP with GBP symbol and 2 decimals', () => {
    expect(formatAmount(1.02, 'GBP')).toBe('GBP1.02 GBP')
  })

  it('should format MXN with MX$ symbol and 2 decimals', () => {
    expect(formatAmount(23.94, 'MXN')).toBe('MX$23.94 MXN')
  })

  it('should format CNY with CN¥ symbol and 2 decimals (ADR-0011)', () => {
    expect(formatAmount(9.23, 'CNY')).toBe('CN¥9.23 CNY')
  })

  it('should format JPY with ¥ symbol and NO decimals (ADR-0011)', () => {
    // JPY has 0 decimals - must NOT have decimal point
    expect(formatAmount(220, 'JPY')).toBe('¥220 JPY')
    // Verify there is no decimal point in the output
    expect(formatAmount(220, 'JPY')).not.toContain('.')
  })

  it('should add thousands separators', () => {
    expect(formatAmount(1234567, 'COP')).toBe('$1,234,567 COP')
  })

  it('should add thousands separators to JPY without decimals', () => {
    expect(formatAmount(12345, 'JPY')).toBe('¥12,345 JPY')
    expect(formatAmount(12345, 'JPY')).not.toContain('.')
  })
})

describe('getLastRefresh', () => {
  it('should return null initially', () => {
    expect(getLastRefresh()).toBeNull()
  })

  it('should return the last refresh date when set', () => {
    const date = new Date()
    lastRefreshSignal.value = date
    expect(getLastRefresh()).toBe(date)
  })
})

describe('initializeRates - cache handling', () => {
  it('should set loading state initially', () => {
    globalFetch.fetch.mockRejectedValue(new Error('Network error'))
    initializeRates()
    // Should be loading or stale (depending on cache)
    expect(['loading', 'stale', 'unavailable']).toContain(ratesStateSignal.value.status)
  })

  it('should load from cache if available and not stale', () => {
    const cachedData = {
      rates: {
        USD: {
          copPerUnit: 3000,
          sourceDate: new Date().toISOString(),
          retrievedAt: new Date().toISOString(),
        },
      },
      cachedAt: new Date().toISOString(),
    }
    localStorageMock.setItem(RATES_STORAGE_KEY, JSON.stringify(cachedData))
    globalFetch.fetch.mockRejectedValue(new Error('Network error'))

    initializeRates()

    expect(ratesStateSignal.value.status).toBe('stale')
    expect(ratesStateSignal.value.rates.USD).toBeDefined()
  })

  it('should not use cache if it is too old', () => {
    const oldDate = new Date(Date.now() - STALENESS_BOUND_MS - 1000)
    const cachedData = {
      rates: {
        USD: {
          copPerUnit: 3000,
          sourceDate: oldDate.toISOString(),
          retrievedAt: oldDate.toISOString(),
        },
      },
      cachedAt: oldDate.toISOString(),
    }
    localStorageMock.setItem(RATES_STORAGE_KEY, JSON.stringify(cachedData))
    globalFetch.fetch.mockRejectedValue(new Error('Network error'))

    initializeRates()

    // Should still be loading initially (cache too old)
    expect(ratesStateSignal.value.status).toBe('loading')
  })
})

describe('initializeRates - malformed cache', () => {
  it('should handle malformed cache JSON', () => {
    localStorageMock.setItem(RATES_STORAGE_KEY, 'invalid json {{')
    globalFetch.fetch.mockRejectedValue(new Error('Network error'))

    initializeRates()

    expect(ratesStateSignal.value.status).toBe('loading')
  })

  it('should handle cache with missing rates field', () => {
    localStorageMock.setItem(
      RATES_STORAGE_KEY,
      JSON.stringify({ cachedAt: new Date().toISOString() })
    )
    globalFetch.fetch.mockRejectedValue(new Error('Network error'))

    initializeRates()

    expect(ratesStateSignal.value.status).toBe('loading')
  })

  it('should handle cache with invalid cachedAt date', () => {
    const cachedData = {
      rates: {
        USD: {
          copPerUnit: 3000,
          sourceDate: new Date().toISOString(),
          retrievedAt: new Date().toISOString(),
        },
      },
      cachedAt: 'invalid-date',
    }
    localStorageMock.setItem(RATES_STORAGE_KEY, JSON.stringify(cachedData))
    globalFetch.fetch.mockRejectedValue(new Error('Network error'))

    initializeRates()

    expect(ratesStateSignal.value.status).toBe('loading')
  })

  it('should handle cache entry with invalid copPerUnit', () => {
    const cachedData = {
      rates: {
        USD: {
          copPerUnit: 'not-a-number',
          sourceDate: new Date().toISOString(),
          retrievedAt: new Date().toISOString(),
        },
      },
      cachedAt: new Date().toISOString(),
    }
    localStorageMock.setItem(RATES_STORAGE_KEY, JSON.stringify(cachedData))
    globalFetch.fetch.mockRejectedValue(new Error('Network error'))

    initializeRates()

    // Cache is valid but rate entry is invalid, so rates will be empty
    expect(ratesStateSignal.value.status).toBe('stale')
  })
})

describe('refreshRates - success scenarios', () => {
  it('should set live status when all 6 rates succeed (USD/EUR/GBP/CNY/JPY from BanRep + MXN from Banxico)', async () => {
    const mockUsdResponse = [{ id: 1, unidad: 'COP/USD', valor: 3305.38, fecha: '10/07/2026' }]
    const mockEurResponse = [{ id: 30, unidad: 'COP/EUR', valor: 3818.05, fecha: '10/07/2026' }]
    const mockGbpResponse = [{ id: 31, unidad: 'COP/GBP', valor: 4472.29, fecha: '10/07/2026' }]
    const mockCnyResponse = [{ id: 28, unidad: 'COP/CNY', valor: 487.62345, fecha: '10/07/2026' }]
    const mockJpyResponse = [{ id: 33, unidad: 'COP/JPY', valor: 20.42564, fecha: '10/07/2026' }]
    const mockMxnResponse = {
      bmx: {
        series: [{ idSerie: 'SF43718', datos: [{ fecha: '10/07/2026', dato: '17.5000' }] }],
      },
    }

    // Set up mock token for Banxico
    setMockBanxicoToken('test_token_12345')

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
      .mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(JSON.stringify(mockCnyResponse)),
      })
      .mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(JSON.stringify(mockJpyResponse)),
      })
      .mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(JSON.stringify(mockMxnResponse)),
      })

    const p = refreshRates()
    await jest.runAllTimersAsync()
    await p

    // State should be live since all 6 rates succeeded
    expect(ratesStateSignal.value.status).toBe('live')
    expect(ratesStateSignal.value.rates.USD).toBeDefined()
    expect(ratesStateSignal.value.rates.EUR).toBeDefined()
    expect(ratesStateSignal.value.rates.GBP).toBeDefined()
    expect(ratesStateSignal.value.rates.CNY).toBeDefined()
    expect(ratesStateSignal.value.rates.JPY).toBeDefined()
    expect(ratesStateSignal.value.rates.MXN).toBeDefined()
    expect(lastRefreshSignal.value).toBeInstanceOf(Date)
  })

  it('should save rates to cache on partial success', async () => {
    const mockUsdResponse = [{ id: 1, unidad: 'COP/USD', valor: 3305.38, fecha: '10/07/2026' }]
    const mockEurResponse = [{ id: 30, unidad: 'COP/EUR', valor: 3818.05, fecha: '10/07/2026' }]
    const mockGbpResponse = [{ id: 31, unidad: 'COP/GBP', valor: 4472.29, fecha: '10/07/2026' }]
    const mockCnyResponse = [{ id: 28, unidad: 'COP/CNY', valor: 487.62, fecha: '10/07/2026' }]
    const mockJpyResponse = [{ id: 33, unidad: 'COP/JPY', valor: 20.43, fecha: '10/07/2026' }]

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
      .mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(JSON.stringify(mockCnyResponse)),
      })
      .mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(JSON.stringify(mockJpyResponse)),
      })

    await refreshRates()

    expect(localStorageMock.setItem).toHaveBeenCalled()
  })
})

describe('refreshRates - failure scenarios', () => {
  it('should set partial status when some BanRep rates fail but at least one succeeds', async () => {
    const mockUsdResponse = [{ id: 1, unidad: 'COP/USD', valor: 3305.38, fecha: '10/07/2026' }]

    globalFetch.fetch
      .mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(JSON.stringify(mockUsdResponse)),
      })
      .mockResolvedValueOnce({ ok: false, text: () => Promise.resolve('') }) // EUR fails
      .mockResolvedValueOnce({ ok: false, text: () => Promise.resolve('') }) // GBP fails

    await refreshRates()

    // With only USD available (no MXN token set), state should be partial
    expect(ratesStateSignal.value.status).toBe('partial')
    expect(ratesStateSignal.value.rates.USD).toBeDefined()
  })

  it('should set unavailable status when all rates fail and no cache', async () => {
    localStorageMock.clear()
    globalFetch.fetch.mockResolvedValue({ ok: false, text: () => Promise.resolve('') })

    await refreshRates()

    expect(ratesStateSignal.value.status).toBe('unavailable')
  })

  it('should set stale status when all rates fail but valid cache exists', async () => {
    const cachedData = {
      rates: {
        USD: {
          copPerUnit: 3000,
          sourceDate: new Date().toISOString(),
          retrievedAt: new Date().toISOString(),
        },
      },
      cachedAt: new Date().toISOString(),
    }
    localStorageMock.setItem(RATES_STORAGE_KEY, JSON.stringify(cachedData))
    globalFetch.fetch.mockResolvedValue({ ok: false, text: () => Promise.resolve('') })

    await refreshRates()

    expect(ratesStateSignal.value.status).toBe('stale')
  })
})
