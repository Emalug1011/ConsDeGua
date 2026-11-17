import { useCallback, useSyncExternalStore } from 'react'
import { readThemePreference, saveThemePreference, type ThemePreference } from './theme'

const listeners = new Set<() => void>()

function subscribe(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

/** Preferencia de tema (sistema, claro u oscuro); se recuerda en este navegador. */
export function useTheme(): {
  preference: ThemePreference
  setPreference: (preference: ThemePreference) => void
} {
  const preference = useSyncExternalStore(
    subscribe,
    readThemePreference,
    () => 'system' as ThemePreference,
  )

  const setPreference = useCallback((next: ThemePreference) => {
    saveThemePreference(next)
    listeners.forEach((listener) => listener())
  }, [])

  return { preference, setPreference }
}
