import { renderHook, act } from '@testing-library/react'
import { useTheme } from './useTheme'
import { themePreferenceSignal, osPrefersDarkSignal } from '../signals/theme-signal'
import { DEFAULT_PREFERENCE } from '../config/themes'

describe('useTheme', () => {
  beforeEach(() => {
    themePreferenceSignal.value = DEFAULT_PREFERENCE
    osPrefersDarkSignal.value = false
  })

  describe('preference', () => {
    it('returns current preference', () => {
      const { result } = renderHook(() => useTheme())
      expect(result.current.preference).toBe('system')
    })

    it('updates when preference changes', () => {
      const { result } = renderHook(() => useTheme())

      act(() => {
        themePreferenceSignal.value = 'dark'
      })

      expect(result.current.preference).toBe('dark')
    })
  })

  describe('effectiveMode', () => {
    it('returns light when preference is light', () => {
      themePreferenceSignal.value = 'light'
      const { result } = renderHook(() => useTheme())
      expect(result.current.effectiveMode).toBe('light')
    })

    it('returns dark when preference is dark', () => {
      themePreferenceSignal.value = 'dark'
      const { result } = renderHook(() => useTheme())
      expect(result.current.effectiveMode).toBe('dark')
    })

    it('follows OS when preference is system (light)', () => {
      themePreferenceSignal.value = 'system'
      osPrefersDarkSignal.value = false
      const { result } = renderHook(() => useTheme())
      expect(result.current.effectiveMode).toBe('light')
    })

    it('follows OS when preference is system (dark)', () => {
      themePreferenceSignal.value = 'system'
      osPrefersDarkSignal.value = true
      const { result } = renderHook(() => useTheme())
      expect(result.current.effectiveMode).toBe('dark')
    })
  })

  describe('cyclePreference', () => {
    it('cycles from light to dark', () => {
      themePreferenceSignal.value = 'light'
      const { result } = renderHook(() => useTheme())

      act(() => {
        result.current.cyclePreference()
      })

      expect(result.current.preference).toBe('dark')
    })

    it('cycles from dark to system', () => {
      themePreferenceSignal.value = 'dark'
      const { result } = renderHook(() => useTheme())

      act(() => {
        result.current.cyclePreference()
      })

      expect(result.current.preference).toBe('system')
    })

    it('cycles from system to light', () => {
      themePreferenceSignal.value = 'system'
      const { result } = renderHook(() => useTheme())

      act(() => {
        result.current.cyclePreference()
      })

      expect(result.current.preference).toBe('light')
    })
  })

  describe('setPreference', () => {
    it('sets preference to light', () => {
      const { result } = renderHook(() => useTheme())

      act(() => {
        result.current.setPreference('light')
      })

      expect(result.current.preference).toBe('light')
    })

    it('sets preference to dark', () => {
      const { result } = renderHook(() => useTheme())

      act(() => {
        result.current.setPreference('dark')
      })

      expect(result.current.preference).toBe('dark')
    })

    it('sets preference to system', () => {
      themePreferenceSignal.value = 'light'
      const { result } = renderHook(() => useTheme())

      act(() => {
        result.current.setPreference('system')
      })

      expect(result.current.preference).toBe('system')
    })
  })

  describe('osPrefersDark', () => {
    it('returns false when OS prefers light', () => {
      osPrefersDarkSignal.value = false
      const { result } = renderHook(() => useTheme())
      expect(result.current.osPrefersDark).toBe(false)
    })

    it('returns true when OS prefers dark', () => {
      osPrefersDarkSignal.value = true
      const { result } = renderHook(() => useTheme())
      expect(result.current.osPrefersDark).toBe(true)
    })

    it('updates when OS preference changes', () => {
      const { result } = renderHook(() => useTheme())

      act(() => {
        osPrefersDarkSignal.value = true
      })

      expect(result.current.osPrefersDark).toBe(true)
    })
  })
})
