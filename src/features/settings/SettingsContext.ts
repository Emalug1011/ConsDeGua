import { createContext } from 'react'
import type { UserSettings } from './types'

export type SettingsState =
  { status: 'loading' } | { status: 'ready'; settings: UserSettings } | { status: 'error' }

export const SettingsContext = createContext<SettingsState | null>(null)
