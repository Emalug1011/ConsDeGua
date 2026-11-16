import { Outlet } from 'react-router'
import { AppFooter } from './AppFooter'
import styles from './PublicLayout.module.css'

/** Marco de las páginas sin sesión (ingreso): contenido y pie de página. */
export function PublicLayout() {
  return (
    <div className={styles.shell}>
      <Outlet />
      <AppFooter />
    </div>
  )
}
