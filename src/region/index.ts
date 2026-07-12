export type { RegionPort } from './ports/Region'
export type { SupportedRegion, RegionMetadata } from './types/Region'

export {
  DEFAULT_REGION,
  SUPPORTED_REGIONS,
  REGION_STORAGE_KEY,
  REGION_METADATA,
  isValidRegion,
} from './config/regions'

export { RegionProvider } from './adapters/RegionProvider'
export type { RegionProviderProps } from './adapters/RegionProvider'

export { useRegion } from './hooks/useRegion'

// Signal functions (for testing)
export { setRegion, regionSignal } from './signals/region-signal'
