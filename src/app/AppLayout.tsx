import { Link, Outlet } from 'react-router'
import { APP_NAME } from '../config/app'
import { signOutUser } from '../features/auth/service'
import { Button } from '../ui/Button'
import styles from './AppLayout.module.css'

export function AppLayout() {
  return (
    <div className={styles.shell}>
      <a className={styles.skipLink} href="#contenido">
        Ir al contenido
      </a>
      <header className={styles.topBar}>
        <Link to="/" className={styles.appName}>
          {APP_NAME}
        </Link>
        <Button variant="text" icon="logout" onClick={() => void signOutUser()}>
          Cerrar sesión
        </Button>
      </header>
      <main id="contenido" className={styles.content} tabIndex={-1}>
        <Outlet />
      </main>
    </div>
  )
}
