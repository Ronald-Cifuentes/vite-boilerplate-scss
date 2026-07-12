import { forwardRef } from 'react'
import type { LinkProps } from './interfaces'
import styles from './Link.module.scss'

export const Link = forwardRef<HTMLAnchorElement, LinkProps>(
  ({ variant = 'default', external = false, dataTestId, className, children, ...props }, ref) => {
    const classNames = [styles.link, styles[`link--${variant}`], className]
      .filter(Boolean)
      .join(' ')

    const externalProps = external
      ? {
          target: '_blank',
          rel: 'noopener noreferrer',
        }
      : {}

    return (
      <a ref={ref} className={classNames} data-testid={dataTestId} {...externalProps} {...props}>
        {children}
      </a>
    )
  }
)

Link.displayName = 'Link'
