import { Link, Outlet, ScrollRestoration } from 'react-router'
import { APP_NAME } from '../config/app'
import { SettingsProvider } from '../features/settings/SettingsProvider'
import { AppLogo } from '../ui/AppLogo'
import { AccountMenu } from './AccountMenu'
import { AppFooter } from './AppFooter'
import styles from './AppLayout.module.css'

export function AppLayout() {
  return (
    <SettingsProvider>
      <div className={styles.shell}>
        <a className={styles.skipLink} href="#contenido">
          Ir al contenido
        </a>
        <header className={styles.topBar}>
          <Link to="/" className={styles.appName}>
            <AppLogo />
            {APP_NAME}
          </Link>
          <AccountMenu />
        </header>
        <main id="contenido" className={styles.content} tabIndex={-1}>
          <Outlet />
        </main>
        <AppFooter />
        {/* Al ir de un artículo a otro, la página empieza arriba. */}
        <ScrollRestoration />
      </div>
    </SettingsProvider>
  )
}
