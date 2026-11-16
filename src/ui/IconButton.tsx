import type { ButtonHTMLAttributes } from 'react'
import styles from './IconButton.module.css'
import { Icon } from './Icon'

interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  icon: string
  /** Nombre accesible: obligatorio porque el botón no tiene texto visible. */
  label: string
}

/** Botón de icono estándar de Material 3. */
export function IconButton({ icon, label, className, type = 'button', ...rest }: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      className={[styles.button, className].filter(Boolean).join(' ')}
      {...rest}
    >
      <Icon name={icon} />
    </button>
  )
}
