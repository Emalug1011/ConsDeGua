import { Link, isRouteErrorResponse, useRouteError } from 'react-router'
import { AppFooter } from './AppFooter'
import { NotFoundPage } from './NotFoundPage'
import styles from './RouteError.module.css'

/** Error inesperado al mostrar una ruta. */
export function RouteError() {
  const error = useRouteError()
  // Fuera del layout principal: este componente pone su propio pie de página.
  return (
    <div className={styles.shell}>
      {isRouteErrorResponse(error) && error.status === 404 ? (
        <NotFoundPage />
      ) : (
        <div className={styles.page} role="alert">
          <h1 className="headline-small">Algo salió mal</h1>
          <p className="body-large">No se pudo mostrar esta página. Recarga e intenta de nuevo.</p>
          <Link to="/" className="label-large">
            Ir al índice
          </Link>
        </div>
      )}
      <AppFooter />
    </div>
  )
}
