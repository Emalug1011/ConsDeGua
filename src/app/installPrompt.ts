/**
 * Instalación de la PWA (Chrome en Android y escritorio). El navegador avisa
 * con `beforeinstallprompt` una sola vez y temprano, así que se captura al
 * arrancar la app y se guarda hasta que la persona pulse "Instalar".
 */
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

let deferred: BeforeInstallPromptEvent | null = null
const listeners = new Set<() => void>()

function notify(): void {
  listeners.forEach((listener) => listener())
}

/** Se llama una vez al arrancar, antes de pintar la app. */
export function captureInstallPrompt(): void {
  window.addEventListener('beforeinstallprompt', (event) => {
    // Evita la barra automática del navegador; se ofrece desde Ajustes.
    event.preventDefault()
    deferred = event as BeforeInstallPromptEvent
    notify()
  })
  window.addEventListener('appinstalled', () => {
    deferred = null
    notify()
  })
}

export function subscribeInstallPrompt(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function canInstall(): boolean {
  return deferred !== null
}

/** Si la app ya se abrió instalada (sin la interfaz del navegador). */
export function isInstalled(): boolean {
  return typeof window.matchMedia === 'function'
    ? window.matchMedia('(display-mode: standalone)').matches
    : false
}

/** Muestra el diálogo de instalación del navegador. Devuelve si la persona aceptó. */
export async function promptInstall(): Promise<boolean> {
  if (!deferred) return false
  const event = deferred
  deferred = null
  notify()
  await event.prompt()
  const choice = await event.userChoice
  return choice.outcome === 'accepted'
}
