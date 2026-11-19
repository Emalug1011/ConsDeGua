import { Link } from 'react-router'
import { APP_NAME, DEVELOPER } from '../config/app'
import { PRIVACY_PATH } from '../features/legal/paths'
import styles from './AppFooter.module.css'

/** Pie de página con los datos del desarrollador; aparece en todas las páginas. */
export function AppFooter() {
  return (
    <footer className={styles.footer}>
      <p>
        {APP_NAME} · Un proyecto de <span className={styles.brand}>{DEVELOPER.brand}</span>
      </p>
      <p>
        <a href={`mailto:${DEVELOPER.email}`} className={styles.link}>
          {DEVELOPER.email}
        </a>
      </p>
      <p>
        <Link to={PRIVACY_PATH} className={styles.link}>
          Privacidad
        </Link>
      </p>
      <p className={styles.version}>
        Versión {__APP_VERSION__} · {__BUILD_TIME__}
      </p>
    </footer>
  )
}
