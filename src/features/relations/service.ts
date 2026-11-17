import {
  addDoc,
  collection,
  deleteDoc,
  deleteField,
  doc,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
  type QueryDocumentSnapshot,
  type Timestamp,
} from 'firebase/firestore'
import { db } from '../../config/firebase'
import { isRelationType, type RelationInput, type UserRelation } from './types'

const RELATIONS = 'relations'
const LIST_LIMIT = 500

function toRelation(snapshot: QueryDocumentSnapshot): UserRelation | null {
  const data = snapshot.data({ serverTimestamps: 'estimate' })
  if (typeof data.desde !== 'string' || !isRelationType(data.tipo)) return null
  const block = data.haciaBloque as { titulo?: unknown; capitulo?: unknown } | undefined
  const updatedAt = data.updatedAt as Timestamp | undefined
  return {
    id: snapshot.id,
    desde: data.desde,
    hacia: typeof data.hacia === 'string' ? data.hacia : null,
    haciaBloque:
      block && typeof block.titulo === 'string' && typeof block.capitulo === 'string'
        ? { titulo: block.titulo, capitulo: block.capitulo }
        : null,
    tipo: data.tipo,
    nota: typeof data.nota === 'string' ? data.nota : '',
    updatedAt: updatedAt ? updatedAt.toDate() : null,
  }
}

/** Todas las relaciones propias de la persona (hasta 500), con una sola suscripción. */
export function subscribeToMyRelations(
  ownerId: string,
  onChange: (relations: UserRelation[]) => void,
  onError: (error: Error) => void,
): () => void {
  const q = query(
    collection(db, RELATIONS),
    where('ownerId', '==', ownerId),
    orderBy('updatedAt', 'desc'),
    limit(LIST_LIMIT),
  )
  return onSnapshot(
    q,
    (snapshot) =>
      onChange(snapshot.docs.map(toRelation).filter((r): r is UserRelation => r !== null)),
    onError,
  )
}

/** Campos a guardar: un solo destino y la nota solo si tiene texto. */
function fields(input: RelationInput) {
  const nota = input.nota.trim()
  return {
    desde: input.desde,
    tipo: input.tipo,
    ...(input.hacia ? { hacia: input.hacia } : {}),
    ...(input.haciaBloque ? { haciaBloque: input.haciaBloque } : {}),
    ...(nota ? { nota } : {}),
  }
}

export async function createRelation(ownerId: string, input: RelationInput): Promise<string> {
  const ref = await addDoc(collection(db, RELATIONS), {
    ownerId,
    ...fields(input),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return ref.id
}

export async function updateRelation(relationId: string, input: RelationInput): Promise<void> {
  const nota = input.nota.trim()
  await updateDoc(doc(db, RELATIONS, relationId), {
    desde: input.desde,
    tipo: input.tipo,
    // Al cambiar de destino, se borra el anterior.
    hacia: input.hacia ?? deleteField(),
    haciaBloque: input.haciaBloque ?? deleteField(),
    nota: nota || deleteField(),
    updatedAt: serverTimestamp(),
  })
}

export async function deleteRelation(relationId: string): Promise<void> {
  await deleteDoc(doc(db, RELATIONS, relationId))
}
