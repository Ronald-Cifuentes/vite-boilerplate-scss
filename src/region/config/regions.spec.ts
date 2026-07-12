import {
  REGION_STORAGE_KEY,
  DEFAULT_REGION,
  SUPPORTED_REGIONS,
  REGION_METADATA,
  isValidRegion,
} from './regions'

describe('Region Configuration', () => {
  describe('Constants', () => {
    it('REGION_STORAGE_KEY is defined as app-region', () => {
      expect(REGION_STORAGE_KEY).toBe('app-region')
    })

    it('DEFAULT_REGION is US', () => {
      expect(DEFAULT_REGION).toBe('US')
    })

    it('SUPPORTED_REGIONS includes all expected regions in order', () => {
      expect(SUPPORTED_REGIONS).toContain('US')
      expect(SUPPORTED_REGIONS).toContain('ES')
      expect(SUPPORTED_REGIONS).toContain('GB')
      expect(SUPPORTED_REGIONS).toContain('MX')
      expect(SUPPORTED_REGIONS).toContain('CO')
      expect(SUPPORTED_REGIONS).toContain('CN')
      expect(SUPPORTED_REGIONS).toContain('JP')
      expect(SUPPORTED_REGIONS).toHaveLength(7)
      expect(SUPPORTED_REGIONS).toEqual(['US', 'ES', 'GB', 'MX', 'CO', 'CN', 'JP'])
    })
  })

  describe('REGION_METADATA', () => {
    it('US metadata is correct', () => {
      expect(REGION_METADATA.US).toEqual({
        code: 'US',
        nativeName: 'United States',
        englishName: 'United States',
        dateLocale: 'en-US',
        numberLocale: 'en-US',
        currency: 'USD',
      })
    })

    it('ES metadata is correct', () => {
      expect(REGION_METADATA.ES).toEqual({
        code: 'ES',
        nativeName: 'Espana',
        englishName: 'Spain',
        dateLocale: 'es-ES',
        numberLocale: 'es-ES',
        currency: 'EUR',
      })
    })

    it('GB metadata is correct', () => {
      expect(REGION_METADATA.GB).toEqual({
        code: 'GB',
        nativeName: 'United Kingdom',
        englishName: 'United Kingdom',
        dateLocale: 'en-GB',
        numberLocale: 'en-GB',
        currency: 'GBP',
      })
    })

    it('MX metadata is correct', () => {
      expect(REGION_METADATA.MX).toEqual({
        code: 'MX',
        nativeName: 'Mexico',
        englishName: 'Mexico',
        dateLocale: 'es-MX',
        numberLocale: 'es-MX',
        currency: 'MXN',
      })
    })

    it('CO metadata is correct', () => {
      expect(REGION_METADATA.CO).toEqual({
        code: 'CO',
        nativeName: 'Colombia',
        englishName: 'Colombia',
        dateLocale: 'es-CO',
        numberLocale: 'es-CO',
        currency: 'COP',
      })
    })

    it('CN metadata is correct', () => {
      expect(REGION_METADATA.CN).toEqual({
        code: 'CN',
        nativeName: '中国',
        englishName: 'China',
        dateLocale: 'zh-CN',
        numberLocale: 'zh-CN',
        currency: 'CNY',
      })
    })

    it('JP metadata is correct', () => {
      expect(REGION_METADATA.JP).toEqual({
        code: 'JP',
        nativeName: '日本',
        englishName: 'Japan',
        dateLocale: 'ja-JP',
        numberLocale: 'ja-JP',
        currency: 'JPY',
      })
    })
  })

  describe('isValidRegion', () => {
    it('returns true for valid regions', () => {
      expect(isValidRegion('US')).toBe(true)
      expect(isValidRegion('ES')).toBe(true)
      expect(isValidRegion('GB')).toBe(true)
      expect(isValidRegion('MX')).toBe(true)
      expect(isValidRegion('CO')).toBe(true)
      expect(isValidRegion('CN')).toBe(true)
      expect(isValidRegion('JP')).toBe(true)
    })

    it('returns false for invalid regions', () => {
      expect(isValidRegion('FR')).toBe(false)
      expect(isValidRegion('us')).toBe(false)
      expect(isValidRegion('')).toBe(false)
      expect(isValidRegion('USA')).toBe(false)
    })
  })
})
