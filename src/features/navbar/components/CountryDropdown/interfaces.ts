import type { SupportedRegion } from '../../../../region'

export interface CountryDropdownProps {
  dataTestId?: string
  className?: string
  onRegionChange?: (newRegion: SupportedRegion) => void
}
