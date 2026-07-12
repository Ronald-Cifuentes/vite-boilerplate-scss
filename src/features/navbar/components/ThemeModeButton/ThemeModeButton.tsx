import { FC, useCallback } from 'react'
import { useSignals } from '@preact/signals-react/runtime'
import { IconButton } from '../../../../shared/components/IconButton'
import { Announcer } from '../../../../shared/components/Announcer'
import { useTheme, PREFERENCE_ICONS, PREFERENCE_LABEL_KEYS } from '../../../../theme'
import type { ThemePreference } from '../../../../theme'
import { useTranslation } from '../../../../i18n'
import { themeAnnouncementSignal, setThemeAnnouncement } from '../../signals/announcement-signal'
import type { ThemeModeButtonProps } from './interfaces'
import styles from './ThemeModeButton.module.scss'

/**
 * Tri-state icon cycle button for theme preference.
 * Cycles: light -> dark -> system -> light
 * Per ADR-0009 (supersedes ThemeDropdown).
 */
export const ThemeModeButton: FC<ThemeModeButtonProps> = ({
  dataTestId = 'theme-mode-button',
  className,
  onPreferenceChange,
}) => {
  useSignals()
  const { t } = useTranslation()
  const { preference, cyclePreference } = useTheme()

  const handleClick = useCallback((): void => {
    cyclePreference()
    // Get the next preference for announcement (cycle already happened)
    const order: ThemePreference[] = ['light', 'dark', 'system']
    const currentIndex = order.indexOf(preference)
    const nextPreference = order[(currentIndex + 1) % order.length]

    onPreferenceChange?.(nextPreference)

    const preferenceName = t(PREFERENCE_LABEL_KEYS[nextPreference])
    setThemeAnnouncement(`${t('a11y.themeChangedTo')} ${preferenceName}`)
  }, [cyclePreference, preference, onPreferenceChange, t])

  const Icon = PREFERENCE_ICONS[preference]
  const ariaLabel = t(PREFERENCE_LABEL_KEYS[preference])

  const classNames = [styles.themeModeButton, className].filter(Boolean).join(' ')

  return (
    <div className={classNames} data-testid={dataTestId}>
      <IconButton
        icon={Icon}
        aria-label={ariaLabel}
        onClick={handleClick}
        dataTestId={`${dataTestId}-button`}
      />
      <Announcer message={themeAnnouncementSignal.value} dataTestId={`${dataTestId}-announcer`} />
    </div>
  )
}
