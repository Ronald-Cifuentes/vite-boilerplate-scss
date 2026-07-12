import { FC, useCallback, useEffect, useRef } from 'react'
import { useSignals } from '@preact/signals-react/runtime'
import { MdLanguage, MdPublic, MdAttachMoney } from 'react-icons/md'
import { useTranslation, SUPPORTED_LOCALES, LOCALE_METADATA } from '../../../../i18n'
import type { SupportedLocale } from '../../../../i18n'
import { useRegion, SUPPORTED_REGIONS, REGION_METADATA } from '../../../../region'
import type { SupportedRegion } from '../../../../region'
import { useCurrency, SUPPORTED_CURRENCIES, CURRENCY_METADATA } from '../../../../currency'
import type { SupportedCurrency } from '../../../../currency'
import { useTheme, PREFERENCE_ICONS, PREFERENCE_LABEL_KEYS } from '../../../../theme'
import type { ThemePreference } from '../../../../theme'
import { Announcer } from '../../../../shared/components/Announcer'
import {
  languageAnnouncementSignal,
  setLanguageAnnouncement,
  countryAnnouncementSignal,
  setCountryAnnouncement,
  currencyAnnouncementSignal,
  setCurrencyAnnouncement,
  themeAnnouncementSignal,
  setThemeAnnouncement,
} from '../../../navbar/signals/announcement-signal'
import {
  expandedItemSignal,
  setExpandedItem,
  toggleExpandedItem,
} from '../../signals/mobile-menu-signal'
import { useFocusTrap } from '../../hooks/useFocusTrap'
import { MobileMenuItem } from '../MobileMenuItem'
import { MobileMenuSubmenu } from '../MobileMenuSubmenu'
import type { SubmenuOption } from '../MobileMenuSubmenu'
import type { MobileMenuProps } from './interfaces'
import styles from './MobileMenu.module.scss'

/**
 * Fullscreen mobile menu replicating CodePen OJLMgYY.
 * 4 top-level items: Language, Country, Currency, Theme.
 */
