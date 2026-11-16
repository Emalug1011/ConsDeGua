import { useEffect, useId, useRef, type ReactNode } from 'react'
import { Button } from './Button'
import styles from './Dialog.module.css'

interface DialogProps {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  /** Texto del botón que cierra el diálogo. */
  closeLabel?: string
  /** Acciones adicionales, antes del botón de cerrar. */
  actions?: ReactNode
}

/** Diálogo modal sobre <dialog>: atrapa el foco, se cierra con Esc y devuelve el foco al cerrar. */
export function Dialog({
  open,
  onClose,
  title,
  children,
  closeLabel = 'Cerrar',
  actions,
}: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null)
  const titleId = useId()

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog
      ref={ref}
      className={styles.dialog}
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={(event) => {
        // Clic en el fondo (fuera del contenido) cierra el diálogo.
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div className={styles.content}>
        <h2 id={titleId} className={styles.title}>
          {title}
        </h2>
        <div className={styles.body}>{children}</div>
        <div className={styles.actions}>
          {actions}
          <Button variant="text" onClick={onClose}>
            {closeLabel}
          </Button>
        </div>
      </div>
    </dialog>
  )
}
