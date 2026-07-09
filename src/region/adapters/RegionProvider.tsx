import { FC, ReactNode } from 'react'
import { useSignalEffect } from '@preact/signals-react'
import { regionSignal, setRegion } from '../signals/region-signal'
import { persistRegion, loadPersistedRegion } from './localStorage'
import { isValidRegion, DEFAULT_REGION } from '../config/regions'
import type { SupportedRegion } from '../types/Region'

export interface RegionProviderProps {
  children: ReactNode
  initialRegion?: SupportedRegion
}

/**
 * Boundary component that:
 *   1. Resets the singleton `regionSignal` on mount from: props > localStorage > default
 *   2. Persists region changes to localStorage.
 */
export const RegionProvider: FC<RegionProviderProps> = ({ children, initialRegion }) => {
  // Initialize region on mount
  useSignalEffect(() => {
    if (initialRegion && isValidRegion(initialRegion)) {
      setRegion(initialRegion)
    } else {
      const persisted = loadPersistedRegion()
      if (persisted) {
        setRegion(persisted)
      } else {
        setRegion(DEFAULT_REGION)
      }
    }
  })

  // Persist region changes
  useSignalEffect(() => {
    persistRegion(regionSignal.value)
  })

  return <>{children}</>
}

export default RegionProvider
