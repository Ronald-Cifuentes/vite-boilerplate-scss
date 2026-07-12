import type { RefObject } from 'react'

export interface MobileMenuProps {
  isOpen: boolean
  onClose: () => void
  hamburgerRef: RefObject<HTMLButtonElement | null>
  dataTestId?: string
  className?: string
}
