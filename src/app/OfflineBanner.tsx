import { Icon } from '../ui/Icon'
import styles from './OfflineBanner.module.css'
import { useOnline } from './useOnline'

/** Aviso cuando no hay conexión: qué sigue funcionando y qué pasa con los cambios. */
export function OfflineBanner() {
  const online = useOnline()
  if (online) return null
  return (
    <p role="status" className={styles.banner}>
      <Icon name="cloud_off" size="small" />
      <span>
        Sin conexión. Puedes leer la Constitución; tus apuntes y relaciones se guardan en este
        dispositivo y se sincronizan al volver.
      </span>
    </p>
  )
}
