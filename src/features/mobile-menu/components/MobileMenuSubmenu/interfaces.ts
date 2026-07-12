import type { ReactNode } from 'react'

export interface SubmenuOption<T extends string = string> {
  value: T
  label: string
  icon?: ReactNode
}

export interface MobileMenuSubmenuProps<T extends string = string> {
  options: readonly SubmenuOption<T>[]
  selectedValue: T
  onSelect: (value: T) => void
  isVisible: boolean
  dataTestId?: string
  className?: string
}
