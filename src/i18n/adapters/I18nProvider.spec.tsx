import { render, screen, act, renderHook } from '@testing-library/react'
import { ReactNode, JSX } from 'react'
import { I18nProvider } from './I18nProvider'
import { useTranslation } from '../hooks/useTranslation'
import { LOCALE_STORAGE_KEY } from '../config/locales'
import { localeSignal } from '../signals/locale-signal'

// Test consumer component
const TestConsumer = (): JSX.Element => {
  const { t, locale } = useTranslation()
  return (
    <div>
      <span data-testid='greeting'>{t('greeting.hello')}</span>
      <span data-testid='locale'>{locale}</span>
    </div>
  )
}

// Shared test setup
let localStorageMock: Record<string, string>
let originalNavigatorLanguage: string

const setupMocks = (): void => {
  // Reset the singleton signal at the start of each test so prior tests
  // don't leak their final locale into the next one. The provider also
  // resets on mount, but this guards the cases where no provider is mounted.
  localeSignal.value = 'en'

  localStorageMock = {}
  originalNavigatorLanguage = navigator.language

  jest.spyOn(Storage.prototype, 'getItem').mockImplementation(key => localStorageMock[key] || null)
  jest.spyOn(Storage.prototype, 'setItem').mockImplementation((key, value) => {
    localStorageMock[key] = value
  })
  jest.spyOn(Storage.prototype, 'clear').mockImplementation(() => {
    localStorageMock = {}
  })
  document.documentElement.lang = ''
}

const teardownMocks = (): void => {
  jest.restoreAllMocks()
  Object.defineProperty(navigator, 'language', {
    value: originalNavigatorLanguage,
    writable: true,
    configurable: true,
  })
}

describe('I18nProvider - Locale Resolution', () => {
  beforeEach(setupMocks)
  afterEach(teardownMocks)

  it('Given initialLocale prop is provided, Then it uses the initialLocale', () => {
    render(
      <I18nProvider initialLocale='es'>
        <TestConsumer />
      </I18nProvider>
    )
    expect(screen.getByTestId('locale')).toHaveTextContent('es')
    expect(screen.getByTestId('greeting')).toHaveTextContent('Hola')
  })

  it('Given a valid persisted locale exists, Then it uses the persisted locale', () => {
    localStorageMock[LOCALE_STORAGE_KEY] = 'es'
    render(
      <I18nProvider>
        <TestConsumer />
      </I18nProvider>
    )
    expect(screen.getByTestId('locale')).toHaveTextContent('es')
  })

  it('Given an invalid persisted locale, Then it falls back to navigator language', () => {
    localStorageMock[LOCALE_STORAGE_KEY] = 'invalid'
    Object.defineProperty(navigator, 'language', {
      value: 'es-MX',
      writable: true,
      configurable: true,
    })
    render(
      <I18nProvider>
        <TestConsumer />
      </I18nProvider>
    )
    expect(screen.getByTestId('locale')).toHaveTextContent('es')
  })

  it('Given navigator language is unsupported, Then it falls back to default locale', () => {
    localStorageMock = {}
    Object.defineProperty(navigator, 'language', {
      value: 'fr-FR',
      writable: true,
      configurable: true,
    })
    render(
      <I18nProvider>
        <TestConsumer />
      </I18nProvider>
    )
    expect(screen.getByTestId('locale')).toHaveTextContent('en')
  })

  it('Given navigator language is undefined, Then it falls back to default locale', () => {
    localStorageMock = {}
    Object.defineProperty(navigator, 'language', {
      value: undefined,
      writable: true,
      configurable: true,
    })
    render(
      <I18nProvider>
        <TestConsumer />
      </I18nProvider>
    )
    expect(screen.getByTestId('locale')).toHaveTextContent('en')
  })

  it('Given localStorage throws, Then it falls back to navigator language', () => {
    jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('localStorage disabled')
    })
    Object.defineProperty(navigator, 'language', {
      value: 'es',
      writable: true,
      configurable: true,
    })
    render(
      <I18nProvider>
        <TestConsumer />
      </I18nProvider>
    )
    expect(screen.getByTestId('locale')).toHaveTextContent('es')
  })
})

