import { useCallback, useSyncExternalStore } from 'react'
import { effectiveTheme, onSystemThemeChange, saveTheme, type Theme } from './theme'

const listeners = new Set<() => void>()

function subscribe(listener: () => void): () => void {
  listeners.add(listener)
  const stopSystem = onSystemThemeChange(listener)
  return () => {
    listeners.delete(listener)
    stopSystem()
  }
}

/** Tema vigente y función para alternarlo; la elección se recuerda en este navegador. */
export function useTheme(): { theme: Theme; toggleTheme: () => void } {
  const theme = useSyncExternalStore(subscribe, effectiveTheme, () => 'light' as Theme)

  const toggleTheme = useCallback(() => {
    saveTheme(effectiveTheme() === 'dark' ? 'light' : 'dark')
    listeners.forEach((listener) => listener())
  }, [])

  return { theme, toggleTheme }
}
