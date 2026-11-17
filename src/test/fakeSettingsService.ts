/**
 * Sustituto en memoria de `features/settings/service.ts` para las pruebas de
 * componentes. Las reglas reales se prueban en `tests/rules`.
 */
import { vi } from 'vitest'
import { DEFAULT_SETTINGS, type UserSettings } from '../features/settings/types'

let settings: UserSettings = DEFAULT_SETTINGS
const listeners = new Set<() => void>()

function emit(): void {
  listeners.forEach((listener) => listener())
}

export function resetSettings(next: Partial<UserSettings> = {}): void {
  settings = { ...DEFAULT_SETTINGS, ...next }
  emit()
}

export function subscribeToUserSettings(_uid: string, onChange: (value: UserSettings) => void) {
  const listener = () => onChange(settings)
  listeners.add(listener)
  listener()
  return () => listeners.delete(listener)
}

export const setRememberReading = vi.fn(async (_uid: string, enabled: boolean) => {
  settings = enabled
    ? { ...settings, rememberReading: true }
    : { rememberReading: false, lastArticleId: null, lastReadAt: null }
  emit()
})

export const saveLastArticle = vi.fn(async (_uid: string, articleId: string) => {
  settings = { ...settings, lastArticleId: articleId, lastReadAt: new Date() }
  emit()
})
