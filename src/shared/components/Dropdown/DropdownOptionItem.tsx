import { FC, useCallback } from 'react'
import type { DropdownOptionProps } from './interfaces'
import styles from './Dropdown.module.scss'

export const DropdownOptionItem: FC<DropdownOptionProps> = ({
  option,
  isSelected,
  isFocused,
  onClick,
  onKeyDown,
  id,
  tabIndex,
  setRef,
  dataTestId,
}) => {
  const Icon = option.icon

  const optionClasses = [
    styles.option,
    isSelected ? styles['option--selected'] : '',
    isFocused ? styles['option--focused'] : '',
  ]
    .filter(Boolean)
    .join(' ')

  const refCallback = useCallback(
    (el: HTMLDivElement | null): void => {
      if (setRef) {
        setRef(el)
      }
    },
    [setRef]
  )

  return (
    <div
      ref={refCallback}
      role='option'
      id={id}
      aria-selected={isSelected}
      tabIndex={tabIndex}
      className={optionClasses}
      onClick={onClick}
      onKeyDown={onKeyDown}
      data-testid={dataTestId}
    >
      <Icon aria-hidden='true' className={styles.optionIcon} />
      <span className={styles.optionLabel}>{option.label}</span>
    </div>
  )
}
