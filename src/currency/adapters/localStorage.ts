import type { SupportedCurrency } from '../types/Currency'
import { CURRENCY_STORAGE_KEY, isValidCurrency } from '../config/currencies'

const USER_OVERRIDE_KEY = `${CURRENCY_STORAGE_KEY}-override`

/**
 * Load currency from localStorage.
 * @returns The stored currency if valid, null otherwise.
 */
export function loadCurrency(): SupportedCurrency | null {
  try {
    const stored = localStorage.getItem(CURRENCY_STORAGE_KEY)
    if (stored && isValidCurrency(stored)) {
      return stored
    }
  } catch {
    // localStorage may be unavailable (SSR, private browsing)
  }
  return null
}

/**
 * Save currency to localStorage.
 */
export function saveCurrency(currency: SupportedCurrency): void {
  try {
    localStorage.setItem(CURRENCY_STORAGE_KEY, currency)
  } catch {
    // localStorage may be unavailable
  }
}

/**
 * Load user override flag from localStorage.
 */
export function loadUserOverridden(): boolean {
  try {
    return localStorage.getItem(USER_OVERRIDE_KEY) === 'true'
  } catch {
    return false
  }
}

/**
 * Save user override flag to localStorage.
 */
export function saveUserOverridden(overridden: boolean): void {
  try {
    if (overridden) {
      localStorage.setItem(USER_OVERRIDE_KEY, 'true')
    } else {
      localStorage.removeItem(USER_OVERRIDE_KEY)
    }
  } catch {
    // localStorage may be unavailable
  }
}

/**
 * Clear all currency storage (for testing).
 */
export function clearCurrencyStorage(): void {
  try {
    localStorage.removeItem(CURRENCY_STORAGE_KEY)
    localStorage.removeItem(USER_OVERRIDE_KEY)
  } catch {
    // localStorage may be unavailable
  }
}
