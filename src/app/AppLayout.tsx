import { Link, Outlet } from 'react-router'
import { APP_NAME } from '../config/app'
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
      </header>
      <main id="contenido" className={styles.content} tabIndex={-1}>
        <Outlet />
      </main>
    </div>
  )
}
