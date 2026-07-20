import { translations, isLocaleLoaded, loadLocale, inlineTranslations } from './index'
import { resetLoadedLocales } from '../loader'
import { validateLocale, getPlaceholderInventory } from '../validation'
import en from '../data/en.json'
import es from '../data/es.json'
import ja from '../data/ja.json'
import zh from '../data/zh.json'

describe('translations', () => {
  beforeEach(() => {
    resetLoadedLocales()
    // Reset translations record to initial state
    translations.zh = en
    translations.ja = en
  })

  describe('inlineTranslations', () => {
    it('includes en and es', () => {
      expect(inlineTranslations.en).toBeDefined()
      expect(inlineTranslations.es).toBeDefined()
    })

    it('en has all required keys', () => {
      expect(inlineTranslations.en.common.appName).toBeDefined()
      expect(inlineTranslations.en.greeting.hello).toBeDefined()
      expect(inlineTranslations.en.a11y.locationDetected).toBeDefined()
    })

    it('es has all required keys', () => {
      expect(inlineTranslations.es.common.appName).toBeDefined()
      expect(inlineTranslations.es.greeting.hello).toBeDefined()
      expect(inlineTranslations.es.a11y.locationDetected).toBeDefined()
    })
  })

  describe('translations', () => {
    it('includes all 4 locales', () => {
      expect(translations.en).toBeDefined()
      expect(translations.es).toBeDefined()
      expect(translations.zh).toBeDefined()
      expect(translations.ja).toBeDefined()
    })

    it('ja/zh start with en fallback', () => {
      // Before loading, ja/zh point to en
      expect(translations.zh).toBe(en)
      expect(translations.ja).toBe(en)
    })
  })

  describe('isLocaleLoaded', () => {
    it('returns true for en', () => {
      expect(isLocaleLoaded('en')).toBe(true)
    })

    it('returns true for es', () => {
      expect(isLocaleLoaded('es')).toBe(true)
    })

    it('returns false for zh initially', () => {
      expect(isLocaleLoaded('zh')).toBe(false)
    })

    it('returns false for ja initially', () => {
      expect(isLocaleLoaded('ja')).toBe(false)
    })
  })

  describe('loadLocale', () => {
    it('returns dictionary for already loaded locales', async () => {
      const result = await loadLocale('en')
      expect(result).toBe(translations.en)
    })

    it('loads zh dynamically', async () => {
      const result = await loadLocale('zh')
      expect(result).toBeDefined()
      expect(result?.greeting?.hello).toBe('你好')
    })

    it('loads ja dynamically', async () => {
      const result = await loadLocale('ja')
      expect(result).toBeDefined()
      expect(result?.greeting?.hello).toBe('こんにちは')
    })

    it('returns null for unsupported locale', async () => {
      const result = await loadLocale('fr' as 'en')
      expect(result).toBeNull()
    })

    it('marks locale as loaded after loading', async () => {
      await loadLocale('zh')
      expect(isLocaleLoaded('zh')).toBe(true)

      await loadLocale('ja')
      expect(isLocaleLoaded('ja')).toBe(true)
    })

    it('updates translations record after loading', async () => {
      // Before loading, zh points to en fallback
      expect(translations.zh.greeting.hello).toBe('Hello')

      await loadLocale('zh')

      // After loading, zh has actual Chinese content
      expect(translations.zh.greeting.hello).toBe('你好')
    })
  })

  describe('structure validation (ADR-0015)', () => {
    it('all locales have matching structure against canonical (en)', () => {
      const locales = [
        { data: es, name: 'es' },
        { data: ja, name: 'ja' },
        { data: zh, name: 'zh' },
      ]

      for (const { data, name } of locales) {
        const result = validateLocale(en, data, name)
        expect(result.valid).toBe(true)
        expect(result.errors).toHaveLength(0)
      }
    })

    it('all locales have the same namespaces as en', () => {
      const enNamespaces = Object.keys(en).sort()
      const esNamespaces = Object.keys(es).sort()
      const jaNamespaces = Object.keys(ja)
        .filter(k => k !== '_provenance')
        .sort()
      const zhNamespaces = Object.keys(zh)
        .filter(k => k !== '_provenance')
        .sort()

      expect(esNamespaces).toEqual(enNamespaces)
      expect(jaNamespaces).toEqual(enNamespaces)
      expect(zhNamespaces).toEqual(enNamespaces)
    })

    it('placeholder {age} exists in rates.stale for all locales', () => {
      for (const data of [en, es, ja, zh]) {
        const inventory = getPlaceholderInventory(data)
        const staleEntry = inventory.find(i => i.path === 'rates.stale')
        expect(staleEntry).toBeDefined()
        expect(staleEntry?.placeholders).toContain('{age}')
      }
    })

    it('no locale has empty translation values', () => {
      const locales = [
        { data: en, name: 'en' },
        { data: es, name: 'es' },
        { data: ja, name: 'ja' },
        { data: zh, name: 'zh' },
      ]

      for (const { data, name } of locales) {
        const result = validateLocale(en, data, name)
        const emptyErrors = result.errors.filter(e => e.type === 'empty_value')
        expect(emptyErrors).toHaveLength(0)
      }
    })
  })

  describe('fallback behavior', () => {
    it('zh/ja use en content before loading', () => {
      // Verify fallback content is English
      expect(translations.zh.greeting.hello).toBe('Hello')
      expect(translations.ja.greeting.hello).toBe('Hello')
    })

    it('zh/ja have actual content after loading', async () => {
      await loadLocale('zh')
      await loadLocale('ja')

      expect(translations.zh.greeting.hello).toBe('你好')
      expect(translations.ja.greeting.hello).toBe('こんにちは')
    })
  })
})
