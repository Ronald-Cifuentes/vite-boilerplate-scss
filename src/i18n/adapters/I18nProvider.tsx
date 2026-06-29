import { FC, ReactNode } from 'react'
import { useSignalEffect } from '@preact/signals-react'
import { localeSignal } from '../signals/locale-signal'
import { resolveInitialLocale } from '../signals/translator'
import { syncHtmlLang } from '../signals/side-effects'
import { isSupportedLocale } from '../config/locales'
import type { SupportedLocale } from '../types/Locale'

export interface I18nProviderProps {
  children: ReactNode
  initialLocale?: SupportedLocale
}

/**
 * Boundary component that:
 *   1. Resets the singleton `localeSignal` on mount, so each test renders
 *      with a known initial locale (and so the app starts from the right
 *      state when navigated to from a different route).
 *   2. Keeps the document `lang` attribute in sync with the active locale.
 *
 * `react-hooks/immutability` forbids mutating module-level state from a
 * component body, so the initial reset and the lang-sync effect both run
 * inside `useSignalEffect` callbacks. The reset effect tracks `initialLocale`
 * so re-renders with a new `initialLocale` reset the singleton.
 *
 * No `useState`, no Context — all reactive state lives in module-level
 * signals. The provider is intentionally a thin orchestrator.
 */
export const I18nProvider: FC<I18nProviderProps> = ({ children, initialLocale }) => {
  useSignalEffect(() => {
    if (initialLocale && isSupportedLocale(initialLocale)) {
      localeSignal.value = initialLocale
    } else {
      localeSignal.value = resolveInitialLocale()
    }
  })

  useSignalEffect(() => {
    syncHtmlLang(localeSignal.value)
  })

  return <>{children}</>
}

export default I18nProvider
