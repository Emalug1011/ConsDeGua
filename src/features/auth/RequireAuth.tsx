import { Navigate, Outlet, useLocation } from 'react-router'
import { LOGIN_PATH, type LoginRedirectState } from './paths'
import styles from './RequireAuth.module.css'
import { useAuth } from './useAuth'

/** Exige sesión para todas las rutas hijas. */
export function RequireAuth() {
  const { status } = useAuth()
  const location = useLocation()

  if (status === 'loading') {
    return (
      <p role="status" className={styles.loading}>
        Cargando…
      </p>
    )
  }

  if (status === 'signed_out') {
    const state: LoginRedirectState = { from: location.pathname + location.search }
    return <Navigate to={LOGIN_PATH} replace state={state} />
  }

  return <Outlet />
}
