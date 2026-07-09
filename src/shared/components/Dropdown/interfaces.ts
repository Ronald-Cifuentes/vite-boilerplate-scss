import type { IconType } from 'react-icons'
import type { ReactNode, RefObject, KeyboardEvent } from 'react'

/** Shape of each option in a dropdown */
export interface DropdownOption<T extends string = string> {
  value: T
  label: string
  icon: IconType
}

/** Props for the Dropdown container */
export interface DropdownProps<T extends string = string> {
  options: readonly DropdownOption<T>[]
  value: T
  onChange: (value: T) => void
  triggerIcon: IconType
  triggerLabel: string
  id: string
  dataTestId?: string
  className?: string
}

/** Props for DropdownTrigger (internal) */
export interface DropdownTriggerProps {
  icon: IconType
  'aria-label': string
  'aria-expanded': boolean
  'aria-controls': string
  id: string
  onClick: () => void
  onKeyDown: (e: KeyboardEvent) => void
  buttonRef: RefObject<HTMLButtonElement | null>
  dataTestId?: string
}

/** Props for DropdownPanel (internal) */
export interface DropdownPanelProps {
  id: string
  'aria-labelledby': string
  children: ReactNode
  isOpen: boolean
  dataTestId?: string
}

/** Props for DropdownOption (internal) */
export interface DropdownOptionProps<T extends string = string> {
  option: DropdownOption<T>
  isSelected: boolean
  isFocused: boolean
  onClick: () => void
  onKeyDown: (e: KeyboardEvent) => void
  id: string
  tabIndex: number
  optionRef?: RefObject<HTMLDivElement | null>
  setRef?: (el: HTMLDivElement | null) => void
  dataTestId?: string
}
