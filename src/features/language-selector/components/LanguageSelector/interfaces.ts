import type { SupportedLocale } from '../../../../i18n'

export interface LanguageSelectorProps {
  dataTestId?: string
  className?: string
  onLocaleChange?: (newLocale: SupportedLocale) => void
}
