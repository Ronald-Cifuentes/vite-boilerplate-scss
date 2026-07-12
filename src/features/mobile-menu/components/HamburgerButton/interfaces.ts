import type { RefObject } from 'react'

export interface HamburgerButtonProps {
  isOpen: boolean
  onClick: () => void
  buttonRef?: RefObject<HTMLButtonElement | null>
  dataTestId?: string
  className?: string
}
