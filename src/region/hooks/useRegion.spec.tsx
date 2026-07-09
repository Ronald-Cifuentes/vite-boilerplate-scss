import { renderHook, act } from '@testing-library/react'
import { useRegion } from './useRegion'
import { regionSignal } from '../signals/region-signal'
import { DEFAULT_REGION, SUPPORTED_REGIONS } from '../config/regions'

describe('useRegion', () => {
  beforeEach(() => {
    regionSignal.value = DEFAULT_REGION
  })

  describe('region', () => {
    it('returns current region', () => {
      const { result } = renderHook(() => useRegion())
      expect(result.current.region).toBe('US')
    })

    it('updates when region changes', () => {
      const { result } = renderHook(() => useRegion())

      act(() => {
        regionSignal.value = 'ES'
      })

      expect(result.current.region).toBe('ES')
    })
  })

  describe('setRegion', () => {
    it('sets region to specified value', () => {
      const { result } = renderHook(() => useRegion())

      act(() => {
        result.current.setRegion('GB')
      })

      expect(result.current.region).toBe('GB')
    })
  })

  describe('cycleRegion', () => {
    it('cycles to next region', () => {
      const { result } = renderHook(() => useRegion())

      act(() => {
        result.current.cycleRegion()
      })

      expect(result.current.region).toBe('ES')
    })
  })

  describe('supportedRegions', () => {
    it('returns all supported regions', () => {
      const { result } = renderHook(() => useRegion())
      expect(result.current.supportedRegions).toEqual(SUPPORTED_REGIONS)
    })
  })

  describe('formatDate', () => {
    it('formats date according to current region', () => {
      const { result } = renderHook(() => useRegion())
      const testDate = new Date('2026-07-09T12:00:00Z')

      const formatted = result.current.formatDate(testDate)
      expect(formatted).toBeTruthy()
    })
  })

  describe('formatNumber', () => {
    it('formats number according to current region', () => {
      const { result } = renderHook(() => useRegion())

      const formatted = result.current.formatNumber(1234567.89)
      expect(formatted).toBe('1,234,567.89')
    })
  })
})
