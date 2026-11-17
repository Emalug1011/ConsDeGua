/** Los cinco tipos de relación del catálogo; las relaciones propias usan los mismos. */
export const RELATION_TYPES = ['remision', 'desarrollo', 'garantia', 'limite', 'tematica'] as const
export type RelationType = (typeof RELATION_TYPES)[number]

export const RELATION_NOTE_MAX_LENGTH = 500

export interface BlockRef {
  titulo: string
  capitulo: string
}

/** Relación propia de una persona. Tiene otro artículo (`hacia`) o un capítulo (`haciaBloque`). */
export interface UserRelation {
  id: string
  desde: string
  hacia: string | null
  haciaBloque: BlockRef | null
  tipo: RelationType
  nota: string
  updatedAt: Date | null
}

export type RelationInput = Omit<UserRelation, 'id' | 'updatedAt'>

export function isRelationType(value: unknown): value is RelationType {
  return typeof value === 'string' && (RELATION_TYPES as readonly string[]).includes(value)
}
