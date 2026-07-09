export type SupportedCurrency = 'USD' | 'EUR' | 'GBP' | 'MXN'

export interface CurrencyMetadata {
  readonly code: SupportedCurrency
  readonly symbol: string
  readonly name: string
  readonly localizedNameKey: string
}
