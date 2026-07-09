import type { SupportedLocale } from '../../../../i18n'

export interface LanguageDropdownProps {
  dataTestId?: string
  className?: string
  onLocaleChange?: (newLocale: SupportedLocale) => void
}
