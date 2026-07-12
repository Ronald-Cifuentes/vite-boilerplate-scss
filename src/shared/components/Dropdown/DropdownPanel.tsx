import { FC, useEffect, useRef } from 'react'
import type { DropdownPanelProps } from './interfaces'
import styles from './Dropdown.module.scss'

export const DropdownPanel: FC<DropdownPanelProps> = ({
  id,
  'aria-labelledby': ariaLabelledby,
  children,
  isOpen,
  isClosing = false,
  onCloseAnimationEnd,
  flipVertical = false,
  flipHorizontal = false,
  panelRef,
  dataTestId,
}) => {
  const fallbackRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const showPanel = isOpen || isClosing

  useEffect(() => {
    if (!isClosing || !onCloseAnimationEnd) return undefined
    // Fallback timeout in case animationend doesn't fire (e.g., reduced-motion)
    fallbackRef.current = setTimeout(onCloseAnimationEnd, 200)
    return (): void => {
      clearTimeout(fallbackRef.current!)
    }
  }, [isClosing, onCloseAnimationEnd])

  const handleAnimationEnd = (): void => {
    if (isClosing && onCloseAnimationEnd) {
      clearTimeout(fallbackRef.current!)
      onCloseAnimationEnd()
    }
  }

  const panelClasses = [
    styles.panel,
    showPanel ? styles['panel--open'] : '',
    isClosing ? styles['panel--closing'] : '',
    flipVertical ? styles['panel--flip-vertical'] : '',
    flipHorizontal ? styles['panel--flip-horizontal'] : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div
      ref={panelRef}
      id={id}
      role='listbox'
      aria-labelledby={ariaLabelledby}
      aria-hidden={!isOpen}
      className={panelClasses}
      tabIndex={-1}
      data-testid={dataTestId}
      onAnimationEnd={handleAnimationEnd}
    >
      {children}
    </div>
  )
}
