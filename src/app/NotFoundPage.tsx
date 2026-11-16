import { Link } from 'react-router'
import styles from './RouteError.module.css'

export function NotFoundPage() {
  return (
    <div className={styles.page}>
      <h1 className="headline-small">No encontramos esta página</h1>
      <p className="body-large">Revisa la dirección o vuelve al índice de la Constitución.</p>
      <Link to="/" className="label-large">
        Ir al índice
      </Link>
    </div>
  )
}
