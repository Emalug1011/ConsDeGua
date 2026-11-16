import { createContext } from 'react'
import type { AuthUser } from './types'

export type AuthState =
  | { status: 'loading'; user: null }
  | { status: 'signed_out'; user: null }
  | { status: 'signed_in'; user: AuthUser }

export const AuthContext = createContext<AuthState | null>(null)
