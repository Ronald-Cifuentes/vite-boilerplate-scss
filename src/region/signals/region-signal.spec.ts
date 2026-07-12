import {
  regionSignal,
  regionMetadataSignal,
  setRegion,
  cycleRegion,
  formatDate,
  formatNumber,
} from './region-signal'
import { DEFAULT_REGION, REGION_METADATA } from '../config/regions'

describe('Region Signal', () => {
  beforeEach(() => {
    regionSignal.value = DEFAULT_REGION
  })

  describe('regionSignal', () => {
    it('initializes with DEFAULT_REGION', () => {
      expect(regionSignal.value).toBe(DEFAULT_REGION)
    })
  })

  describe('regionMetadataSignal', () => {
    it('returns metadata for current region', () => {
      expect(regionMetadataSignal.value).toEqual(REGION_METADATA.US)
    })

    it('updates when region changes', () => {
      setRegion('ES')
      expect(regionMetadataSignal.value).toEqual(REGION_METADATA.ES)
    })
  })

  describe('setRegion', () => {
    it('sets region to specified value', () => {
      setRegion('GB')
      expect(regionSignal.value).toBe('GB')
    })
  })

  describe('cycleRegion', () => {
    it('cycles through all 7 regions in order (US, ES, GB, MX, CO, CN, JP)', () => {
      expect(regionSignal.value).toBe('US')

      cycleRegion()
      expect(regionSignal.value).toBe('ES')

      cycleRegion()
      expect(regionSignal.value).toBe('GB')

      cycleRegion()
      expect(regionSignal.value).toBe('MX')

      cycleRegion()
      expect(regionSignal.value).toBe('CO')

      cycleRegion()
      expect(regionSignal.value).toBe('CN')

      cycleRegion()
      expect(regionSignal.value).toBe('JP')

      cycleRegion()
      expect(regionSignal.value).toBe('US') // Wraps around
    })
  })

  describe('formatDate', () => {
    const testDate = new Date('2026-07-09T12:00:00Z')

    it('formats date with US locale', () => {
      setRegion('US')
      const formatted = formatDate(testDate)
      expect(formatted).toMatch(/7\/9\/2026|Jul(y)? 9, 2026/)
    })

    it('formats date with ES locale', () => {
      setRegion('ES')
      const formatted = formatDate(testDate)
      expect(formatted).toMatch(/9\/7\/2026|9 jul 2026/)
    })

    it('formats date with GB locale', () => {
      setRegion('GB')
      const formatted = formatDate(testDate)
      expect(formatted).toMatch(/09\/07\/2026|9 Jul(y)? 2026/)
    })

    it('accepts custom options', () => {
      setRegion('US')
      const formatted = formatDate(testDate, { year: 'numeric', month: 'long' })
      expect(formatted).toMatch(/July 2026/)
    })
  })

  describe('formatNumber', () => {
    it('formats number with US locale (comma separator)', () => {
      setRegion('US')
      const formatted = formatNumber(1234567.89)
      expect(formatted).toBe('1,234,567.89')
    })

    it('formats number with ES locale (period separator, comma decimal)', () => {
      setRegion('ES')
      const formatted = formatNumber(1234567.89)
      // Spanish uses period for thousands and comma for decimal
      expect(formatted).toMatch(/1\.234\.567,89|1 234 567,89/)
    })

    it('accepts custom options', () => {
      setRegion('US')
      const formatted = formatNumber(1234.5, { minimumFractionDigits: 2 })
      expect(formatted).toBe('1,234.50')
    })
  })
})
