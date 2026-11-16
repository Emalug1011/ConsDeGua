import { Link, Outlet, ScrollRestoration } from 'react-router'
import { APP_NAME } from '../config/app'
import { signOutUser } from '../features/auth/service'
import { Button } from '../ui/Button'
import styles from './AppLayout.module.css'
import { ThemeToggle } from './ThemeToggle'

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
        <div className={styles.actions}>
          <ThemeToggle />
          <Button variant="text" icon="logout" onClick={() => void signOutUser()}>
            Cerrar sesión
          </Button>
        </div>
      </header>
      <main id="contenido" className={styles.content} tabIndex={-1}>
        <Outlet />
      </main>
      {/* Al ir de un artículo a otro, la página empieza arriba. */}
      <ScrollRestoration />
    </div>
  )
}
