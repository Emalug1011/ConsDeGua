/**
 * Inicialización de Firebase. Solo los servicios de cada feature
 * (`features/<feature>/service.ts`) y `metrics/track.ts` importan este módulo.
 */
import { getAnalytics, isSupported, type Analytics } from 'firebase/analytics'
import { initializeApp, type FirebaseOptions } from 'firebase/app'
import { connectAuthEmulator, getAuth } from 'firebase/auth'
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore'

function required(name: keyof ImportMetaEnv, value: string | undefined): string {
  if (!value) {
    throw new Error(`Falta la variable ${name}. Copia .env.example como .env.local y complétala.`)
  }
  return value
}

const env = import.meta.env

const firebaseOptions: FirebaseOptions = {
  apiKey: required('VITE_FIREBASE_API_KEY', env.VITE_FIREBASE_API_KEY),
  authDomain: required('VITE_FIREBASE_AUTH_DOMAIN', env.VITE_FIREBASE_AUTH_DOMAIN),
  projectId: required('VITE_FIREBASE_PROJECT_ID', env.VITE_FIREBASE_PROJECT_ID),
  storageBucket: required('VITE_FIREBASE_STORAGE_BUCKET', env.VITE_FIREBASE_STORAGE_BUCKET),
  messagingSenderId: required(
    'VITE_FIREBASE_MESSAGING_SENDER_ID',
    env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  ),
  appId: required('VITE_FIREBASE_APP_ID', env.VITE_FIREBASE_APP_ID),
  measurementId: required('VITE_FIREBASE_MEASUREMENT_ID', env.VITE_FIREBASE_MEASUREMENT_ID),
}

const useEmulators = env.VITE_USE_EMULATORS === 'true'

export const firebaseApp = initializeApp(firebaseOptions)
export const auth = getAuth(firebaseApp)
export const db = getFirestore(firebaseApp)

if (useEmulators) {
  connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true })
  connectFirestoreEmulator(db, '127.0.0.1', 8080)
}

/** Analytics puede estar bloqueado por el navegador: en ese caso queda en `null`. */
export const analytics: Promise<Analytics | null> = useEmulators
  ? Promise.resolve(null)
  : isSupported()
      .then((supported) => (supported ? getAnalytics(firebaseApp) : null))
      .catch(() => null)
