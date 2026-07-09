import type { SupportedCurrency, CurrencyMetadata } from '../types/Currency'

export const CURRENCY_STORAGE_KEY = 'app-currency' as const
export const SUPPORTED_CURRENCIES: readonly SupportedCurrency[] = [
  'USD',
  'EUR',
  'GBP',
  'MXN',
] as const

export const CURRENCY_METADATA: Readonly<Record<SupportedCurrency, CurrencyMetadata>> = {
  USD: { code: 'USD', symbol: '$', name: 'US Dollar', localizedNameKey: 'currency.usd' },
  EUR: { code: 'EUR', symbol: 'EUR', name: 'Euro', localizedNameKey: 'currency.eur' },
  GBP: { code: 'GBP', symbol: 'GBP', name: 'British Pound', localizedNameKey: 'currency.gbp' },
  MXN: { code: 'MXN', symbol: 'MX$', name: 'Mexican Peso', localizedNameKey: 'currency.mxn' },
} as const

export function isValidCurrency(value: string): value is SupportedCurrency {
  return SUPPORTED_CURRENCIES.includes(value as SupportedCurrency)
}
