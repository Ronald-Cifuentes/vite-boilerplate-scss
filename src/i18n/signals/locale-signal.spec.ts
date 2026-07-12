import {
  localeSignal,
  localeLoadingSignal,
  dictionarySignal,
  supportedLocales,
  setLocale,
  translate,
} from './locale-signal'
import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from '../config/locales'
import * as translations from '../translations'

// Mock translations module
jest.mock('../translations', () => {
  const mockLoadLocale = jest.fn()
  return {
    translations: {
      en: { greeting: { hello: 'Hello' } },
      es: { greeting: { hello: 'Hola' } },
      zh: { greeting: { hello: 'Hello' } }, // Fallback
      ja: { greeting: { hello: 'Hello' } }, // Fallback
    },
    isLocaleLoaded: jest.fn((locale: string) => locale === 'en' || locale === 'es'),
    loadLocale: mockLoadLocale,
  }
})

const mockLoadLocale = translations.loadLocale as jest.Mock

describe('locale-signal', () => {
  beforeEach(() => {
    localeSignal.value = DEFAULT_LOCALE
    localeLoadingSignal.value = false
    jest.clearAllMocks()
  })

  describe('localeSignal', () => {
    it('defaults to en', () => {
      expect(localeSignal.value).toBe('en')
    })

    it('can be updated directly', () => {
      localeSignal.value = 'es'
      expect(localeSignal.value).toBe('es')
    })
  })

  describe('localeLoadingSignal', () => {
    it('defaults to false', () => {
      expect(localeLoadingSignal.value).toBe(false)
    })
  })

  describe('dictionarySignal', () => {
    it('returns dictionary for current locale', () => {
      localeSignal.value = 'en'
      expect(dictionarySignal.value).toEqual({ greeting: { hello: 'Hello' } })
    })

    it('updates when locale changes', () => {
      localeSignal.value = 'es'
      expect(dictionarySignal.value).toEqual({ greeting: { hello: 'Hola' } })
    })
  })

  describe('supportedLocales', () => {
    it('returns all supported locales', () => {
      expect(supportedLocales).toEqual(SUPPORTED_LOCALES)
    })
  })

  describe('setLocale', () => {
    it('sets locale for inline locales (en/es)', () => {
      setLocale('es')
      expect(localeSignal.value).toBe('es')
    })

    it('triggers lazy loading for zh', async () => {
      mockLoadLocale.mockResolvedValue({ greeting: { hello: '你好' } })

      setLocale('zh')

      expect(localeSignal.value).toBe('zh')
      expect(localeLoadingSignal.value).toBe(true)
      expect(mockLoadLocale).toHaveBeenCalledWith('zh')
    })

    it('triggers lazy loading for ja', async () => {
      mockLoadLocale.mockResolvedValue({ greeting: { hello: 'こんにちは' } })

      setLocale('ja')

      expect(localeSignal.value).toBe('ja')
      expect(localeLoadingSignal.value).toBe(true)
      expect(mockLoadLocale).toHaveBeenCalledWith('ja')
    })
  })

  describe('translate', () => {
    it('returns translation for valid key', () => {
      localeSignal.value = 'en'
      expect(translate('greeting.hello')).toBe('Hello')
    })

    it('returns key for invalid path', () => {
      localeSignal.value = 'en'
      expect(translate('invalid.path')).toBe('invalid.path')
    })

    it('returns key when value is not a string', () => {
      localeSignal.value = 'en'
      expect(translate('greeting')).toBe('greeting')
    })
  })
})
