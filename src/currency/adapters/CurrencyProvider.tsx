import { FC, ReactNode, useEffect, useRef } from 'react'
import {
  currencySignal,
  userOverriddenSignal,
  syncCurrencyToRegion,
} from '../signals/currency-signal'
import { setupCurrencyPersistence } from '../signals/side-effects'
import { loadCurrency, loadUserOverridden } from './localStorage'
import { useRegion } from '../../region'
import type { SupportedCurrency } from '../types/Currency'
import type { SupportedRegion } from '../../region'

export interface CurrencyProviderProps {
  children: ReactNode
  initialCurrency?: SupportedCurrency
}

/**
 * Initialize currency state based on props, localStorage, or region default.
 * Exported for testing.
 */
export function initializeCurrency(
  initialCurrency: SupportedCurrency | undefined,
  region: SupportedRegion
): void {
  const wasOverridden = loadUserOverridden()
  userOverriddenSignal.value = wasOverridden

  if (initialCurrency) {
    currencySignal.value = initialCurrency
    userOverriddenSignal.value = true
  } else if (wasOverridden) {
    const persisted = loadCurrency()
    if (persisted) {
      currencySignal.value = persisted
    }
  } else {
    syncCurrencyToRegion(region)
  }
}

/**
 * Cleanup function for currency persistence.
 * Exported for testing.
 */
export function cleanupCurrencyPersistence(disposeRef: { current: (() => void) | null }): void {
  if (disposeRef.current) {
    disposeRef.current()
    disposeRef.current = null
  }
}

/**
 * Creates a cleanup callback for useEffect.
 * This is a separate function to ensure coverage tracking works correctly.
 */
export function createCleanupCallback(disposeRef: { current: (() => void) | null }): () => void {
  return () => cleanupCurrencyPersistence(disposeRef)
}

/**
 * Initializes and manages currency state.
 * Must be placed AFTER RegionProvider so it can react to region changes.
 *
 * Initialization priority:
 * 1. Explicit initialCurrency prop (for testing)
 * 2. Persisted currency from localStorage (if user previously overrode)
 * 3. Region's default currency
 */
export const CurrencyProvider: FC<CurrencyProviderProps> = ({ children, initialCurrency }) => {
  const { region } = useRegion()
  const disposeRef = useRef<(() => void) | null>(null)

  // Initialize on mount
  useEffect(() => {
    initializeCurrency(initialCurrency, region)
    disposeRef.current = setupCurrencyPersistence()
    return createCleanupCallback(disposeRef)
  }, [initialCurrency]) // eslint-disable-line react-hooks/exhaustive-deps -- Only run on mount

  // React to region changes
  useEffect(() => {
    if (!userOverriddenSignal.value) {
      syncCurrencyToRegion(region)
    }
  }, [region])

  return <>{children}</>
}
