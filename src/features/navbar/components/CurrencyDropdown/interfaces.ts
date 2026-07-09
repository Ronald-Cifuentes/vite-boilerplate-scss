import type { SupportedCurrency } from '../../../../currency'

export interface CurrencyDropdownProps {
  dataTestId?: string
  className?: string
  onCurrencyChange?: (newCurrency: SupportedCurrency) => void
}
