import { FC, useCallback, useMemo } from 'react'
import { useSignals } from '@preact/signals-react/runtime'
import { MdLanguage } from 'react-icons/md'
import { Dropdown } from '../../../../shared/components/Dropdown'
import type { DropdownOption } from '../../../../shared/components/Dropdown'
import { Announcer } from '../../../../shared/components/Announcer'
import { useTranslation, SUPPORTED_LOCALES, LOCALE_METADATA } from '../../../../i18n'
import type { SupportedLocale } from '../../../../i18n'
import {
  languageAnnouncementSignal,
  setLanguageAnnouncement,
} from '../../signals/announcement-signal'
import type { LanguageDropdownProps } from './interfaces'

/**
 * Dropdown for selecting application language.
 * Replaces LanguageCycleButton per ADR-0007.
 */
export const LanguageDropdown: FC<LanguageDropdownProps> = ({
  dataTestId = 'language-dropdown',
  className,
  onLocaleChange,
}) => {
  useSignals()
  const { t, locale, setLocale } = useTranslation()

  const options: DropdownOption<SupportedLocale>[] = useMemo(
    () =>
      SUPPORTED_LOCALES.map(loc => ({
        value: loc,
        label: LOCALE_METADATA[loc].nativeName,
        icon: MdLanguage,
      })),
    []
  )

  const handleChange = useCallback(
    (newLocale: SupportedLocale): void => {
      setLocale(newLocale)
      onLocaleChange?.(newLocale)

      const langName = LOCALE_METADATA[newLocale].nativeName
      setLanguageAnnouncement(`${t('a11y.languageChangedTo')} ${langName}`)
    },
    [setLocale, onLocaleChange, t]
  )

  const currentLangName = LOCALE_METADATA[locale].nativeName
  const triggerLabel = `${t('navbar.selectLanguage')}, ${t('navbar.currentLanguage')}: ${currentLangName}`

  return (
    <>
      <Dropdown
        options={options}
        value={locale}
        onChange={handleChange}
        triggerIcon={MdLanguage}
        triggerLabel={triggerLabel}
        id='language-dropdown'
        dataTestId={dataTestId}
        className={className}
      />
      <Announcer
        message={languageAnnouncementSignal.value}
        dataTestId={`${dataTestId}-announcer`}
      />
    </>
  )
}
