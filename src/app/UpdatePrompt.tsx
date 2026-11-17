import { useRegisterSW } from 'virtual:pwa-register/react'
import { Button } from '../ui/Button'
import { IconButton } from '../ui/IconButton'
import styles from './UpdatePrompt.module.css'

/** Cada cuánto se revisa si hay una versión nueva publicada. */
const CHECK_EVERY_MS = 60 * 60 * 1000

/**
 * Registra el service worker y, cuando hay una versión nueva, la ofrece con
 * el botón Actualizar. No recarga sola para no interrumpir a quien escribe.
 */
export function UpdatePrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_url, registration) {
      if (registration) setInterval(() => void registration.update(), CHECK_EVERY_MS)
    },
  })

  if (!needRefresh) return null

  return (
    <div role="status" className={styles.snackbar}>
      <span>Hay una versión nueva de ConstGua.</span>
      <Button variant="text" icon="refresh" onClick={() => void updateServiceWorker(true)}>
        Actualizar
      </Button>
      <IconButton icon="close" label="Cerrar aviso" onClick={() => setNeedRefresh(false)} />
    </div>
  )
}
