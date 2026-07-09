import { FC } from 'react'
import type { DropdownTriggerProps } from './interfaces'
import styles from './Dropdown.module.scss'

export const DropdownTrigger: FC<DropdownTriggerProps> = ({
  icon: Icon,
  'aria-label': ariaLabel,
  'aria-expanded': ariaExpanded,
  'aria-controls': ariaControls,
  id,
  onClick,
  onKeyDown,
  buttonRef,
  dataTestId,
}) => {
  return (
    <button
      ref={buttonRef}
      type='button'
      id={id}
      className={styles.trigger}
      aria-label={ariaLabel}
      aria-haspopup='listbox'
      aria-expanded={ariaExpanded}
      aria-controls={ariaControls}
      onClick={onClick}
      onKeyDown={onKeyDown}
      data-testid={dataTestId}
      title={ariaLabel}
    >
      <Icon aria-hidden='true' className={styles.triggerIcon} />
    </button>
  )
}
