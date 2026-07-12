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

export const I18nProvider: FC<I18nProviderProps> = ({ children, initialLocale }) => {
  useSignalEffect(() => {
    localeSignal.value =
      initialLocale && isSupportedLocale(initialLocale) ? initialLocale : resolveInitialLocale()
  })
  useSignalEffect(() => {
    syncHtmlLang(localeSignal.value)
  })
  return <>{children}</>
}
