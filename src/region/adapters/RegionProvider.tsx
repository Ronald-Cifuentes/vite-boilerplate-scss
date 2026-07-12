import { FC, ReactNode, useRef } from 'react'
import { useSignalEffect } from '@preact/signals-react'
import { regionSignal, setRegion } from '../signals/region-signal'
import { persistRegion, loadPersistedRegion } from './localStorage'
import { isValidRegion, DEFAULT_REGION } from '../config/regions'
import type { SupportedRegion } from '../types/Region'

export interface RegionProviderProps {
  children: ReactNode
  initialRegion?: SupportedRegion
}

export const RegionProvider: FC<RegionProviderProps> = ({ children, initialRegion }) => {
  // Track if first change is initialization
  const initializedRef = useRef(false)
  const hadStoredValue = useRef(false)

  // Initialize region on mount
  useSignalEffect(() => {
    if (initialRegion && isValidRegion(initialRegion)) {
      hadStoredValue.current = true // Treat prop as user-specified
      setRegion(initialRegion)
    } else {
      const persisted = loadPersistedRegion()
      if (persisted) {
        hadStoredValue.current = true
        setRegion(persisted)
      } else {
        // Set default but don't persist it (first-visit detection)
        hadStoredValue.current = false
        setRegion(DEFAULT_REGION)
      }
    }
    initializedRef.current = true
  })

  // Persist region changes - but not the initial default
  useSignalEffect(() => {
    // Only persist if we had a stored value OR this is an explicit user change
    if (
      hadStoredValue.current ||
      (initializedRef.current && regionSignal.value !== DEFAULT_REGION)
    ) {
      persistRegion(regionSignal.value)
      hadStoredValue.current = true // Future changes should persist
    }
  })

  return <>{children}</>
}
