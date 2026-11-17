/**
 * Sustituto en memoria de `features/relations/service.ts` para las pruebas de
 * componentes. Las reglas reales se prueban en `tests/rules`.
 */
import { vi } from 'vitest'
import type { RelationInput, UserRelation } from '../features/relations/types'

let relations: UserRelation[] = []
const listeners = new Set<() => void>()
let counter = 0

function emit(): void {
  listeners.forEach((listener) => listener())
}

export function resetRelations(seed: RelationInput[] = []): void {
  relations = seed.map((input) => ({
    ...input,
    id: `relacion-${++counter}`,
    updatedAt: new Date(),
  }))
  emit()
}

export function subscribeToMyRelations(_uid: string, onChange: (value: UserRelation[]) => void) {
  const listener = () => onChange(relations)
  listeners.add(listener)
  listener()
  return () => listeners.delete(listener)
}

export const createRelation = vi.fn(async (_uid: string, input: RelationInput) => {
  const id = `relacion-${++counter}`
  relations = [{ ...input, id, updatedAt: new Date() }, ...relations]
  emit()
  return id
})

export const updateRelation = vi.fn(async (relationId: string, input: RelationInput) => {
  relations = relations.map((r) => (r.id === relationId ? { ...r, ...input } : r))
  emit()
})

export const deleteRelation = vi.fn(async (relationId: string) => {
  relations = relations.filter((r) => r.id !== relationId)
  emit()
})
