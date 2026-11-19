import { FirebaseError } from 'firebase/app'
import {
  GoogleAuthProvider,
  deleteUser,
  getRedirectResult,
  onAuthStateChanged,
  reauthenticateWithPopup,
  signInWithPopup,
  signInWithRedirect,
  signOut,
  type User,
} from 'firebase/auth'
import {
  clearIndexedDbPersistence,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  serverTimestamp,
  setDoc,
  terminate,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore'
import { auth, db } from '../../config/firebase'
import type { AuthUser, DeleteAccountResult, SignInResult } from './types'

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
 * Borra de este dispositivo la copia local de apuntes y relaciones y recarga
 * en /ingresar, porque Firestore queda cerrado.
 */
async function clearDeviceAndLeave(destination: string): Promise<void> {
  try {
    await terminate(db)
    await clearIndexedDbPersistence(db)
  } catch {
    // Si otra pestaña de ConstGua sigue abierta, la caché no se puede borrar ahora.
  }
  window.location.assign(destination)
}

/** Cierra la sesión y borra la copia local de este dispositivo. */
export async function signOutUser(): Promise<void> {
  await signOut(auth)
  await clearDeviceAndLeave('/ingresar')
}

/** Colecciones con documentos de la persona (`ownerId`) que se borran con su cuenta. */
const OWNED_COLLECTIONS = ['notes', 'relations'] as const
const DELETE_BATCH_SIZE = 200

async function deleteOwnedDocuments(name: string, uid: string): Promise<void> {
  for (;;) {
    const snapshot = await getDocs(
      query(collection(db, name), where('ownerId', '==', uid), limit(DELETE_BATCH_SIZE)),
    )
    if (snapshot.empty) return
    const batch = writeBatch(db)
    snapshot.docs.forEach((document) => batch.delete(document.ref))
    await batch.commit()
  }
}

/**
 * Elimina la cuenta: pide a Google confirmar la identidad, borra apuntes,
 * relaciones propias y `users/{uid}`, y al final la cuenta de Firebase
 * Authentication. Los registros de `metrics_daily` se conservan sin ningún
 * dato que identifique a la persona. Necesita conexión.
 */
export async function deleteAccount(): Promise<DeleteAccountResult> {
  const user = auth.currentUser
  if (!user) return 'cancelled'
  try {
    await reauthenticateWithPopup(user, googleProvider())
  } catch (error) {
    if (error instanceof FirebaseError) {
      if (CANCELLED_CODES.has(error.code)) return 'cancelled'
      if (error.code === 'auth/popup-blocked') return 'popup_blocked'
      if (error.code === 'auth/user-mismatch') return 'wrong_account'
    }
    throw error
  }
  for (const name of OWNED_COLLECTIONS) await deleteOwnedDocuments(name, user.uid)
  await deleteDoc(doc(db, 'users', user.uid))
  await deleteUser(user)
  return 'deleted'
}

/** Después de eliminar la cuenta: limpia este dispositivo y avisa en /ingresar. */
export async function leaveAfterAccountDeletion(): Promise<void> {
  await clearDeviceAndLeave('/ingresar?cuenta=eliminada')
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
