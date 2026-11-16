import type { HTMLAttributes, ReactNode } from 'react'
import styles from './Card.module.css'

export type CardVariant = 'elevated' | 'filled' | 'outlined'

interface CardProps extends HTMLAttributes<HTMLElement> {
  variant?: CardVariant
  /** Elemento HTML de la tarjeta; `section` o `article` cuando tiene encabezado propio. */
  as?: 'div' | 'section' | 'article' | 'aside'
  children: ReactNode
}

export function Card({
  variant = 'outlined',
  as: Element = 'div',
  className,
  children,
  ...rest
}: CardProps) {
  const classes = [styles.card, styles[variant], className].filter(Boolean).join(' ')
  return (
    <Element className={classes} {...rest}>
      {children}
    </Element>
  )
}
