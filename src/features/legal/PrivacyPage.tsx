import { Link } from 'react-router'
import { APP_NAME, DEVELOPER } from '../../config/app'
import { AppLogo } from '../../ui/AppLogo'
import styles from './LegalPage.module.css'
import { DELETE_ACCOUNT_INFO_PATH, PRIVACY_UPDATED } from './paths'

/** Política de privacidad. Es pública: Google Play exige que se pueda leer sin cuenta. */
export function PrivacyPage() {
  return (
    <main className={styles.page}>
      <Link to="/" className={styles.header}>
        <AppLogo />
        {APP_NAME}
      </Link>
      <div className={styles.content}>
        <h1 className="headline-medium">Política de privacidad</h1>
        <p className={styles.muted}>Última actualización: {PRIVACY_UPDATED}</p>
        <p>
          {APP_NAME} es una app gratuita para estudiar la Constitución Política de la República de
          Guatemala, en la web y en Android. Es un proyecto de {DEVELOPER.brand}. Esta política
          explica qué datos guarda, para qué y cómo puedes borrarlos.
        </p>

        <h2 className="title-large">Qué datos guarda</h2>
        <ul>
          <li>
            <span className={styles.term}>Datos de tu cuenta de Google:</span> tu nombre, tu correo
            y tu foto de perfil. Se usan solo para ingresar y para mostrarte tu cuenta. {APP_NAME}{' '}
            nunca recibe tu contraseña.
          </li>
          <li>
            <span className={styles.term}>Lo que tú guardas:</span> tus apuntes, tus relaciones
            propias entre artículos y tus ajustes, como recordar el último artículo que leíste.
          </li>
          <li>
            <span className={styles.term}>Registro de uso diario:</span> la hora de tu primer
            ingreso de cada día, para contar cuántas personas usan la app.
          </li>
          <li>
            <span className={styles.term}>Estadísticas de uso:</span> con Google Analytics se
            registra qué funciones usas y qué artículos abres, por su número. Analytics también
            recibe datos técnicos, como el tipo de dispositivo y el país aproximado. Estas
            estadísticas no llevan el contenido de tus apuntes, tus búsquedas, tu nombre ni tu
            correo.
          </li>
          <li>
            <span className={styles.term}>En tu dispositivo:</span> una copia de tus datos para usar
            la app sin internet y tu preferencia de tema. Se borra al cerrar sesión.
          </li>
        </ul>

        <h2 className="title-large">Para qué se usan</h2>
        <p>
          Para que ingreses, para guardar y sincronizar lo que creas entre tus dispositivos, y para
          entender cuánto y cómo se usa la app y mejorarla. No se venden tus datos, no se usan para
          publicidad y no se comparten con nadie más.
        </p>

        <h2 className="title-large">Quién los procesa</h2>
        <p>
          Los datos se guardan en Firebase, un servicio de Google (Authentication, Cloud Firestore,
          Hosting y Analytics), que puede alojarlos en servidores fuera de Guatemala. Google los
          trata según su propia política de privacidad.
        </p>

        <h2 className="title-large">Quién puede verlos</h2>
        <p>
          Tus apuntes, relaciones y ajustes son privados: solo tú puedes verlos desde tu cuenta. La
          conexión con los servidores es cifrada.
        </p>

        <h2 className="title-large">Cuánto tiempo se guardan</h2>
        <p>
          Mientras tengas tu cuenta. Si la eliminas, se borran tu perfil, tus apuntes, tus
          relaciones y tus ajustes. Los registros de uso diario se conservan solo como conteo, sin
          tu nombre ni tu correo. Google Analytics conserva sus estadísticas por el plazo que tenga
          configurado, sin datos que te identifiquen directamente.
        </p>

        <h2 className="title-large">Cómo borrar tu cuenta y tus datos</h2>
        <p>
          Puedes eliminar tu cuenta desde la app o pedirlo por correo.{' '}
          <Link to={DELETE_ACCOUNT_INFO_PATH}>Ve los pasos para eliminar tu cuenta</Link>.
        </p>

        <h2 className="title-large">Menores de edad</h2>
        <p>
          {APP_NAME} está pensada para estudiantes de Derecho y no está dirigida a menores de 13
          años.
        </p>

        <h2 className="title-large">Cambios y contacto</h2>
        <p>
          Si esta política cambia, se actualiza esta página y su fecha. Para cualquier pregunta
          sobre tus datos, escribe a <a href={`mailto:${DEVELOPER.email}`}>{DEVELOPER.email}</a>.
        </p>
      </div>
    </main>
  )
}
