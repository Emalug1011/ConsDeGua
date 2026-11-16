import { Link, isRouteErrorResponse, useRouteError } from 'react-router'
import { NotFoundPage } from './NotFoundPage'
import styles from './RouteError.module.css'

/** Error inesperado al mostrar una ruta. */
export function RouteError() {
  const error = useRouteError()
  if (isRouteErrorResponse(error) && error.status === 404) return <NotFoundPage />

  return (
    <div className={styles.page} role="alert">
      <h1 className="headline-small">Algo salió mal</h1>
      <p className="body-large">No se pudo mostrar esta página. Recarga e intenta de nuevo.</p>
      <Link to="/" className="label-large">
        Ir al índice
      </Link>
    </div>
  )
}
