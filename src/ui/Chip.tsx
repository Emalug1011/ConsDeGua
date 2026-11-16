import styles from './Chip.module.css'
import { Icon } from './Icon'

interface ChipProps {
  label: string
  icon?: string
  /** Si se pasa, el chip es un botón (chip de filtro o de acción). */
  onClick?: () => void
  /** Estado de un chip de filtro. */
  selected?: boolean
}

export function Chip({ label, icon, onClick, selected }: ChipProps) {
  const classes = [styles.chip, selected ? styles.selected : ''].filter(Boolean).join(' ')
  const leadingIcon = selected ? 'check' : icon

  if (!onClick) {
    return (
      <span className={classes}>
        {leadingIcon && <Icon name={leadingIcon} size="small" />}
        {label}
      </span>
    )
  }

  return (
    <button
      type="button"
      className={`${classes} ${styles.interactive}`}
      onClick={onClick}
      aria-pressed={selected}
    >
      {leadingIcon && <Icon name={leadingIcon} size="small" />}
      {label}
    </button>
  )
}
