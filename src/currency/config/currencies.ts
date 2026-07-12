import type { SupportedCurrency, CurrencyMetadata } from '../types/Currency'

export const CURRENCY_STORAGE_KEY = 'app-currency' as const
export const SUPPORTED_CURRENCIES: readonly SupportedCurrency[] = [
  'COP', // Colombian Peso (base currency for conversion)
  'USD',
  'EUR',
  'GBP',
  'MXN',
  'CNY',
  'JPY',
] as const

export const CURRENCY_METADATA: Readonly<Record<SupportedCurrency, CurrencyMetadata>> = {
  COP: { code: 'COP', symbol: '$', name: 'Colombian Peso', localizedNameKey: 'currency.cop' },
  USD: { code: 'USD', symbol: '$', name: 'US Dollar', localizedNameKey: 'currency.usd' },
  EUR: { code: 'EUR', symbol: 'EUR', name: 'Euro', localizedNameKey: 'currency.eur' },
  GBP: { code: 'GBP', symbol: 'GBP', name: 'British Pound', localizedNameKey: 'currency.gbp' },
  MXN: { code: 'MXN', symbol: 'MX$', name: 'Mexican Peso', localizedNameKey: 'currency.mxn' },
  CNY: { code: 'CNY', symbol: 'CN¥', name: 'Chinese Yuan', localizedNameKey: 'currency.cny' },
  JPY: { code: 'JPY', symbol: '¥', name: 'Japanese Yen', localizedNameKey: 'currency.jpy' },
} as const

export function isValidCurrency(value: string): value is SupportedCurrency {
  return SUPPORTED_CURRENCIES.includes(value as SupportedCurrency)
}
