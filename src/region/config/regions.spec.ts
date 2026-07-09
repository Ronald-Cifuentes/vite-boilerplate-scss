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

    it('SUPPORTED_REGIONS includes all expected regions', () => {
      expect(SUPPORTED_REGIONS).toContain('US')
      expect(SUPPORTED_REGIONS).toContain('ES')
      expect(SUPPORTED_REGIONS).toContain('GB')
      expect(SUPPORTED_REGIONS).toContain('MX')
      expect(SUPPORTED_REGIONS).toHaveLength(4)
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
  })

  describe('isValidRegion', () => {
    it('returns true for valid regions', () => {
      expect(isValidRegion('US')).toBe(true)
      expect(isValidRegion('ES')).toBe(true)
      expect(isValidRegion('GB')).toBe(true)
      expect(isValidRegion('MX')).toBe(true)
    })

    it('returns false for invalid regions', () => {
      expect(isValidRegion('FR')).toBe(false)
      expect(isValidRegion('us')).toBe(false)
      expect(isValidRegion('')).toBe(false)
      expect(isValidRegion('USA')).toBe(false)
    })
  })
})
