import {
  IP_PRIMARY_URL,
  IP_FALLBACK_URL,
  IP_TIMEOUT_MS,
  REVERSE_GEOCODE_URL,
  REVERSE_GEOCODE_TIMEOUT_MS,
  GPS_TIMEOUT_MS,
  GPS_MAXIMUM_AGE_MS,
  GPS_ENABLE_HIGH_ACCURACY,
  COUNTRY_CODE_REGEX,
} from './providers'

describe('providers config', () => {
  describe('IP geolocation providers', () => {
    it('primary URL is api.country.is', () => {
      expect(IP_PRIMARY_URL).toBe('https://api.country.is/')
    })

    it('fallback URL is get.geojs.io', () => {
      expect(IP_FALLBACK_URL).toBe('https://get.geojs.io/v1/ip/country.json')
    })

    it('timeout is 3 seconds', () => {
      expect(IP_TIMEOUT_MS).toBe(3000)
    })
  })

  describe('reverse geocoding provider', () => {
    it('URL is BigDataCloud', () => {
      expect(REVERSE_GEOCODE_URL).toBe('https://api.bigdatacloud.net/data/reverse-geocode-client')
    })

    it('timeout is 3 seconds', () => {
      expect(REVERSE_GEOCODE_TIMEOUT_MS).toBe(3000)
    })
  })

  describe('GPS parameters', () => {
    it('timeout is 5 seconds', () => {
      expect(GPS_TIMEOUT_MS).toBe(5000)
    })

    it('maximum age is 10 minutes (cached position OK)', () => {
      expect(GPS_MAXIMUM_AGE_MS).toBe(600000)
    })

    it('high accuracy is disabled (country-level sufficient)', () => {
      expect(GPS_ENABLE_HIGH_ACCURACY).toBe(false)
    })
  })

  describe('country code validation', () => {
    it('regex matches valid ISO alpha-2 codes', () => {
      expect(COUNTRY_CODE_REGEX.test('US')).toBe(true)
      expect(COUNTRY_CODE_REGEX.test('CO')).toBe(true)
      expect(COUNTRY_CODE_REGEX.test('GB')).toBe(true)
      expect(COUNTRY_CODE_REGEX.test('JP')).toBe(true)
    })

    it('regex rejects invalid codes', () => {
      expect(COUNTRY_CODE_REGEX.test('us')).toBe(false) // lowercase
      expect(COUNTRY_CODE_REGEX.test('USA')).toBe(false) // 3 letters
      expect(COUNTRY_CODE_REGEX.test('U')).toBe(false) // 1 letter
      expect(COUNTRY_CODE_REGEX.test('U1')).toBe(false) // contains number
      expect(COUNTRY_CODE_REGEX.test('')).toBe(false) // empty
    })
  })
})
