import { renderHook } from '@testing-library/react'
import { ReactNode, JSX } from 'react'
import { useTranslation } from './useTranslation'
import { I18nProvider } from '../adapters/I18nProvider'

// Hoisted to module scope to avoid deep function nesting (Sonar S2004).
const wrapper = ({ children }: { children: ReactNode }): JSX.Element => (
  <I18nProvider initialLocale='en'>{children}</I18nProvider>
)

describe('useTranslation', () => {
  describe('Given the hook is used within I18nProvider', () => {
    it('Then it returns the Translator interface', () => {
      const { result } = renderHook(() => useTranslation(), { wrapper })

      expect(result.current).toHaveProperty('t')
      expect(result.current).toHaveProperty('locale')
      expect(result.current).toHaveProperty('setLocale')
      expect(result.current).toHaveProperty('supportedLocales')
    })

    it('Then t() function translates keys correctly', () => {
      const { result } = renderHook(() => useTranslation(), { wrapper })

      expect(result.current.t('greeting.hello')).toBe('Hello')
      expect(result.current.t('common.appName')).toBe('Vite Boilerplate')
    })

    it('Then locale returns the current locale', () => {
      const { result } = renderHook(() => useTranslation(), { wrapper })

      expect(result.current.locale).toBe('en')
    })

    it('Then supportedLocales returns all locales', () => {
      const { result } = renderHook(() => useTranslation(), { wrapper })

      expect(result.current.supportedLocales).toContain('en')
      expect(result.current.supportedLocales).toContain('es')
    })
  })
})
