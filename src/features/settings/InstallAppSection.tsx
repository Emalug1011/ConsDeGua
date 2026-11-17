import { useInstallPrompt } from '../../app/useInstallPrompt'
import { Button } from '../../ui/Button'
import { track } from '../metrics/track'
import styles from './SettingsPage.module.css'

/** Ofrece instalar ConstGua como app, solo donde el navegador lo permite (Android, Chrome). */
export function InstallAppSection() {
  const { available, install } = useInstallPrompt()
  if (!available) return null

  return (
    <section aria-labelledby="ajustes-instalar" className={styles.section}>
      <h2 id="ajustes-instalar" className="title-medium">
        Instalar la app
      </h2>
      <p className={styles.muted}>
        Agrega ConstGua a tu pantalla de inicio. Se abre como una app y puedes leer la Constitución
        sin internet.
      </p>
      <div>
        <Button
          variant="tonal"
          icon="install_mobile"
          onClick={() =>
            void install().then((accepted) => {
              if (accepted) track('app_install')
            })
          }
        >
          Instalar
        </Button>
      </div>
    </section>
  )
}
