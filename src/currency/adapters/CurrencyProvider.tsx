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

function initializeCurrency(init: SupportedCurrency | undefined, region: SupportedRegion): void {
  const wo = loadUserOverridden()
  userOverriddenSignal.value = wo
  if (init) {
    currencySignal.value = init
    userOverriddenSignal.value = true
  } else if (wo) {
    const p = loadCurrency()
    if (p) currencySignal.value = p
  } else {
    syncCurrencyToRegion(region)
  }
}

export function cleanupCurrencyPersistence(d: { current: (() => void) | null }): void {
  if (d.current) {
    d.current()
    d.current = null
  }
}

export function createCleanupCallback(d: { current: (() => void) | null }): () => void {
  return () => cleanupCurrencyPersistence(d)
}

export const CurrencyProvider: FC<CurrencyProviderProps> = ({ children, initialCurrency }) => {
  const { region } = useRegion()
  const dr = useRef<(() => void) | null>(null)

  useEffect(() => {
    initializeCurrency(initialCurrency, region)
    dr.current = setupCurrencyPersistence()
    return createCleanupCallback(dr)
  }, [initialCurrency]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!userOverriddenSignal.value) syncCurrencyToRegion(region)
  }, [region])

  return <>{children}</>
}
