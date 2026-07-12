import {
  isSupportedLocale,
  DEFAULT_LOCALE,
  SUPPORTED_LOCALES,
  LOCALE_STORAGE_KEY,
  LOCALE_METADATA,
} from './locales'

describe('locales config', () => {
  describe('isSupportedLocale', () => {
    describe('Given a valid locale code', () => {
      it('When "en" is passed, Then it returns true', () => {
        expect(isSupportedLocale('en')).toBe(true)
      })

      it('When "es" is passed, Then it returns true', () => {
        expect(isSupportedLocale('es')).toBe(true)
      })

      it('When "zh" is passed, Then it returns true', () => {
        expect(isSupportedLocale('zh')).toBe(true)
      })

      it('When "ja" is passed, Then it returns true', () => {
        expect(isSupportedLocale('ja')).toBe(true)
      })
    })

    describe('Given an invalid locale code', () => {
      it('When "fr" is passed, Then it returns false', () => {
        expect(isSupportedLocale('fr')).toBe(false)
      })

      it('When an empty string is passed, Then it returns false', () => {
        expect(isSupportedLocale('')).toBe(false)
      })

      it('When "EN" (uppercase) is passed, Then it returns false', () => {
        expect(isSupportedLocale('EN')).toBe(false)
      })
    })
  })

  describe('constants', () => {
    it('DEFAULT_LOCALE should be "en"', () => {
      expect(DEFAULT_LOCALE).toBe('en')
    })

    it('SUPPORTED_LOCALES should contain en, es, zh, ja in order', () => {
      expect(SUPPORTED_LOCALES).toContain('en')
      expect(SUPPORTED_LOCALES).toContain('es')
      expect(SUPPORTED_LOCALES).toContain('zh')
      expect(SUPPORTED_LOCALES).toContain('ja')
      expect(SUPPORTED_LOCALES).toHaveLength(4)
      expect(SUPPORTED_LOCALES).toEqual(['en', 'es', 'zh', 'ja'])
    })

    it('LOCALE_STORAGE_KEY should be "app-locale"', () => {
      expect(LOCALE_STORAGE_KEY).toBe('app-locale')
    })

    it('LOCALE_METADATA should have correct structure for each locale', () => {
      expect(LOCALE_METADATA.en).toEqual({
        code: 'en',
        nativeName: 'English',
        englishName: 'English',
        direction: 'ltr',
      })

      expect(LOCALE_METADATA.es).toEqual({
        code: 'es',
        nativeName: 'Español',
        englishName: 'Spanish',
        direction: 'ltr',
      })

      expect(LOCALE_METADATA.zh).toEqual({
        code: 'zh',
        nativeName: '中文',
        englishName: 'Chinese',
        direction: 'ltr',
      })

      expect(LOCALE_METADATA.ja).toEqual({
        code: 'ja',
        nativeName: '日本語',
        englishName: 'Japanese',
        direction: 'ltr',
      })
    })
  })
})
