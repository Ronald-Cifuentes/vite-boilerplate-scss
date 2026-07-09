import { FC } from 'react'
import { LanguageDropdown } from '../LanguageDropdown'
import { ThemeModeButton } from '../ThemeModeButton'
import { CountryDropdown } from '../CountryDropdown'
import { CurrencyDropdown } from '../CurrencyDropdown'
import type { NavbarProps } from './interfaces'
import styles from './Navbar.module.scss'

/**
 * Navbar containing settings controls: language, theme, country, currency.
 * Language, country, currency are dropdown menus per ADR-0007.
 * Theme is a tri-state cycle button per ADR-0009 (supersedes ThemeDropdown).
 */
export const Navbar: FC<NavbarProps> = ({ dataTestId = 'navbar', className }) => {
  const classNames = [styles.navbar, className].filter(Boolean).join(' ')

  return (
    <nav className={classNames} data-testid={dataTestId} aria-label='Settings'>
      <div className={styles.controls}>
        <LanguageDropdown dataTestId={`${dataTestId}-language`} />
        <ThemeModeButton dataTestId={`${dataTestId}-theme`} />
        <CountryDropdown dataTestId={`${dataTestId}-country`} />
        <CurrencyDropdown dataTestId={`${dataTestId}-currency`} />
      </div>
    </nav>
  )
}

export default Navbar
