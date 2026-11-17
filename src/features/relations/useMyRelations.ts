import { use, useMemo } from 'react'
import { getRelated, type RelatedResult } from '../constitution/catalog'
import { relatedFromMine } from './combine'
import { MyRelationsContext, type MyRelationsState } from './MyRelationsContext'
import type { UserRelation } from './types'

const EMPTY: UserRelation[] = []

export function useMyRelationsState(): MyRelationsState {
  const state = use(MyRelationsContext)
  if (!state) throw new Error('useMyRelationsState debe usarse dentro de <MyRelationsProvider>.')
  return state
}

/** Relaciones propias de la persona (vacío mientras cargan o si fallan). */
export function useMyRelations(): UserRelation[] {
  const state = useMyRelationsState()
  return state.status === 'ready' ? state.relations : EMPTY
}

/** Relaciones de un artículo: las del catálogo y, aparte, las propias de la persona. */
export function useArticleRelations(articleId: string): {
  catalogo: RelatedResult
  propias: RelatedResult
} {
  const mine = useMyRelations()
  return useMemo(
    () => ({ catalogo: getRelated(articleId), propias: relatedFromMine(articleId, mine) }),
    [articleId, mine],
  )
}
