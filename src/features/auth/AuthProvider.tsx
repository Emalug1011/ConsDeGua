import { useEffect, useState, type ReactNode } from 'react'
import { registerDailyVisit } from '../metrics/dailyVisit'
import { AuthContext, type AuthState } from './AuthContext'
import { subscribeToAuth } from './service'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ status: 'loading', user: null })

  useEffect(
    () =>
      subscribeToAuth((user) => {
        setState(user ? { status: 'signed_in', user } : { status: 'signed_out', user: null })
        if (user) {
          // El registro de uso nunca debe bloquear ni romper la app.
          registerDailyVisit(user).catch(() => undefined)
        }
      }),
    [],
  )

  return <AuthContext value={state}>{children}</AuthContext>
}
