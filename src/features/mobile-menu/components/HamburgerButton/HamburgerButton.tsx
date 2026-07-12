import { FC } from 'react'
import { useTranslation } from '../../../../i18n'
import type { HamburgerButtonProps } from './interfaces'
import styles from './HamburgerButton.module.scss'

/**
 * Hamburger button that toggles the mobile menu.
 * Replicates CodePen OJLMgYY: 2-bar to X with 1turn spin.
 */
export const HamburgerButton: FC<HamburgerButtonProps> = ({
  isOpen,
  onClick,
  buttonRef,
  dataTestId = 'app-navbar-hamburger',
  className,
}) => {
  const { t } = useTranslation()

  const classNames = [styles.hamburger, isOpen && styles.open, className].filter(Boolean).join(' ')

  return (
    <button
      ref={buttonRef}
      type='button'
      className={classNames}
      onClick={onClick}
      aria-expanded={isOpen}
      aria-controls='mobile-menu'
      aria-label={isOpen ? t('mobileMenu.closeMenu') : t('mobileMenu.openMenu')}
      data-testid={dataTestId}
    >
      <span className={styles.bars} />
    </button>
  )
}
