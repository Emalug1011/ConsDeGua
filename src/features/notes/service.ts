import { FirebaseError } from 'firebase/app'
import {
  collection,
  deleteDoc,
  deleteField,
  doc,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  type DocumentSnapshot,
  type QueryDocumentSnapshot,
  type Timestamp,
} from 'firebase/firestore'
import { db } from '../../config/firebase'
import {
  EMPTY_NOTE_CONTENT,
  NOTE_MAX_BYTES,
  NoteTooLargeError,
  noteSize,
  type Note,
  type NoteChanges,
} from './types'

const NOTES = 'notes'
const LIST_LIMIT = 50

function toDate(value: unknown): Date | null {
  return value && typeof (value as Timestamp).toDate === 'function'
    ? (value as Timestamp).toDate()
    : null
}

function toNote(snapshot: DocumentSnapshot | QueryDocumentSnapshot): Note | null {
  // Mientras el servidor confirma la escritura, usa una hora estimada.
  const data = snapshot.data({ serverTimestamps: 'estimate' })
  if (!data) return null
  return {
    id: snapshot.id,
    title: typeof data.title === 'string' ? data.title : '',
    content: (data.content as Note['content'] | undefined) ?? EMPTY_NOTE_CONTENT,
    articleId: typeof data.articleId === 'string' ? data.articleId : null,
    createdAt: toDate(data.createdAt),
    updatedAt: toDate(data.updatedAt),
  }
}

/**
 * Crea el apunte con su primer contenido. Devuelve el id al instante y la
 * escritura aparte: sin internet, la escritura queda pendiente hasta reconectar.
 */
export function createNote(
  ownerId: string,
  initial: NoteChanges,
): { id: string; write: Promise<void> } {
  if (noteSize(initial) > NOTE_MAX_BYTES) throw new NoteTooLargeError()
  const ref = doc(collection(db, NOTES))
  const write = setDoc(ref, {
    ownerId,
    title: initial.title,
    content: initial.content,
    ...(initial.articleId ? { articleId: initial.articleId } : {}),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return { id: ref.id, write }
}

/** Guarda título, contenido y artículo. Rechaza apuntes que no caben en un documento. */
export async function updateNote(noteId: string, changes: NoteChanges): Promise<void> {
  if (noteSize(changes) > NOTE_MAX_BYTES) throw new NoteTooLargeError()
  await updateDoc(doc(db, NOTES, noteId), {
    title: changes.title,
    content: changes.content,
    articleId: changes.articleId ?? deleteField(),
    updatedAt: serverTimestamp(),
  })
}

export async function deleteNote(noteId: string): Promise<void> {
  await deleteDoc(doc(db, NOTES, noteId))
}

type Unsubscribe = () => void

/** Apuntes de la persona, del más reciente al más antiguo. */
export function subscribeToMyNotes(
  ownerId: string,
  onChange: (notes: Note[]) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  const q = query(
    collection(db, NOTES),
    where('ownerId', '==', ownerId),
    orderBy('updatedAt', 'desc'),
    limit(LIST_LIMIT),
  )
  return onSnapshot(
    q,
    (snapshot) => onChange(snapshot.docs.map(toNote).filter((n): n is Note => n !== null)),
    onError,
  )
}

/** Apuntes de la persona ligados a un artículo. */
export function subscribeToArticleNotes(
  ownerId: string,
  articleId: string,
  onChange: (notes: Note[]) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  const q = query(
    collection(db, NOTES),
    where('ownerId', '==', ownerId),
    where('articleId', '==', articleId),
    orderBy('updatedAt', 'desc'),
    limit(LIST_LIMIT),
  )
  return onSnapshot(
    q,
    (snapshot) => onChange(snapshot.docs.map(toNote).filter((n): n is Note => n !== null)),
    onError,
  )
}

/** Un apunte; `null` si no existe (o se borró). */
export function subscribeToNote(
  noteId: string,
  onChange: (note: Note | null) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  return onSnapshot(
    doc(db, NOTES, noteId),
    (snapshot) => onChange(toNote(snapshot)),
    (error) => {
      // Un apunte ajeno se trata igual que uno que no existe.
      if (error instanceof FirebaseError && error.code === 'permission-denied') onChange(null)
      else onError(error)
    },
  )
}
