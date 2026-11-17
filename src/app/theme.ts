/**
 * Tema claro u oscuro. Con "sistema" no se guarda nada y tokens.css sigue a
 * prefers-color-scheme; con claro u oscuro se fija en <html data-theme>.
 */
export type Theme = 'light' | 'dark'
export type ThemePreference = Theme | 'system'

const STORAGE_KEY = 'constgua:tema'

export function readStoredTheme(): Theme | null {
  try {
    const value = localStorage.getItem(STORAGE_KEY)
    return value === 'light' || value === 'dark' ? value : null
  } catch {
    return null
  }
}

export function readThemePreference(): ThemePreference {
  return readStoredTheme() ?? 'system'
}

/** Aplica la preferencia guardada; se llama al arrancar, antes de pintar la app. */
export function applyStoredTheme(): void {
  const stored = readStoredTheme()
  if (stored) document.documentElement.dataset.theme = stored
  else delete document.documentElement.dataset.theme
}

export function saveThemePreference(preference: ThemePreference): void {
  try {
    if (preference === 'system') localStorage.removeItem(STORAGE_KEY)
    else localStorage.setItem(STORAGE_KEY, preference)
  } catch {
    // Sin almacenamiento local la preferencia dura solo esta sesión.
  }
  if (preference === 'system') delete document.documentElement.dataset.theme
  else document.documentElement.dataset.theme = preference
}
