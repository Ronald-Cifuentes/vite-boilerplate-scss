import type { ReactNode } from 'react'

export interface MobileMenuItemProps {
  /** Translation key for item label */
  labelKey: string
  /** Optional icon element */
  icon?: ReactNode
  /** Click handler for immediate action (e.g., theme cycle) */
  onClick?: () => void
  /** Whether item expands a submenu */
  hasSubmenu?: boolean
  /** If hasSubmenu, whether the submenu is currently expanded */
  isExpanded?: boolean
  /** Handler to toggle submenu expansion */
  onToggleSubmenu?: () => void
  /** Children (submenu content) */
  children?: ReactNode
  /** Data test id */
  dataTestId?: string
  /** Additional class name */
  className?: string
  /** Index for stagger animation */
  index?: number
  /** Whether this item is being hovered (for sibling effects) */
  isHovered?: boolean
  /** Whether any sibling is hovered (for dim effect) */
  siblingHovered?: boolean
}
