import {
  themePreferenceSignal,
  osPrefersDarkSignal,
  effectiveThemeSignal,
  isLightMode,
  isDarkMode,
  setPreference,
  cyclePreference,
  setOsPrefersDark,
} from './theme-signal'
import { DEFAULT_PREFERENCE } from '../config/themes'

describe('Theme Signal', () => {
  beforeEach(() => {
    // Reset to default before each test
    themePreferenceSignal.value = DEFAULT_PREFERENCE
    osPrefersDarkSignal.value = false
  })

  describe('themePreferenceSignal', () => {
    it('initializes with DEFAULT_PREFERENCE (system)', () => {
      expect(themePreferenceSignal.value).toBe('system')
    })
  })

  describe('osPrefersDarkSignal', () => {
    it('can be set to true (OS prefers dark)', () => {
      setOsPrefersDark(true)
      expect(osPrefersDarkSignal.value).toBe(true)
    })

    it('can be set to false (OS prefers light)', () => {
      osPrefersDarkSignal.value = true
      setOsPrefersDark(false)
      expect(osPrefersDarkSignal.value).toBe(false)
    })
  })

  describe('effectiveThemeSignal (computed)', () => {
    it('returns light when preference is light', () => {
      themePreferenceSignal.value = 'light'
      expect(effectiveThemeSignal.value).toBe('light')
    })

    it('returns dark when preference is dark', () => {
      themePreferenceSignal.value = 'dark'
      expect(effectiveThemeSignal.value).toBe('dark')
    })

    it('returns light when preference is system and OS prefers light', () => {
      themePreferenceSignal.value = 'system'
      osPrefersDarkSignal.value = false
      expect(effectiveThemeSignal.value).toBe('light')
    })

    it('returns dark when preference is system and OS prefers dark', () => {
      themePreferenceSignal.value = 'system'
      osPrefersDarkSignal.value = true
      expect(effectiveThemeSignal.value).toBe('dark')
    })

    it('ignores OS preference when user has explicit light preference', () => {
      themePreferenceSignal.value = 'light'
      osPrefersDarkSignal.value = true // OS wants dark
      expect(effectiveThemeSignal.value).toBe('light')
    })

    it('ignores OS preference when user has explicit dark preference', () => {
      themePreferenceSignal.value = 'dark'
      osPrefersDarkSignal.value = false // OS wants light
      expect(effectiveThemeSignal.value).toBe('dark')
    })
  })

  describe('isLightMode computed', () => {
    it('returns true when effective theme is light', () => {
      themePreferenceSignal.value = 'light'
      expect(isLightMode.value).toBe(true)
    })

    it('returns false when effective theme is dark', () => {
      themePreferenceSignal.value = 'dark'
      expect(isLightMode.value).toBe(false)
    })

    it('follows system preference when preference is system', () => {
      themePreferenceSignal.value = 'system'
      osPrefersDarkSignal.value = false
      expect(isLightMode.value).toBe(true)

      osPrefersDarkSignal.value = true
      expect(isLightMode.value).toBe(false)
    })
  })

  describe('isDarkMode computed', () => {
    it('returns true when effective theme is dark', () => {
      themePreferenceSignal.value = 'dark'
      expect(isDarkMode.value).toBe(true)
    })

    it('returns false when effective theme is light', () => {
      themePreferenceSignal.value = 'light'
      expect(isDarkMode.value).toBe(false)
    })

    it('follows system preference when preference is system', () => {
      themePreferenceSignal.value = 'system'
      osPrefersDarkSignal.value = true
      expect(isDarkMode.value).toBe(true)

      osPrefersDarkSignal.value = false
      expect(isDarkMode.value).toBe(false)
    })
  })

  describe('setPreference', () => {
    it('sets preference to light', () => {
      setPreference('light')
      expect(themePreferenceSignal.value).toBe('light')
    })

    it('sets preference to dark', () => {
      setPreference('dark')
      expect(themePreferenceSignal.value).toBe('dark')
    })

    it('sets preference to system', () => {
      themePreferenceSignal.value = 'light'
      setPreference('system')
      expect(themePreferenceSignal.value).toBe('system')
    })
  })

  describe('cyclePreference', () => {
    it('cycles from light to dark', () => {
      themePreferenceSignal.value = 'light'
      cyclePreference()
      expect(themePreferenceSignal.value).toBe('dark')
    })

    it('cycles from dark to system', () => {
      themePreferenceSignal.value = 'dark'
      cyclePreference()
      expect(themePreferenceSignal.value).toBe('system')
    })

    it('cycles from system to light', () => {
      themePreferenceSignal.value = 'system'
      cyclePreference()
      expect(themePreferenceSignal.value).toBe('light')
    })

    it('completes full cycle: light -> dark -> system -> light', () => {
      themePreferenceSignal.value = 'light'

      cyclePreference()
      expect(themePreferenceSignal.value).toBe('dark')

      cyclePreference()
      expect(themePreferenceSignal.value).toBe('system')

      cyclePreference()
      expect(themePreferenceSignal.value).toBe('light')
    })
  })
})
