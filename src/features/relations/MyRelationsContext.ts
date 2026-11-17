import { createContext } from 'react'
import type { UserRelation } from './types'

export type MyRelationsState =
  { status: 'loading' } | { status: 'ready'; relations: UserRelation[] } | { status: 'error' }

export const MyRelationsContext = createContext<MyRelationsState | null>(null)
