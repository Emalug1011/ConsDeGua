import { useId } from 'react'
import styles from './Switch.module.css'

interface SwitchProps {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
  supportingText?: string
  disabled?: boolean
}

/** Interruptor de Material 3 con su etiqueta visible; toda la fila es la zona táctil. */
export function Switch({ label, checked, onChange, supportingText, disabled }: SwitchProps) {
  const id = useId()
  return (
    <div className={styles.row}>
      <div className={styles.text}>
        <label htmlFor={id} className={styles.label}>
          {label}
        </label>
        {supportingText && (
          <p id={`${id}-apoyo`} className={styles.support}>
            {supportingText}
          </p>
        )}
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-describedby={supportingText ? `${id}-apoyo` : undefined}
        disabled={disabled}
        className={`${styles.switch} ${checked ? styles.on : ''}`}
        onClick={() => onChange(!checked)}
      >
        <span className={styles.thumb} aria-hidden="true" />
      </button>
    </div>
  )
}
