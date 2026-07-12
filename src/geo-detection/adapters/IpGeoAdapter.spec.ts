import { getIpCountry } from './IpGeoAdapter'
import { IP_PRIMARY_URL, IP_FALLBACK_URL } from '../config/providers'

const mockFetch = jest.fn()

describe('IpGeoAdapter', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    globalThis.fetch = mockFetch as typeof fetch
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('getIpCountry', () => {
    it('returns country code from primary provider on success', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ country: 'CO', ip: '1.2.3.4' }),
      })

      const result = await getIpCountry()

      expect(result).toEqual({
        success: true,
        countryCode: 'CO',
      })
      expect(mockFetch).toHaveBeenCalledTimes(1)
      expect(mockFetch).toHaveBeenCalledWith(
        IP_PRIMARY_URL,
        expect.objectContaining({ signal: expect.any(AbortSignal) })
      )
    })

    it('falls back to secondary provider when primary fails', async () => {
      mockFetch.mockResolvedValueOnce({ ok: false, status: 500 }).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ country: 'US' }),
      })

      const result = await getIpCountry()

      expect(result).toEqual({
        success: true,
        countryCode: 'US',
      })
      expect(mockFetch).toHaveBeenCalledTimes(2)
      expect(mockFetch).toHaveBeenNthCalledWith(
        2,
        IP_FALLBACK_URL,
        expect.objectContaining({ signal: expect.any(AbortSignal) })
      )
    })

    it('returns failure when both providers fail', async () => {
      mockFetch.mockResolvedValueOnce({ ok: false }).mockResolvedValueOnce({ ok: false })

      const result = await getIpCountry()

      expect(result).toEqual({
        success: false,
        reason: 'network',
      })
      expect(mockFetch).toHaveBeenCalledTimes(2)
    })

    it('returns invalid when primary returns invalid country code', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ country: 'invalid' }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ country: 'GB' }),
        })

      const result = await getIpCountry()

      // Should fall back and succeed with GB
      expect(result).toEqual({
        success: true,
        countryCode: 'GB',
      })
    })

    it('handles timeout on primary and succeeds on fallback', async () => {
      const abortError = new Error('Aborted')
      abortError.name = 'AbortError'
      mockFetch.mockRejectedValueOnce(abortError).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ country: 'JP' }),
      })

      const result = await getIpCountry()

      expect(result).toEqual({
        success: true,
        countryCode: 'JP',
      })
    })

    it('validates country code format strictly', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ country: 'usa' }), // lowercase
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ country: 'MX' }),
        })

      const result = await getIpCountry()

      // Should reject lowercase and fall back
      expect(result).toEqual({
        success: true,
        countryCode: 'MX',
      })
    })

    it('handles non-AbortError network errors', async () => {
      // First fetch throws regular error (not AbortError)
      mockFetch.mockRejectedValueOnce(new Error('Network failed')).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ country: 'ES' }),
      })

      const result = await getIpCountry()

      expect(result).toEqual({
        success: true,
        countryCode: 'ES',
      })
    })

    it('returns network error when both fail with regular errors', async () => {
      mockFetch
        .mockRejectedValueOnce(new Error('Network failed'))
        .mockRejectedValueOnce(new Error('Network failed again'))

      const result = await getIpCountry()

      expect(result).toEqual({
        success: false,
        reason: 'network',
      })
    })
  })
})
