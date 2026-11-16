import { Link, Outlet, ScrollRestoration } from 'react-router'
import { APP_NAME } from '../config/app'
import { signOutUser } from '../features/auth/service'
import { AppLogo } from '../ui/AppLogo'
import { IconButton } from '../ui/IconButton'
import { AppFooter } from './AppFooter'
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
          <AppLogo />
          {APP_NAME}
        </Link>
        <div className={styles.actions}>
          <Link to="/apuntes" className={styles.navLink}>
            Mis apuntes
          </Link>
          <ThemeToggle />
          <IconButton icon="logout" label="Cerrar sesión" onClick={() => void signOutUser()} />
        </div>
      </header>
      <main id="contenido" className={styles.content} tabIndex={-1}>
        <Outlet />
      </main>
      <AppFooter />
      {/* Al ir de un artículo a otro, la página empieza arriba. */}
      <ScrollRestoration />
    </div>
  )
}
