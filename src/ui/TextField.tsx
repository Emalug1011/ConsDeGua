import { useId, type InputHTMLAttributes } from 'react'
import styles from './TextField.module.css'
import { Icon } from './Icon'

interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> {
  label: string
  supportingText?: string
  /** Mensaje de error; reemplaza al texto de apoyo y marca el campo como inválido. */
  error?: string
  leadingIcon?: string
}

/** Campo delineado con etiqueta siempre visible. */
export function TextField({
  label,
  supportingText,
  error,
  leadingIcon,
  className,
  ...rest
}: TextFieldProps) {
  const id = useId()
  const supportId = `${id}-apoyo`
  const support = error ?? supportingText

  return (
    <div
      className={[styles.field, error ? styles.invalid : '', className].filter(Boolean).join(' ')}
    >
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>
      <div className={styles.control}>
        {leadingIcon && <Icon name={leadingIcon} />}
        <input
          id={id}
          className={styles.input}
          aria-invalid={error ? true : undefined}
          aria-describedby={support ? supportId : undefined}
          {...rest}
        />
      </div>
      {support && (
        <p id={supportId} className={styles.support}>
          {error && <Icon name="error" size="small" />}
          {support}
        </p>
      )}
    </div>
  )
}
