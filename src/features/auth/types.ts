/** Datos de la persona con sesión que usa la interfaz. */
export interface AuthUser {
  uid: string
  displayName: string | null
  email: string | null
  photoURL: string | null
}

export type SignInResult = 'signed_in' | 'cancelled' | 'redirecting'

/** Resultado de eliminar la cuenta; los demás errores se lanzan. */
export type DeleteAccountResult = 'deleted' | 'cancelled' | 'popup_blocked' | 'wrong_account'
