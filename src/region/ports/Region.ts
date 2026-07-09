import type { SupportedRegion } from '../types/Region'

export interface RegionPort {
  region: SupportedRegion
  setRegion: (region: SupportedRegion) => void
  cycleRegion: () => void
  supportedRegions: readonly SupportedRegion[]

  /** Format a date according to current region */
  formatDate: (date: Date, options?: Intl.DateTimeFormatOptions) => string

  /** Format a number according to current region */
  formatNumber: (value: number, options?: Intl.NumberFormatOptions) => string
}