export const MobileMenu: FC<MobileMenuProps> = ({
  isOpen,
  onClose,
  hamburgerRef,
  dataTestId = 'app-mobile-menu',
  className,
}) => {
  useSignals()
  const menuRef = useRef<HTMLDivElement>(null)
  const { t, locale, setLocale } = useTranslation()
  const { region, setRegion } = useRegion()
  const { currency, setCurrency } = useCurrency()
  const { preference, cyclePreference } = useTheme()

  // Focus trap
  useFocusTrap(menuRef, hamburgerRef, isOpen)

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
      // Reset expanded item when menu closes (via signal, not setState)
      setExpandedItem(null)
    }
    return (): void => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  // ADR-0012 Amendment 2: close menu when viewport crosses to desktop (768px)
  // Uses matchMedia change listener, NOT resize event polling
  useEffect(() => {
    // Skip if menu is not open
    if (!isOpen) return

    const mql = window.matchMedia('(min-width: 768px)')

    const handleChange = (e: MediaQueryListEvent): void => {
      if (e.matches) {
        // Crossed to desktop - close menu via existing close path
        // This triggers immediate aria/focus update + scroll lock release
        onClose()
      }
    }

    mql.addEventListener('change', handleChange)
    return (): void => {
      mql.removeEventListener('change', handleChange)
    }
  }, [isOpen, onClose])

  // Escape to close
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return (): void => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  // Language options
  const languageOptions: SubmenuOption<SupportedLocale>[] = SUPPORTED_LOCALES.map(loc => ({
    value: loc,
    label: LOCALE_METADATA[loc].nativeName,
    icon: <MdLanguage />,
  }))

  // Country options
  const countryOptions: SubmenuOption<SupportedRegion>[] = SUPPORTED_REGIONS.map(reg => ({
    value: reg,
    label: REGION_METADATA[reg].nativeName,
    icon: <MdPublic />,
  }))

  // Currency options
  const currencyOptions: SubmenuOption<SupportedCurrency>[] = SUPPORTED_CURRENCIES.map(cur => ({
    value: cur,
    label: `${CURRENCY_METADATA[cur].symbol} ${CURRENCY_METADATA[cur].name}`,
    icon: <MdAttachMoney />,
  }))

  const handleLanguageSelect = useCallback(
    (newLocale: SupportedLocale) => {
      setLocale(newLocale)
      setExpandedItem(null)
      const langName = LOCALE_METADATA[newLocale].nativeName
      setLanguageAnnouncement(`${t('a11y.languageChangedTo')} ${langName}`)
    },
    [setLocale, t]
  )

  const handleCountrySelect = useCallback(
    (newRegion: SupportedRegion) => {
      setRegion(newRegion)
      setExpandedItem(null)
      const regionName = REGION_METADATA[newRegion].nativeName
      setCountryAnnouncement(`${t('a11y.countryChangedTo')} ${regionName}`)
    },
    [setRegion, t]
  )

  const handleCurrencySelect = useCallback(
    (newCurrency: SupportedCurrency) => {
      setCurrency(newCurrency)
      setExpandedItem(null)
      const currencyName = CURRENCY_METADATA[newCurrency].name
      setCurrencyAnnouncement(`${t('a11y.currencyChangedTo')} ${currencyName}`)
    },
    [setCurrency, t]
  )

  const handleThemeClick = useCallback(() => {
    cyclePreference()
    const order: ThemePreference[] = ['light', 'dark', 'system']
    const currentIndex = order.indexOf(preference)
    const nextPreference = order[(currentIndex + 1) % order.length]
    const preferenceName = t(PREFERENCE_LABEL_KEYS[nextPreference] as Parameters<typeof t>[0])
    setThemeAnnouncement(`${t('a11y.themeChangedTo')} ${preferenceName}`)
  }, [cyclePreference, preference, t])

  const ThemeIcon = PREFERENCE_ICONS[preference]

  const classNames = [styles.menu, isOpen && styles.open, className].filter(Boolean).join(' ')
  const expandedItem = expandedItemSignal.value

  if (!isOpen) {
    return null
  }

  return (
    <div
      ref={menuRef}
      id='mobile-menu'
      role='dialog'
      aria-modal='true'
      aria-label={t('mobileMenu.menuLabel')}
      className={classNames}
      data-testid={dataTestId}
    >
      <nav className={styles.nav}>
        <ul className={`${styles.list} menuOpen`}>
          <MobileMenuItem
            labelKey='mobileMenu.language'
            icon={<MdLanguage />}
            hasSubmenu
            isExpanded={expandedItem === 'language'}
            onToggleSubmenu={(): void => toggleExpandedItem('language')}
            index={0}
            dataTestId={`${dataTestId}-item-language`}
          >
            <MobileMenuSubmenu
              options={languageOptions}
              selectedValue={locale}
              onSelect={handleLanguageSelect}
              isVisible={expandedItem === 'language'}
              dataTestId={`${dataTestId}-submenu-language`}
            />
          </MobileMenuItem>

          <MobileMenuItem
            labelKey='mobileMenu.country'
            icon={<MdPublic />}
            hasSubmenu
            isExpanded={expandedItem === 'country'}
            onToggleSubmenu={(): void => toggleExpandedItem('country')}
            index={1}
            dataTestId={`${dataTestId}-item-country`}
          >
            <MobileMenuSubmenu
              options={countryOptions}
              selectedValue={region}
              onSelect={handleCountrySelect}
              isVisible={expandedItem === 'country'}
              dataTestId={`${dataTestId}-submenu-country`}
            />
          </MobileMenuItem>

          <MobileMenuItem
            labelKey='mobileMenu.currency'
            icon={<MdAttachMoney />}
            hasSubmenu
            isExpanded={expandedItem === 'currency'}
            onToggleSubmenu={(): void => toggleExpandedItem('currency')}
            index={2}
            dataTestId={`${dataTestId}-item-currency`}
          >
            <MobileMenuSubmenu
              options={currencyOptions}
              selectedValue={currency}
              onSelect={handleCurrencySelect}
              isVisible={expandedItem === 'currency'}
              dataTestId={`${dataTestId}-submenu-currency`}
            />
          </MobileMenuItem>

          <MobileMenuItem
            labelKey='mobileMenu.theme'
            icon={<ThemeIcon />}
            onClick={handleThemeClick}
            index={3}
            dataTestId={`${dataTestId}-item-theme`}
          />
        </ul>
      </nav>

      {/* Announcers for accessibility */}
      <Announcer
        message={languageAnnouncementSignal.value}
        dataTestId={`${dataTestId}-language-announcer`}
      />
      <Announcer
        message={countryAnnouncementSignal.value}
        dataTestId={`${dataTestId}-country-announcer`}
      />
      <Announcer
        message={currencyAnnouncementSignal.value}
        dataTestId={`${dataTestId}-currency-announcer`}
      />
      <Announcer
        message={themeAnnouncementSignal.value}
        dataTestId={`${dataTestId}-theme-announcer`}
      />
    </div>
  )
}

export default MobileMenu
