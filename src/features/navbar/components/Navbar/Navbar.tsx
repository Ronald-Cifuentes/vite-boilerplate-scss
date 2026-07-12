import { FC, useRef } from 'react'
import { useSignals } from '@preact/signals-react/runtime'
import { LanguageDropdown } from '../LanguageDropdown'
import { ThemeModeButton } from '../ThemeModeButton'
import { CountryDropdown } from '../CountryDropdown'
import { CurrencyDropdown } from '../CurrencyDropdown'
import { HamburgerButton, MobileMenu } from '../../../mobile-menu'
import {
  mobileMenuOpenSignal,
  toggleMobileMenu,
  closeMobileMenu,
} from '../../../mobile-menu/signals/mobile-menu-signal'
import type { NavbarProps } from './interfaces'
import styles from './Navbar.module.scss'

/**
 * Navbar containing settings controls: language, theme, country, currency.
 * At < 768px: shows hamburger button that opens fullscreen mobile menu.
 * At >= 768px: shows inline dropdown controls.
 * Per ADR-0012.
 */
export const Navbar: FC<NavbarProps> = ({ dataTestId = 'navbar', className }) => {
  useSignals()
  const hamburgerRef = useRef<HTMLButtonElement>(null)

  const classNames = [styles.navbar, className].filter(Boolean).join(' ')

  return (
    <>
      <nav className={classNames} data-testid={dataTestId} aria-label='Settings'>
        <div className={styles.mobileControls}>
          <HamburgerButton
            isOpen={mobileMenuOpenSignal.value}
            onClick={toggleMobileMenu}
            buttonRef={hamburgerRef}
            dataTestId={`${dataTestId}-hamburger`}
          />
        </div>

        <div className={styles.desktopControls}>
          <LanguageDropdown dataTestId={`${dataTestId}-language`} />
          <ThemeModeButton dataTestId={`${dataTestId}-theme`} />
          <CountryDropdown dataTestId={`${dataTestId}-country`} />
          <CurrencyDropdown dataTestId={`${dataTestId}-currency`} />
        </div>
      </nav>

      <MobileMenu
        isOpen={mobileMenuOpenSignal.value}
        onClose={closeMobileMenu}
        hamburgerRef={hamburgerRef}
        dataTestId='app-mobile-menu'
      />
    </>
  )
}
