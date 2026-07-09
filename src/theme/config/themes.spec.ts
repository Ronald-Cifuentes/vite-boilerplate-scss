import {
  THEME_STORAGE_KEY,
  DEFAULT_PREFERENCE,
  SUPPORTED_PREFERENCES,
  THEME_CONFIG,
  isValidPreference,
  isValidTheme,
  getNextPreference,
} from './themes'

describe('Theme Configuration', () => {
  describe('Constants', () => {
    it('THEME_STORAGE_KEY is defined as app-theme', () => {
      expect(THEME_STORAGE_KEY).toBe('app-theme')
    })

    it('DEFAULT_PREFERENCE is system', () => {
      expect(DEFAULT_PREFERENCE).toBe('system')
    })

    it('SUPPORTED_PREFERENCES includes light, dark, and system', () => {
      expect(SUPPORTED_PREFERENCES).toContain('light')
      expect(SUPPORTED_PREFERENCES).toContain('dark')
      expect(SUPPORTED_PREFERENCES).toContain('system')
      expect(SUPPORTED_PREFERENCES).toHaveLength(3)
    })

    it('THEME_CONFIG has correct structure', () => {
      expect(THEME_CONFIG).toEqual({
        defaultPreference: 'system',
        storageKey: 'app-theme',
        supportedPreferences: ['light', 'dark', 'system'],
      })
    })
  })

  describe('isValidPreference', () => {
    it('returns true for valid preferences', () => {
      expect(isValidPreference('light')).toBe(true)
      expect(isValidPreference('dark')).toBe(true)
      expect(isValidPreference('system')).toBe(true)
    })

    it('returns false for invalid preferences', () => {
      expect(isValidPreference('auto')).toBe(false)
      expect(isValidPreference('')).toBe(false)
      expect(isValidPreference('Light')).toBe(false)
    })
  })

  describe('isValidTheme', () => {
    it('returns true for valid effective themes', () => {
      expect(isValidTheme('light')).toBe(true)
      expect(isValidTheme('dark')).toBe(true)
    })

    it('returns false for system (not a valid effective theme)', () => {
      expect(isValidTheme('system')).toBe(false)
    })

    it('returns false for invalid themes', () => {
      expect(isValidTheme('auto')).toBe(false)
      expect(isValidTheme('')).toBe(false)
      expect(isValidTheme('Light')).toBe(false)
    })
  })

  describe('getNextPreference', () => {
    it('cycles light -> dark', () => {
      expect(getNextPreference('light')).toBe('dark')
    })

    it('cycles dark -> system', () => {
      expect(getNextPreference('dark')).toBe('system')
    })

    it('cycles system -> light', () => {
      expect(getNextPreference('system')).toBe('light')
    })

    it('completes full cycle', () => {
      let pref = getNextPreference('light')
      expect(pref).toBe('dark')

      pref = getNextPreference(pref)
      expect(pref).toBe('system')

      pref = getNextPreference(pref)
      expect(pref).toBe('light')
    })
  })
})
