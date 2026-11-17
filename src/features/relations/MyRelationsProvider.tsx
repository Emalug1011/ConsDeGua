import { useEffect, useState, type ReactNode } from 'react'
import { useAuth } from '../auth/useAuth'
import { MyRelationsContext, type MyRelationsState } from './MyRelationsContext'
import { subscribeToMyRelations } from './service'

/** Una sola suscripción a las relaciones propias para toda la parte con sesión. */
export function MyRelationsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const uid = user?.uid
  const [state, setState] = useState<{ uid: string; value: MyRelationsState } | null>(null)

  useEffect(() => {
    if (!uid) return
    return subscribeToMyRelations(
      uid,
      (relations) => setState({ uid, value: { status: 'ready', relations } }),
      () => setState({ uid, value: { status: 'error' } }),
    )
  }, [uid])

  const value: MyRelationsState = state && state.uid === uid ? state.value : { status: 'loading' }
  return <MyRelationsContext value={value}>{children}</MyRelationsContext>
}
