import {
  isLocaleLoaded,
  loadTranslations,
  resetLoadedLocales,
  markLocaleLoaded,
} from './locale-loader'

describe('locale-loader', () => {
  beforeEach(() => {
    resetLoadedLocales()
  })

  describe('isLocaleLoaded', () => {
    it('returns true for en (always loaded)', () => {
      expect(isLocaleLoaded('en')).toBe(true)
    })

    it('returns true for es (always loaded)', () => {
      expect(isLocaleLoaded('es')).toBe(true)
    })

    it('returns false for zh initially', () => {
      expect(isLocaleLoaded('zh')).toBe(false)
    })

    it('returns false for ja initially', () => {
      expect(isLocaleLoaded('ja')).toBe(false)
    })
  })

  describe('markLocaleLoaded', () => {
    it('marks a locale as loaded', () => {
      expect(isLocaleLoaded('zh')).toBe(false)
      markLocaleLoaded('zh')
      expect(isLocaleLoaded('zh')).toBe(true)
    })
  })

  describe('resetLoadedLocales', () => {
    it('resets to only en and es', () => {
      markLocaleLoaded('zh')
      markLocaleLoaded('ja')
      expect(isLocaleLoaded('zh')).toBe(true)
      expect(isLocaleLoaded('ja')).toBe(true)

      resetLoadedLocales()

      expect(isLocaleLoaded('en')).toBe(true)
      expect(isLocaleLoaded('es')).toBe(true)
      expect(isLocaleLoaded('zh')).toBe(false)
      expect(isLocaleLoaded('ja')).toBe(false)
    })
  })

  describe('loadTranslations', () => {
    it('returns null for already loaded locale (en)', async () => {
      const result = await loadTranslations('en')
      expect(result).toBeNull()
    })

    it('returns null for already loaded locale (es)', async () => {
      const result = await loadTranslations('es')
      expect(result).toBeNull()
    })

    it('loads zh dynamically and returns dictionary', async () => {
      const result = await loadTranslations('zh')
      expect(result).toBeDefined()
      expect(result?.greeting?.hello).toBe('你好')
      expect(isLocaleLoaded('zh')).toBe(true)
    })

    it('loads ja dynamically and returns dictionary', async () => {
      const result = await loadTranslations('ja')
      expect(result).toBeDefined()
      expect(result?.greeting?.hello).toBe('こんにちは')
      expect(isLocaleLoaded('ja')).toBe(true)
    })

    it('returns null for unsupported locale', async () => {
      const result = await loadTranslations('fr' as 'en')
      expect(result).toBeNull()
    })

    it('short-circuits if locale becomes loaded between calls', async () => {
      await loadTranslations('zh')
      expect(isLocaleLoaded('zh')).toBe(true)

      const result = await loadTranslations('zh')
      expect(result).toBeNull()
    })
  })
})
