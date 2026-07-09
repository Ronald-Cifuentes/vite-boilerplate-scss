import { useSignals } from '@preact/signals-react/runtime'
import type { RegionPort } from '../ports/Region'
import type { SupportedRegion } from '../types/Region'
import {
  regionSignal,
  setRegion,
  cycleRegion,
  formatDate,
  formatNumber,
} from '../signals/region-signal'
import { SUPPORTED_REGIONS } from '../config/regions'

export function useRegion(): RegionPort {
  useSignals()

  return {
    get region(): SupportedRegion {
      return regionSignal.value
    },
    setRegion,
    cycleRegion,
    supportedRegions: SUPPORTED_REGIONS,
    formatDate,
    formatNumber,
  }
}
