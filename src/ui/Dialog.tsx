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
  /** `large` para contenido ancho, como un mapa. */
  size?: 'default' | 'large'
  /** Si cambia, el cuerpo vuelve arriba (por ejemplo, al pasar a otra vista). */
  contentKey?: string
}

/** Diálogo modal sobre <dialog>: atrapa el foco, se cierra con Esc y devuelve el foco al cerrar. */
export function Dialog({
  open,
  onClose,
  title,
  children,
  closeLabel = 'Cerrar',
  actions,
  size = 'default',
  contentKey,
}: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null)
  const body = useRef<HTMLDivElement>(null)
  const titleId = useId()
  // Si el toque empezó en el fondo del diálogo. En iPhone, el mismo toque que
  // abre el diálogo puede generar un clic que cae sobre el fondo recién abierto.
  const pressedOnBackdrop = useRef(false)

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  useEffect(() => {
    if (body.current) body.current.scrollTop = 0
  }, [contentKey])

  return (
    <dialog
      ref={ref}
      className={`${styles.dialog} ${size === 'large' ? styles.large : ''}`}
      aria-labelledby={titleId}
      onClose={onClose}
      onPointerDown={(event) => {
        pressedOnBackdrop.current = event.target === event.currentTarget
      }}
      onClick={(event) => {
        // Cierra solo si el toque empezó y terminó en el fondo (fuera del contenido).
        const onBackdrop = pressedOnBackdrop.current && event.target === event.currentTarget
        pressedOnBackdrop.current = false
        if (onBackdrop) onClose()
      }}
    >
      <div className={styles.content}>
        <h2 id={titleId} className={styles.title}>
          {title}
        </h2>
        <div ref={body} className={styles.body}>
          {children}
        </div>
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
