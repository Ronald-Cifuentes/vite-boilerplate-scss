import { FC } from 'react'
import type { DropdownPanelProps } from './interfaces'
import styles from './Dropdown.module.scss'

export const DropdownPanel: FC<DropdownPanelProps> = ({
  id,
  'aria-labelledby': ariaLabelledby,
  children,
  isOpen,
  dataTestId,
}) => {
  const panelClasses = [styles.panel, isOpen ? styles['panel--open'] : ''].filter(Boolean).join(' ')

  return (
    <div
      id={id}
      role='listbox'
      aria-labelledby={ariaLabelledby}
      aria-hidden={!isOpen}
      className={panelClasses}
      tabIndex={-1}
      data-testid={dataTestId}
    >
      {children}
    </div>
  )
}
