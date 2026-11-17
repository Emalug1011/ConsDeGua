import { useEffect, useState, type ReactNode } from 'react'
import { useAuth } from '../auth/useAuth'
import { SettingsContext, type SettingsState } from './SettingsContext'
import { subscribeToUserSettings } from './service'

/** Una sola suscripción a los ajustes de la persona para toda la parte con sesión. */
export function SettingsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const uid = user?.uid
  const [state, setState] = useState<{ uid: string; value: SettingsState } | null>(null)

  useEffect(() => {
    if (!uid) return
    return subscribeToUserSettings(
      uid,
      (settings) => setState({ uid, value: { status: 'ready', settings } }),
      () => setState({ uid, value: { status: 'error' } }),
    )
  }, [uid])

  const value: SettingsState = state && state.uid === uid ? state.value : { status: 'loading' }
  return <SettingsContext value={value}>{children}</SettingsContext>
}
