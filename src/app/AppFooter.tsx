import { APP_NAME, DEVELOPER } from '../config/app'
import styles from './AppFooter.module.css'

/** Pie de página con los datos del desarrollador; aparece en todas las páginas. */
export function AppFooter() {
  return (
    <footer className={styles.footer}>
      <p>
        {APP_NAME} · Desarrollado por <span className={styles.alias}>{DEVELOPER.alias}</span>
      </p>
      <p>
        <a href={`mailto:${DEVELOPER.email}`} className={styles.link}>
          {DEVELOPER.email}
        </a>
      </p>
      <p className={styles.version}>
        Versión {__APP_VERSION__} · {__BUILD_TIME__}
      </p>
    </footer>
  )
}
