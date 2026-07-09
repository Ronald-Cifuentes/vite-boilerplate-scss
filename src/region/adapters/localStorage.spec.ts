import { persistRegion, loadPersistedRegion, clearPersistedRegion } from './localStorage'
import { REGION_STORAGE_KEY } from '../config/regions'

describe('Region localStorage Adapter', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe('persistRegion', () => {
    it('stores region in localStorage', () => {
      persistRegion('ES')
      expect(localStorage.getItem(REGION_STORAGE_KEY)).toBe('ES')
    })

    it('overwrites previous value', () => {
      persistRegion('ES')
      persistRegion('GB')
      expect(localStorage.getItem(REGION_STORAGE_KEY)).toBe('GB')
    })

    it('handles localStorage error gracefully', () => {
      const mockSetItem = jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('Storage full')
      })

      expect(() => persistRegion('ES')).not.toThrow()
      mockSetItem.mockRestore()
    })
  })

  describe('loadPersistedRegion', () => {
    it('returns null when no region stored', () => {
      expect(loadPersistedRegion()).toBeNull()
    })

    it('returns stored region when valid', () => {
      localStorage.setItem(REGION_STORAGE_KEY, 'GB')
      expect(loadPersistedRegion()).toBe('GB')
    })

    it('returns null for invalid stored region', () => {
      localStorage.setItem(REGION_STORAGE_KEY, 'FR')
      expect(loadPersistedRegion()).toBeNull()
    })

    it('handles localStorage error gracefully', () => {
      const mockGetItem = jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new Error('Storage error')
      })

      expect(loadPersistedRegion()).toBeNull()
      mockGetItem.mockRestore()
    })
  })

  describe('clearPersistedRegion', () => {
    it('removes region from localStorage', () => {
      localStorage.setItem(REGION_STORAGE_KEY, 'ES')
      clearPersistedRegion()
      expect(localStorage.getItem(REGION_STORAGE_KEY)).toBeNull()
    })

    it('handles localStorage error gracefully', () => {
      const mockRemoveItem = jest.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
        throw new Error('Storage error')
      })

      expect(() => clearPersistedRegion()).not.toThrow()
      mockRemoveItem.mockRestore()
    })
  })
})
