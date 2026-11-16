import type { ButtonHTMLAttributes, ReactNode } from 'react'
import styles from './Button.module.css'
import { Icon } from './Icon'

export type ButtonVariant = 'filled' | 'tonal' | 'outlined' | 'text'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** `filled` es la acción primaria: una sola por vista. */
  variant?: ButtonVariant
  icon?: string
  children: ReactNode
}

export function Button({
  variant = 'filled',
  icon,
  className,
  type = 'button',
  children,
  ...rest
}: ButtonProps) {
  const classes = [styles.button, styles[variant], icon ? styles.withIcon : '', className]
    .filter(Boolean)
    .join(' ')
  return (
    <button type={type} className={classes} {...rest}>
      {icon && <Icon name={icon} size="small" />}
      <span>{children}</span>
    </button>
  )
}
