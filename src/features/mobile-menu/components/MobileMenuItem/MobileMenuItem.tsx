import { FC, useCallback, KeyboardEvent, FocusEvent, ReactNode } from 'react'
import { useTranslation } from '../../../../i18n'
import type { MobileMenuItemProps } from './interfaces'
import styles from './MobileMenuItem.module.scss'
import { prefersReducedMotion } from '../../utils/motion'

const buildClassName = (
  isExpanded: boolean,
  siblingHovered: boolean,
  className?: string
): string => {
  return [styles.item, isExpanded && styles.expanded, siblingHovered && styles.dimmed, className]
    .filter(Boolean)
    .join(' ')
}

const renderSubmenu = (hasSubmenu: boolean, children: ReactNode, isExpanded: boolean): ReactNode =>
  hasSubmenu && children ? (
    <div className={styles.submenuContainer} aria-hidden={!isExpanded}>
      {children}
    </div>
  ) : null

/**
 * Mobile menu item - top-level item in fullscreen menu.
 * Replicates CodePen OJLMgYY styling: Rubik Mono One at 10vmin.
 */
export const MobileMenuItem: FC<MobileMenuItemProps> = ({
  labelKey,
  icon,
  onClick,
  hasSubmenu = false,
  isExpanded = false,
  onToggleSubmenu,
  children,
  dataTestId,
  className,
  index = 0,
  siblingHovered = false,
}) => {
  const { t } = useTranslation()

  const handleClick = useCallback((): void => {
    if (hasSubmenu && onToggleSubmenu) {
      onToggleSubmenu()
    } else if (onClick) {
      onClick()
    }
  }, [hasSubmenu, onClick, onToggleSubmenu])

  const handleKeyDown = useCallback(
    (e: KeyboardEvent): void => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        handleClick()
      }
    },
    [handleClick]
  )

  /**
   * CONTRACTS §17: scroll focused item into view for keyboard navigation
   * Uses 'nearest' to avoid jarring jumps; 'auto' behavior when reduced motion preferred
   */
  const handleFocus = useCallback((e: FocusEvent<HTMLButtonElement>): void => {
    const behavior = prefersReducedMotion() ? 'auto' : 'smooth'
    e.currentTarget.scrollIntoView({ block: 'nearest', behavior })
  }, [])

  const classNames = buildClassName(isExpanded, siblingHovered, className)
  const style = { '--item-index': index } as React.CSSProperties

  return (
    <li className={classNames} style={style} data-testid={dataTestId}>
      <button
        type='button'
        className={styles.button}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        aria-expanded={hasSubmenu ? isExpanded : undefined}
        aria-haspopup={hasSubmenu ? 'menu' : undefined}
      >
        {icon && <span className={styles.icon}>{icon}</span>}
        <span className={styles.label}>{t(labelKey as Parameters<typeof t>[0])}</span>
      </button>
      {renderSubmenu(hasSubmenu, children, isExpanded)}
    </li>
  )
}
