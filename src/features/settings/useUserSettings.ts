import { use } from 'react'
import { SettingsContext, type SettingsState } from './SettingsContext'

export function useUserSettings(): SettingsState {
  const state = use(SettingsContext)
  if (!state) throw new Error('useUserSettings debe usarse dentro de <SettingsProvider>.')
  return state
}
