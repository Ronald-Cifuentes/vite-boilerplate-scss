import { FC, useCallback, useMemo } from 'react'
import { useSignals } from '@preact/signals-react/runtime'
import { MdPublic } from 'react-icons/md'
import { Dropdown } from '../../../../shared/components/Dropdown'
import type { DropdownOption } from '../../../../shared/components/Dropdown'
import { Announcer } from '../../../../shared/components/Announcer'
import { useRegion, SUPPORTED_REGIONS, REGION_METADATA } from '../../../../region'
import type { SupportedRegion } from '../../../../region'
import { useTranslation } from '../../../../i18n'
import {
  countryAnnouncementSignal,
  setCountryAnnouncement,
} from '../../signals/announcement-signal'
import type { CountryDropdownProps } from './interfaces'

/**
 * Dropdown for selecting application region/country.
 * Replaces CountryCycleButton per ADR-0007.
 */
export const CountryDropdown: FC<CountryDropdownProps> = ({
  dataTestId = 'country-dropdown',
  className,
  onRegionChange,
}) => {
  useSignals()
  const { t } = useTranslation()
  const { region, setRegion } = useRegion()

  const options: DropdownOption<SupportedRegion>[] = useMemo(
    () =>
      SUPPORTED_REGIONS.map(reg => ({
        value: reg,
        label: REGION_METADATA[reg].englishName,
        icon: MdPublic,
      })),
    []
  )

  const handleChange = useCallback(
    (newRegion: SupportedRegion): void => {
      setRegion(newRegion)
      onRegionChange?.(newRegion)

      // Announce the change
      const countryName = REGION_METADATA[newRegion].englishName
      setCountryAnnouncement(`${t('a11y.countryChangedTo')} ${countryName}`)
    },
    [setRegion, onRegionChange, t]
  )

  const currentCountryName = REGION_METADATA[region].englishName
  const triggerLabel = `${t('navbar.selectCountry')}, ${t('navbar.currentCountry')}: ${currentCountryName}`

  return (
    <>
      <Dropdown
        options={options}
        value={region}
        onChange={handleChange}
        triggerIcon={MdPublic}
        triggerLabel={triggerLabel}
        id='country-dropdown'
        dataTestId={dataTestId}
        className={className}
      />
      <Announcer message={countryAnnouncementSignal.value} dataTestId={`${dataTestId}-announcer`} />
    </>
  )
}

export default CountryDropdown
