export type SupportedCurrency = 'COP' | 'USD' | 'EUR' | 'GBP' | 'MXN' | 'CNY' | 'JPY'

export interface CurrencyMetadata {
  readonly code: SupportedCurrency
  readonly symbol: string
  readonly name: string
  readonly localizedNameKey: string
}
