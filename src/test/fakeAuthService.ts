/**
 * Sustituto de `features/auth/service.ts` en las pruebas de componentes:
 * ninguna prueba de componentes habla con Firebase.
 */
import { vi } from 'vitest'
import type { AuthUser, DeleteAccountResult, SignInResult } from '../features/auth/types'

export const TEST_USER: AuthUser = {
  uid: 'persona-prueba',
  displayName: 'Persona de prueba',
  email: 'persona@example.com',
  photoURL: null,
}

let currentUser: AuthUser | null = TEST_USER
const listeners = new Set<(user: AuthUser | null) => void>()

/** Cambia la sesión simulada y avisa a los suscriptores. */
export function setTestUser(user: AuthUser | null): void {
  currentUser = user
  listeners.forEach((listener) => listener(user))
}

export function subscribeToAuth(listener: (user: AuthUser | null) => void): () => void {
  listeners.add(listener)
  listener(currentUser)
  return () => listeners.delete(listener)
}

export const signInWithGoogle = vi.fn(async (): Promise<SignInResult> => {
  setTestUser(TEST_USER)
  return 'signed_in'
})

export const completeRedirectSignIn = vi.fn(async (): Promise<boolean> => false)

export const signOutUser = vi.fn(async (): Promise<void> => {
  setTestUser(null)
})

export const ensureUserProfile = vi.fn(async (): Promise<void> => undefined)

export const deleteAccount = vi.fn(async (): Promise<DeleteAccountResult> => {
  setTestUser(null)
  return 'deleted'
})

export const leaveAfterAccountDeletion = vi.fn(async (): Promise<void> => undefined)
