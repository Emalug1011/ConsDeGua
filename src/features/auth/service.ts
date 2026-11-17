import { FirebaseError } from 'firebase/app'
import {
  GoogleAuthProvider,
  getRedirectResult,
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  signOut,
  type User,
} from 'firebase/auth'
import {
  clearIndexedDbPersistence,
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  terminate,
  updateDoc,
} from 'firebase/firestore'
import { auth, db } from '../../config/firebase'
import type { AuthUser, SignInResult } from './types'

const CANCELLED_CODES = new Set(['auth/popup-closed-by-user', 'auth/cancelled-popup-request'])

function toAuthUser(user: User): AuthUser {
  return {
    uid: user.uid,
    displayName: user.displayName,
    email: user.email,
    photoURL: user.photoURL,
  }
}

function googleProvider(): GoogleAuthProvider {
  const provider = new GoogleAuthProvider()
  provider.setCustomParameters({ prompt: 'select_account' })
  return provider
}

/** Se suscribe a los cambios de sesión. Devuelve la función para cancelar la suscripción. */
export function subscribeToAuth(listener: (user: AuthUser | null) => void): () => void {
  return onAuthStateChanged(auth, (user) => listener(user ? toAuthUser(user) : null))
}

/** Abre la ventana de Google; si el navegador la bloquea, inicia sesión por redirección. */
export async function signInWithGoogle(): Promise<SignInResult> {
  try {
    await signInWithPopup(auth, googleProvider())
    return 'signed_in'
  } catch (error) {
    if (error instanceof FirebaseError && CANCELLED_CODES.has(error.code)) return 'cancelled'
    if (error instanceof FirebaseError && error.code === 'auth/popup-blocked') {
      await signInWithRedirect(auth, googleProvider())
      return 'redirecting'
    }
    throw error
  }
}

/** Completa un inicio de sesión por redirección, si lo hubo. */
export async function completeRedirectSignIn(): Promise<boolean> {
  const result = await getRedirectResult(auth)
  return result !== null
}

/**
 * Cierra la sesión y borra de este dispositivo la copia local de apuntes y
 * relaciones. Recarga en /ingresar porque Firestore queda cerrado.
 */
export async function signOutUser(): Promise<void> {
  await signOut(auth)
  try {
    await terminate(db)
    await clearIndexedDbPersistence(db)
  } catch {
    // Si otra pestaña de ConstGua sigue abierta, la caché no se puede borrar ahora.
  }
  window.location.assign('/ingresar')
}

/** Crea `users/{uid}` en el primer ingreso; en los siguientes actualiza `lastSeenAt`. */
export async function ensureUserProfile(user: AuthUser): Promise<void> {
  const ref = doc(db, 'users', user.uid)
  const snapshot = await getDoc(ref)
  if (snapshot.exists()) {
    await updateDoc(ref, {
      displayName: user.displayName,
      photoURL: user.photoURL,
      lastSeenAt: serverTimestamp(),
    })
    return
  }
  await setDoc(ref, {
    displayName: user.displayName,
    email: user.email,
    photoURL: user.photoURL,
    createdAt: serverTimestamp(),
    lastSeenAt: serverTimestamp(),
  })
}
