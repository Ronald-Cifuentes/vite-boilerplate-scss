import {
  persistPreference,
  loadPersistedPreference,
  clearPersistedPreference,
} from './localStorage'
import { THEME_STORAGE_KEY } from '../config/themes'

describe('Theme localStorage Adapter', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe('persistPreference', () => {
    it('stores preference in localStorage', () => {
      persistPreference('dark')
      expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark')
    })

    it('stores system preference in localStorage', () => {
      persistPreference('system')
      expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('system')
    })

    it('overwrites previous value', () => {
      persistPreference('dark')
      persistPreference('light')
      expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('light')
    })

    it('handles localStorage error gracefully', () => {
      const mockSetItem = jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('Storage full')
      })

      expect(() => persistPreference('dark')).not.toThrow()
      mockSetItem.mockRestore()
    })
  })

  describe('loadPersistedPreference', () => {
    it('returns null when no preference stored', () => {
      expect(loadPersistedPreference()).toBeNull()
    })

    it('returns stored preference when valid (light)', () => {
      localStorage.setItem(THEME_STORAGE_KEY, 'light')
      expect(loadPersistedPreference()).toBe('light')
    })

    it('returns stored preference when valid (dark)', () => {
      localStorage.setItem(THEME_STORAGE_KEY, 'dark')
      expect(loadPersistedPreference()).toBe('dark')
    })

    it('returns stored preference when valid (system)', () => {
      localStorage.setItem(THEME_STORAGE_KEY, 'system')
      expect(loadPersistedPreference()).toBe('system')
    })

    it('returns null for invalid stored preference', () => {
      localStorage.setItem(THEME_STORAGE_KEY, 'invalid')
      expect(loadPersistedPreference()).toBeNull()
    })

    it('handles localStorage error gracefully', () => {
      const mockGetItem = jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new Error('Storage error')
      })

      expect(loadPersistedPreference()).toBeNull()
      mockGetItem.mockRestore()
    })
  })

  describe('clearPersistedPreference', () => {
    it('removes preference from localStorage', () => {
      localStorage.setItem(THEME_STORAGE_KEY, 'dark')
      clearPersistedPreference()
      expect(localStorage.getItem(THEME_STORAGE_KEY)).toBeNull()
    })

    it('handles localStorage error gracefully', () => {
      const mockRemoveItem = jest.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
        throw new Error('Storage error')
      })

      expect(() => clearPersistedPreference()).not.toThrow()
      mockRemoveItem.mockRestore()
    })
  })
})
