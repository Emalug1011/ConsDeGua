import { useEffect, useState } from 'react'
import { Navigate, useLocation } from 'react-router'
import { APP_NAME } from '../../config/app'
import { AppLogo } from '../../ui/AppLogo'
import { Button } from '../../ui/Button'
import { Icon } from '../../ui/Icon'
import { track } from '../metrics/track'
import styles from './LoginPage.module.css'
import type { LoginRedirectState } from './paths'
import { completeRedirectSignIn, signInWithGoogle } from './service'
import { useAuth } from './useAuth'

const SIGN_IN_ERROR = 'No se pudo iniciar sesión. Revisa tu conexión e intenta de nuevo.'

export function LoginPage() {
  const { status } = useAuth()
  const location = useLocation()
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    completeRedirectSignIn()
      .then((signedIn) => {
        if (signedIn) track('login', { method: 'google' })
      })
      .catch(() => setError(SIGN_IN_ERROR))
  }, [])

  if (status === 'signed_in') {
    const from = (location.state as LoginRedirectState | null)?.from
    return <Navigate to={from ?? '/'} replace />
  }

  async function handleSignIn() {
    setPending(true)
    setError(null)
    try {
      const result = await signInWithGoogle()
      if (result === 'signed_in') track('login', { method: 'google' })
    } catch {
      setError(SIGN_IN_ERROR)
    } finally {
      setPending(false)
    }
  }

  return (
    <main className={styles.page}>
      <div className={styles.panel}>
        <AppLogo size="large" />
        <h1 className="headline-medium">{APP_NAME}</h1>
        <p className={styles.lead}>
          Estudia la Constitución Política de la República de Guatemala.
        </p>
        <Button
          variant="filled"
          icon="login"
          onClick={handleSignIn}
          disabled={pending || status === 'loading'}
        >
          Ingresar con Google
        </Button>
        {error && (
          <p role="alert" className={styles.error}>
            <Icon name="error" size="small" />
            {error}
          </p>
        )}
      </div>
    </main>
  )
}
