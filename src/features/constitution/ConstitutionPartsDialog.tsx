import { Link } from 'react-router'
import { Dialog } from '../../ui/Dialog'
import { Icon } from '../../ui/Icon'
import styles from './ConstitutionPartsDialog.module.css'
import { getConstitutionParts, getTransitionalTitle } from './constitutionParts'

interface ConstitutionPartsDialogProps {
  open: boolean
  onClose: () => void
}

/** Explica la división de la Constitución en parte dogmática, orgánica y práctica. */
export function ConstitutionPartsDialog({ open, onClose }: ConstitutionPartsDialogProps) {
  const parts = getConstitutionParts()
  const transitional = getTransitionalTitle()

  return (
    <Dialog open={open} onClose={onClose} title="Las tres partes de la Constitución">
      <p className={styles.note}>
        <Icon name="school" size="small" />
        <span>
          Nota de estudio: esta división es doctrinal; la Constitución no la establece en su texto.
        </span>
      </p>

      <ol className={styles.parts}>
        {parts.map((part) => (
          <li key={part.id} className={styles.part}>
            <h3 className={styles.partName}>{part.nombre}</h3>
            <p className={styles.range}>
              Artículos {part.primero.id} a {part.ultimo.id} · {part.total} artículos
            </p>
            <p className={styles.description}>{part.descripcion}</p>
            <ul className={styles.titles}>
              {part.titulos.map((title) => (
                <li key={title.numero}>
                  <span className={styles.titleNumber}>Título {title.numero}.</span> {title.nombre}
                </li>
              ))}
            </ul>
            <Link to={`/articulo/${part.primero.id}`} className={styles.link} onClick={onClose}>
              Ir al artículo {part.primero.id}
            </Link>
          </li>
        ))}
      </ol>

      <p className={styles.transitional}>
        Además, el Título {transitional.titulo.numero}, {transitional.titulo.nombre}, reúne{' '}
        {transitional.total} disposiciones que regulan el paso al nuevo orden constitucional.
      </p>
    </Dialog>
  )
}
