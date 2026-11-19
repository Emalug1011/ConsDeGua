import { Link } from 'react-router'
import { APP_NAME, DEVELOPER } from '../../config/app'
import { AppLogo } from '../../ui/AppLogo'
import styles from './LegalPage.module.css'
import { PRIVACY_PATH } from './paths'

/**
 * Cómo eliminar la cuenta y los datos. Es pública: Google Play exige una URL
 * para pedirlo aunque la persona ya no tenga la app.
 */
export function DeleteAccountInfoPage() {
  const subject = encodeURIComponent(`Eliminar mi cuenta de ${APP_NAME}`)
  return (
    <main className={styles.page}>
      <Link to="/" className={styles.header}>
        <AppLogo />
        {APP_NAME}
      </Link>
      <div className={styles.content}>
        <h1 className="headline-medium">Eliminar tu cuenta de {APP_NAME}</h1>
        <p>
          Puedes eliminar tu cuenta de {APP_NAME}, de {DEVELOPER.brand}, y todos los datos que
          guardaste cuando quieras.
        </p>

        <h2 className="title-large">Desde la app</h2>
        <ol>
          <li>Ingresa a {APP_NAME} con tu cuenta de Google.</li>
          <li>Toca tu foto, arriba a la derecha, y elige Ajustes.</li>
          <li>En Tu cuenta, toca Eliminar cuenta y confirma.</li>
          <li>Google te pedirá que ingreses de nuevo para confirmar que eres tú.</li>
        </ol>
        <p>Se borra en ese momento. Necesitas conexión a internet.</p>

        <h2 className="title-large">Por correo</h2>
        <p>
          Si ya no puedes entrar a la app, escribe a{' '}
          <a href={`mailto:${DEVELOPER.email}?subject=${subject}`}>{DEVELOPER.email}</a> desde el
          correo de la cuenta de Google que usaste, con el asunto{' '}
          <span className={styles.term}>Eliminar mi cuenta de {APP_NAME}</span>. Tu cuenta y tus
          datos se borran en un plazo máximo de 30 días y te avisamos al terminar.
        </p>

        <h2 className="title-large">Qué se borra</h2>
        <ul>
          <li>Tu perfil: nombre, correo y foto de tu cuenta de Google.</li>
          <li>Tus apuntes.</li>
          <li>Tus relaciones propias entre artículos.</li>
          <li>Tus ajustes, como el último artículo que leíste.</li>
          <li>Tu acceso a {APP_NAME} con esa cuenta.</li>
        </ul>

        <h2 className="title-large">Qué se conserva</h2>
        <ul>
          <li>
            El registro de uso diario, solo como conteo de personas por día, sin tu nombre ni tu
            correo.
          </li>
          <li>
            Las estadísticas de Google Analytics, que no te identifican directamente, por el plazo
            que Google Analytics tenga configurado.
          </li>
        </ul>
        <p>
          Más detalles en la <Link to={PRIVACY_PATH}>política de privacidad</Link>.
        </p>
      </div>
    </main>
  )
}
