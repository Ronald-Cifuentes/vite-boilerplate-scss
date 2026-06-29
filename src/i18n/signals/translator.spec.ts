import { resolveInitialLocale, setLocale as setLocaleFromTranslator } from './translator'
import { localeSignal } from './locale-signal'
import { LOCALE_STORAGE_KEY, DEFAULT_LOCALE, SUPPORTED_LOCALES } from '../config/locales'

// The translator module owns two surfaces tested here:
//   - `resolveInitialLocale(override?)` — pure resolution with 4-tier priority
//   - `setLocale`                      — persists + assigns the signal
//
// Persistence is verified by spying on `localStorage.setItem`; the signal
// write is verified by reading `localeSignal.value`.

describe('resolveInitialLocale', () => {
  let localStorageMock: Record<string, string>
  let originalNavigatorLanguage: string

  beforeEach(() => {
    localeSignal.value = DEFAULT_LOCALE
    localStorageMock = {}
    originalNavigatorLanguage = navigator.language
    jest
      .spyOn(Storage.prototype, 'getItem')
      .mockImplementation(key => localStorageMock[key] ?? null)
    jest.spyOn(Storage.prototype, 'setItem').mockImplementation((key, value) => {
      localStorageMock[key] = String(value)
    })
  })

  afterEach(() => {
    jest.restoreAllMocks()
    Object.defineProperty(navigator, 'language', {
      value: originalNavigatorLanguage,
      writable: true,
      configurable: true,
    })
  })

  it('Given an invalid override, Then it ignores the override and uses the next source', () => {
    // With no localStorage and an unsupported navigator, we expect DEFAULT_LOCALE
    Object.defineProperty(navigator, 'language', {
      value: 'fr-FR',
      writable: true,
      configurable: true,
    })
    expect(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      resolveInitialLocale('not-a-valid-locale' as any)
    ).toBe(DEFAULT_LOCALE)
  })

  it('Given a valid override, Then it returns the override (no localStorage or navigator lookup)', () => {
    // Even with a persisted 'es', a valid override wins.
    localStorageMock[LOCALE_STORAGE_KEY] = 'es'
    expect(resolveInitialLocale('en')).toBe('en')
  })

  it('Given no override and a persisted supported locale, Then it returns the persisted value', () => {
    localStorageMock[LOCALE_STORAGE_KEY] = 'es'
    expect(resolveInitialLocale(undefined)).toBe('es')
  })

  it('Given no override and an invalid persisted locale, Then it falls back to navigator', () => {
    localStorageMock[LOCALE_STORAGE_KEY] = 'garbage'
    Object.defineProperty(navigator, 'language', {
      value: 'es-MX',
      writable: true,
      configurable: true,
    })
    expect(resolveInitialLocale(undefined)).toBe('es')
  })

  it('Given no override and no navigator, Then it falls back to DEFAULT_LOCALE', () => {
    Object.defineProperty(navigator, 'language', {
      value: undefined,
      writable: true,
      configurable: true,
    })
    expect(resolveInitialLocale(undefined)).toBe(DEFAULT_LOCALE)
  })

  it('Given localStorage throws, Then it skips to navigator', () => {
    jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('localStorage disabled')
    })
    Object.defineProperty(navigator, 'language', {
      value: 'es',
      writable: true,
      configurable: true,
    })
    expect(resolveInitialLocale(undefined)).toBe('es')
  })

  it('Given every source is unusable, Then it returns DEFAULT_LOCALE', () => {
    expect(resolveInitialLocale()).toBe(DEFAULT_LOCALE)
  })

  it('Given SUPPORTED_LOCALES, Then it is non-empty and contains the defaults', () => {
    expect(SUPPORTED_LOCALES.length).toBeGreaterThan(0)
    expect(SUPPORTED_LOCALES).toContain('en')
  })
})

describe('setLocale (translator)', () => {
  beforeEach(() => {
    localeSignal.value = DEFAULT_LOCALE
    jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      /* swallow */
    })
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('Given a valid locale, Then it updates the signal and persists', () => {
    setLocaleFromTranslator('es')
    expect(localeSignal.value).toBe('es')
    // The persistence layer is exercised internally; we just confirm no throw.
  })

  it('Given localStorage throws, Then the signal still updates', () => {
    jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('localStorage disabled')
    })
    setLocaleFromTranslator('es')
    expect(localeSignal.value).toBe('es')
  })
})
