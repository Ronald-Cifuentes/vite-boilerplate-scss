import type { ButtonHTMLAttributes } from 'react'
import type { IconType } from 'react-icons'

export interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  icon: IconType
  'aria-label': string // Required for accessibility
  size?: 'sm' | 'md' | 'lg'
  variant?: 'primary' | 'secondary' | 'ghost'
  dataTestId?: string
}
