import { forwardRef } from 'react'
import type { IconButtonProps } from './interfaces'
import styles from './IconButton.module.scss'

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      icon: Icon,
      variant = 'ghost',
      size = 'md',
      dataTestId,
      className,
      'aria-label': ariaLabel,
      ...props
    },
    ref
  ) => {
    const classNames = [
      styles.iconButton,
      styles[`iconButton--${variant}`],
      styles[`iconButton--${size}`],
      className,
    ]
      .filter(Boolean)
      .join(' ')

    return (
      <button
        ref={ref}
        type='button'
        className={classNames}
        data-testid={dataTestId}
        aria-label={ariaLabel}
        title={ariaLabel}
        {...props}
      >
        <Icon aria-hidden='true' />
      </button>
    )
  }
)

IconButton.displayName = 'IconButton'

export default IconButton
