/**
 * Con la caché local de Firestore, una escritura sin internet queda pendiente
 * hasta volver a conectarse: su promesa no se resuelve. Esta función espera la
 * confirmación del servidor, pero si no hay conexión responde `local` (ya está
 * guardada en el dispositivo y Firestore la sincroniza solo al volver).
 */
export type SaveResult = 'saved' | 'local'

const WAIT_MS = 1500

export function whenSaved(write: Promise<unknown>, waitMs = WAIT_MS): Promise<SaveResult> {
  return new Promise<SaveResult>((resolve, reject) => {
    let settled = false
    const finish = (action: () => void) => {
      if (settled) return
      settled = true
      clearTimeout(timer)
      window.removeEventListener('offline', onOffline)
      action()
    }
    const onOffline = () => finish(() => resolve('local'))
    const timer = setTimeout(() => {
      if (!navigator.onLine) onOffline()
    }, waitMs)
    window.addEventListener('offline', onOffline)
    write.then(
      () => finish(() => resolve('saved')),
      (error: unknown) => finish(() => reject(error)),
    )
  })
}
