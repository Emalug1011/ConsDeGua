import styles from './Icon.module.css'

interface IconProps {
  /** Nombre del símbolo de Material Symbols Outlined, por ejemplo "search". */
  name: string
  size?: 'default' | 'small'
}

/** Icono decorativo: siempre acompaña a un texto o a un nombre accesible. */
export function Icon({ name, size = 'default' }: IconProps) {
  return (
    <span className={`${styles.icon} ${size === 'small' ? styles.small : ''}`} aria-hidden="true">
      {name}
    </span>
  )
}