describe('I18nProvider - HTML lang synchronization', () => {
  beforeEach(setupMocks)
  afterEach(teardownMocks)

  it('Given the provider mounts, Then html lang is set', () => {
    render(
      <I18nProvider initialLocale='es'>
        <TestConsumer />
      </I18nProvider>
    )
    expect(document.documentElement.lang).toBe('es')
  })

  it('Given the provider renders, Then document lang is updated', () => {
    document.documentElement.lang = 'fr'
    render(
      <I18nProvider initialLocale='en'>
        <TestConsumer />
      </I18nProvider>
    )
    expect(document.documentElement.lang).toBe('en')
  })
})

describe('I18nProvider - setLocale', () => {
  beforeEach(setupMocks)
  afterEach(teardownMocks)

  it('Given setLocale is called, Then locale updates and persists', () => {
    const wrapper = ({ children }: { children: ReactNode }): JSX.Element => (
      <I18nProvider initialLocale='en'>{children}</I18nProvider>
    )
    const { result } = renderHook(() => useTranslation(), { wrapper })
    act(() => {
      result.current.setLocale('es')
    })
    expect(result.current.locale).toBe('es')
    expect(localStorageMock[LOCALE_STORAGE_KEY]).toBe('es')
    expect(document.documentElement.lang).toBe('es')
  })

  it('Given localStorage throws on setItem, Then locale still updates', () => {
    jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('localStorage disabled')
    })
    const wrapper = ({ children }: { children: ReactNode }): JSX.Element => (
      <I18nProvider initialLocale='en'>{children}</I18nProvider>
    )
    const { result } = renderHook(() => useTranslation(), { wrapper })
    act(() => {
      result.current.setLocale('es')
    })
    expect(result.current.locale).toBe('es')
  })
})

describe('I18nProvider - Translation function', () => {
  beforeEach(setupMocks)
  afterEach(teardownMocks)

  it('Given a valid nested key, Then it returns the translated string', () => {
    const wrapper = ({ children }: { children: ReactNode }): JSX.Element => (
      <I18nProvider initialLocale='en'>{children}</I18nProvider>
    )
    const { result } = renderHook(() => useTranslation(), { wrapper })
    expect(result.current.t('greeting.hello')).toBe('Hello')
    expect(result.current.t('greeting.welcome')).toBe('Welcome to the application')
  })

  it('Given locale changes, Then translations update', () => {
    const wrapper = ({ children }: { children: ReactNode }): JSX.Element => (
      <I18nProvider initialLocale='en'>{children}</I18nProvider>
    )
    const { result } = renderHook(() => useTranslation(), { wrapper })
    expect(result.current.t('greeting.hello')).toBe('Hello')
    act(() => {
      result.current.setLocale('es')
    })
    expect(result.current.t('greeting.hello')).toBe('Hola')
  })

  it('Given an invalid key, Then it returns the key itself as fallback', () => {
    const wrapper = ({ children }: { children: ReactNode }): JSX.Element => (
      <I18nProvider initialLocale='en'>{children}</I18nProvider>
    )
    const { result } = renderHook(() => useTranslation(), { wrapper })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const invalidKey = 'invalid.key.path' as any
    expect(result.current.t(invalidKey)).toBe('invalid.key.path')
  })

  it('Given a key pointing to non-string value, Then it returns the key', () => {
    const wrapper = ({ children }: { children: ReactNode }): JSX.Element => (
      <I18nProvider initialLocale='en'>{children}</I18nProvider>
    )
    const { result } = renderHook(() => useTranslation(), { wrapper })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const objectKey = 'greeting' as any
    expect(result.current.t(objectKey)).toBe('greeting')
  })
})
