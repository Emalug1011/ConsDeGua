import { Icon } from '../../ui/Icon'
import styles from './TextReviewNotice.module.css'

/** Aviso mientras el texto extraído del PDF no se haya cotejado completo. */
export function TextReviewNotice() {
  return (
    <aside className={styles.notice} aria-label="Aviso sobre el texto">
      <Icon name="info" />
      <p>
        Texto en revisión: se extrajo automáticamente del PDF y puede tener errores de formato.
        Cotéjalo con la fuente oficial antes de citarlo.
      </p>
    </aside>
  )
}
