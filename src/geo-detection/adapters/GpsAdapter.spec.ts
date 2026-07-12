import { requestGpsPosition } from './GpsAdapter'
import { GPS_TIMEOUT_MS, GPS_MAXIMUM_AGE_MS, GPS_ENABLE_HIGH_ACCURACY } from '../config/providers'

describe('GpsAdapter', () => {
  const mockGeolocation = {
    getCurrentPosition: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
    Object.defineProperty(navigator, 'geolocation', {
      value: mockGeolocation,
      configurable: true,
    })
  })

  describe('requestGpsPosition', () => {
    it('returns coords when position is granted', async () => {
      mockGeolocation.getCurrentPosition.mockImplementation(success => {
        success({
          coords: {
            latitude: 6.25,
            longitude: -75.58,
          },
        })
      })

      const result = await requestGpsPosition()

      expect(result).toEqual({
        success: true,
        coords: {
          latitude: 6.25,
          longitude: -75.58,
        },
      })
    })

    it('passes correct options to getCurrentPosition', async () => {
      mockGeolocation.getCurrentPosition.mockImplementation(success => {
        success({ coords: { latitude: 0, longitude: 0 } })
      })

      await requestGpsPosition()

      expect(mockGeolocation.getCurrentPosition).toHaveBeenCalledWith(
        expect.any(Function),
        expect.any(Function),
        {
          timeout: GPS_TIMEOUT_MS,
          maximumAge: GPS_MAXIMUM_AGE_MS,
          enableHighAccuracy: GPS_ENABLE_HIGH_ACCURACY,
        }
      )
    })

    it('returns denied when permission is denied', async () => {
      mockGeolocation.getCurrentPosition.mockImplementation((_, error) => {
        const geolocationError = {
          code: 1, // PERMISSION_DENIED
          PERMISSION_DENIED: 1,
          POSITION_UNAVAILABLE: 2,
          TIMEOUT: 3,
        }
        error(geolocationError)
      })

      const result = await requestGpsPosition()

      expect(result).toEqual({
        success: false,
        reason: 'denied',
      })
    })

    it('returns timeout when request times out', async () => {
      mockGeolocation.getCurrentPosition.mockImplementation((_, error) => {
        const geolocationError = {
          code: 3, // TIMEOUT
          PERMISSION_DENIED: 1,
          POSITION_UNAVAILABLE: 2,
          TIMEOUT: 3,
        }
        error(geolocationError)
      })

      const result = await requestGpsPosition()

      expect(result).toEqual({
        success: false,
        reason: 'timeout',
      })
    })

    it('returns unavailable when position is unavailable', async () => {
      mockGeolocation.getCurrentPosition.mockImplementation((_, error) => {
        const geolocationError = {
          code: 2, // POSITION_UNAVAILABLE
          PERMISSION_DENIED: 1,
          POSITION_UNAVAILABLE: 2,
          TIMEOUT: 3,
        }
        error(geolocationError)
      })

      const result = await requestGpsPosition()

      expect(result).toEqual({
        success: false,
        reason: 'unavailable',
      })
    })

    it('returns unavailable when geolocation API does not exist', async () => {
      Object.defineProperty(navigator, 'geolocation', {
        value: undefined,
        configurable: true,
      })

      const result = await requestGpsPosition()

      expect(result).toEqual({
        success: false,
        reason: 'unavailable',
      })
    })
  })
})
