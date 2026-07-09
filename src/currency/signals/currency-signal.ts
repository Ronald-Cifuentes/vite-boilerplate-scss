import { signal, computed } from '@preact/signals-react'
import type { SupportedCurrency } from '../types/Currency'
import type { SupportedRegion } from '../../region/types/Region'
import { CURRENCY_METADATA } from '../config/currencies'
import { REGION_METADATA } from '../../region/config/regions'

/**
 * Singleton signal carrying the active currency for the whole app.
 */
export const currencySignal = signal<SupportedCurrency>('USD')

/**
 * Tracks whether the user has explicitly selected a currency.
 * If true, region changes will NOT update the currency.
 */
export const userOverriddenSignal = signal<boolean>(false)

/** Derived state: metadata for current currency */
export const currencyMetadataSignal = computed(() => CURRENCY_METADATA[currencySignal.value])

/**
 * Set currency explicitly (user selection).
 * @param currency The currency to set
 * @param isExplicit Whether this is an explicit user selection (default true)
 */
export function setCurrency(currency: SupportedCurrency, isExplicit: boolean = true): void {
  currencySignal.value = currency
  if (isExplicit) {
    userOverriddenSignal.value = true
  }
}

/**
 * Sync currency to region's default, but ONLY if user hasn't explicitly overridden.
 * Called when region changes.
 */
export function syncCurrencyToRegion(region: SupportedRegion): void {
  if (!userOverriddenSignal.value) {
    const regionMeta = REGION_METADATA[region]
    currencySignal.value = regionMeta.currency as SupportedCurrency
  }
}

/**
 * Format currency using the current currency and appropriate locale.
 * Uses the currency's typical locale for formatting.
 */
export function formatCurrency(value: number): string {
  const currency = currencySignal.value
  // Use appropriate locale for currency formatting
  const localeMap: Record<SupportedCurrency, string> = {
    USD: 'en-US',
    EUR: 'es-ES',
    GBP: 'en-GB',
    MXN: 'es-MX',
  }
  return new Intl.NumberFormat(localeMap[currency], {
    style: 'currency',
    currency,
  }).format(value)
}

/**
 * Reset currency override (for testing or "reset to default" feature).
 */
export function resetCurrencyOverride(): void {
  userOverriddenSignal.value = false
}
