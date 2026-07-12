import { reverseGeocode } from './ReverseGeocodeAdapter'
import { REVERSE_GEOCODE_URL } from '../config/providers'

const mockFetch = jest.fn()

describe('ReverseGeocodeAdapter', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    globalThis.fetch = mockFetch as typeof fetch
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('reverseGeocode', () => {
    const mockCoords = { latitude: 6.25, longitude: -75.58 }

    it('returns country code on success', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ countryCode: 'CO', countryName: 'Colombia' }),
      })

      const result = await reverseGeocode(mockCoords)

      expect(result).toEqual({
        success: true,
        countryCode: 'CO',
      })
    })

    it('calls correct URL with coordinates', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ countryCode: 'CO' }),
      })

      await reverseGeocode(mockCoords)

      expect(mockFetch).toHaveBeenCalledWith(
        `${REVERSE_GEOCODE_URL}?latitude=6.25&longitude=-75.58&localityLanguage=en`,
        expect.objectContaining({ signal: expect.any(AbortSignal) })
      )
    })

    it('returns network error on non-ok response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      })

      const result = await reverseGeocode(mockCoords)

      expect(result).toEqual({
        success: false,
        reason: 'network',
      })
    })

    it('returns invalid error when countryCode is missing', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ countryName: 'Colombia' }),
      })

      const result = await reverseGeocode(mockCoords)

      expect(result).toEqual({
        success: false,
        reason: 'invalid',
      })
    })

    it('returns invalid error when countryCode is not string', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ countryCode: 123 }),
      })

      const result = await reverseGeocode(mockCoords)

      expect(result).toEqual({
        success: false,
        reason: 'invalid',
      })
    })

    it('returns invalid error when countryCode does not match pattern', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ countryCode: 'USA' }),
      })

      const result = await reverseGeocode(mockCoords)

      expect(result).toEqual({
        success: false,
        reason: 'invalid',
      })
    })

    it('returns network error on fetch exception', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      const result = await reverseGeocode(mockCoords)

      expect(result).toEqual({
        success: false,
        reason: 'network',
      })
    })

    it('returns timeout error on abort', async () => {
      const abortError = new Error('Aborted')
      abortError.name = 'AbortError'
      mockFetch.mockRejectedValueOnce(abortError)

      const result = await reverseGeocode(mockCoords)

      expect(result).toEqual({
        success: false,
        reason: 'timeout',
      })
    })
  })
})
