import { useSyncExternalStore } from 'react'
import { canInstall, isInstalled, promptInstall, subscribeInstallPrompt } from './installPrompt'

/** Si se puede ofrecer instalar la app, y la acción para hacerlo. */
export function useInstallPrompt(): { available: boolean; install: () => Promise<boolean> } {
  const available = useSyncExternalStore(
    subscribeInstallPrompt,
    () => canInstall() && !isInstalled(),
    () => false,
  )
  return { available, install: promptInstall }
}
