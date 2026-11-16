/**
 * Tema claro u oscuro. Sin preferencia guardada, sigue al sistema (lo resuelve
 * tokens.css con prefers-color-scheme); con preferencia, la fija en <html data-theme>.
 */
export type Theme = 'light' | 'dark'

const STORAGE_KEY = 'constgua:tema'
const DARK_QUERY = '(prefers-color-scheme: dark)'

export function readStoredTheme(): Theme | null {
  try {
    const value = localStorage.getItem(STORAGE_KEY)
    return value === 'light' || value === 'dark' ? value : null
  } catch {
    return null
  }
}

export function systemTheme(): Theme {
  return typeof window.matchMedia === 'function' && window.matchMedia(DARK_QUERY).matches
    ? 'dark'
    : 'light'
}

export function effectiveTheme(): Theme {
  return readStoredTheme() ?? systemTheme()
}

/** Aplica la preferencia guardada; se llama al arrancar, antes de pintar la app. */
export function applyStoredTheme(): void {
  const stored = readStoredTheme()
  if (stored) document.documentElement.dataset.theme = stored
  else delete document.documentElement.dataset.theme
}

export function saveTheme(theme: Theme): void {
  document.documentElement.dataset.theme = theme
  try {
    localStorage.setItem(STORAGE_KEY, theme)
  } catch {
    // Sin almacenamiento local el tema dura solo esta sesión.
  }
}

/** Avisa cuando cambia el tema del sistema. Devuelve la función para dejar de escuchar. */
export function onSystemThemeChange(listener: () => void): () => void {
  if (typeof window.matchMedia !== 'function') return () => undefined
  const query = window.matchMedia(DARK_QUERY)
  query.addEventListener('change', listener)
  return () => query.removeEventListener('change', listener)
}
