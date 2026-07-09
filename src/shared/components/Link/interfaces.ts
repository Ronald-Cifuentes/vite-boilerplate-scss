import type { AnchorHTMLAttributes } from 'react'

export interface LinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  variant?: 'default' | 'nav' | 'subtle'
  external?: boolean
  dataTestId?: string
}
