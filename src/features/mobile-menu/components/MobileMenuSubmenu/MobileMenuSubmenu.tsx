import { FC, useCallback, KeyboardEvent, FocusEvent } from 'react'
import type { MobileMenuSubmenuProps } from './interfaces'
import styles from './MobileMenuSubmenu.module.scss'
import { prefersReducedMotion } from '../../utils/motion'

/**
 * Mobile menu submenu - options list under a top-level item.
 * Replicates CodePen OJLMgYY styling: Roboto Mono at 3.5vmin, text-shadow.
 */
export function MobileMenuSubmenu<T extends string>({
  options,
  selectedValue,
  onSelect,
  isVisible,
  dataTestId,
  className,
}: MobileMenuSubmenuProps<T>): ReturnType<FC> {
  const handleOptionClick = useCallback(
    (value: T) => {
      onSelect(value)
    },
    [onSelect]
  )

  const handleKeyDown = useCallback(
    (e: KeyboardEvent, value: T) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        onSelect(value)
      }
    },
    [onSelect]
  )

  /**
   * CONTRACTS §17: scroll focused item into view for keyboard navigation
   * Uses 'nearest' to avoid jarring jumps; 'auto' behavior when reduced motion preferred
   */
  const handleFocus = useCallback((e: FocusEvent<HTMLButtonElement>) => {
    const behavior = prefersReducedMotion() ? 'auto' : 'smooth'
    e.currentTarget.scrollIntoView({ block: 'nearest', behavior })
  }, [])

  const classNames = [styles.submenu, isVisible && styles.visible, className]
    .filter(Boolean)
    .join(' ')

  return (
    <ul className={classNames} role='menu' data-testid={dataTestId} aria-hidden={!isVisible}>
      {options.map(option => (
        <li key={option.value} className={styles.option} role='none'>
          <button
            type='button'
            role='menuitem'
            className={`${styles.optionButton} ${option.value === selectedValue ? styles.selected : ''}`}
            onClick={() => handleOptionClick(option.value)}
            onKeyDown={e => handleKeyDown(e, option.value)}
            onFocus={handleFocus}
            tabIndex={isVisible ? 0 : -1}
            aria-current={option.value === selectedValue ? 'true' : undefined}
            data-testid={dataTestId ? `${dataTestId}-option-${option.value}` : undefined}
          >
            {option.icon && <span className={styles.icon}>{option.icon}</span>}
            <span className={styles.label}>{option.label}</span>
          </button>
        </li>
      ))}
    </ul>
  )
}
