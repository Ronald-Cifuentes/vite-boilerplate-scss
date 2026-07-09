import { forwardRef } from 'react'
import type { ButtonProps } from './interfaces'
import styles from './Button.module.scss'

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', dataTestId, className, children, ...props }, ref) => {
    const classNames = [
      styles.button,
      styles[`button--${variant}`],
      styles[`button--${size}`],
      className,
    ]
      .filter(Boolean)
      .join(' ')

    return (
      <button ref={ref} className={classNames} data-testid={dataTestId} {...props}>
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'

export default Button
