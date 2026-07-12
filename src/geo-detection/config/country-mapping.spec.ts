import {
  COUNTRY_TO_PREFS,
  SUPPORTED_COUNTRIES,
  isSupportedCountry,
  getPrefsForCountry,
} from './country-mapping'

describe('country-mapping', () => {
  describe('COUNTRY_TO_PREFS', () => {
    it('maps CO to es/CO/COP', () => {
      expect(COUNTRY_TO_PREFS.CO).toEqual({
        locale: 'es',
        region: 'CO',
        currency: 'COP',
      })
    })

    it('maps US to en/US/USD', () => {
      expect(COUNTRY_TO_PREFS.US).toEqual({
        locale: 'en',
        region: 'US',
        currency: 'USD',
      })
    })

    it('maps ES to es/ES/EUR', () => {
      expect(COUNTRY_TO_PREFS.ES).toEqual({
        locale: 'es',
        region: 'ES',
        currency: 'EUR',
      })
    })

    it('maps GB to en/GB/GBP', () => {
      expect(COUNTRY_TO_PREFS.GB).toEqual({
        locale: 'en',
        region: 'GB',
        currency: 'GBP',
      })
    })

    it('maps MX to es/MX/MXN', () => {
      expect(COUNTRY_TO_PREFS.MX).toEqual({
        locale: 'es',
        region: 'MX',
        currency: 'MXN',
      })
    })

    it('maps CN to zh/CN/CNY', () => {
      expect(COUNTRY_TO_PREFS.CN).toEqual({
        locale: 'zh',
        region: 'CN',
        currency: 'CNY',
      })
    })

    it('maps JP to ja/JP/JPY', () => {
      expect(COUNTRY_TO_PREFS.JP).toEqual({
        locale: 'ja',
        region: 'JP',
        currency: 'JPY',
      })
    })
  })

  describe('SUPPORTED_COUNTRIES', () => {
    it('contains all 7 supported countries', () => {
      expect(SUPPORTED_COUNTRIES).toHaveLength(7)
      expect(SUPPORTED_COUNTRIES).toContain('CO')
      expect(SUPPORTED_COUNTRIES).toContain('US')
      expect(SUPPORTED_COUNTRIES).toContain('ES')
      expect(SUPPORTED_COUNTRIES).toContain('GB')
      expect(SUPPORTED_COUNTRIES).toContain('MX')
      expect(SUPPORTED_COUNTRIES).toContain('CN')
      expect(SUPPORTED_COUNTRIES).toContain('JP')
    })
  })

  describe('isSupportedCountry', () => {
    it('returns true for supported countries', () => {
      expect(isSupportedCountry('CO')).toBe(true)
      expect(isSupportedCountry('US')).toBe(true)
      expect(isSupportedCountry('ES')).toBe(true)
      expect(isSupportedCountry('GB')).toBe(true)
      expect(isSupportedCountry('MX')).toBe(true)
      expect(isSupportedCountry('CN')).toBe(true)
      expect(isSupportedCountry('JP')).toBe(true)
    })

    it('returns false for unsupported countries', () => {
      expect(isSupportedCountry('FR')).toBe(false)
      expect(isSupportedCountry('DE')).toBe(false)
      expect(isSupportedCountry('IT')).toBe(false)
      expect(isSupportedCountry('BR')).toBe(false)
    })

    it('returns false for invalid input', () => {
      expect(isSupportedCountry('')).toBe(false)
      expect(isSupportedCountry('co')).toBe(false) // lowercase
      expect(isSupportedCountry('USA')).toBe(false) // 3 letters
    })
  })

  describe('getPrefsForCountry', () => {
    it('returns prefs for supported country', () => {
      const prefs = getPrefsForCountry('CO')
      expect(prefs).toEqual({
        locale: 'es',
        region: 'CO',
        currency: 'COP',
      })
    })

    it('returns null for unsupported country', () => {
      expect(getPrefsForCountry('FR')).toBeNull()
      expect(getPrefsForCountry('DE')).toBeNull()
    })

    it('returns null for invalid input', () => {
      expect(getPrefsForCountry('')).toBeNull()
      expect(getPrefsForCountry('invalid')).toBeNull()
    })
  })
})
