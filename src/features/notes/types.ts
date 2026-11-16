import type { JSONContent } from '@tiptap/core'

/** Apunte de una persona. El contenido es el JSON del editor (Tiptap). */
export interface Note {
  id: string
  title: string
  content: JSONContent
  /** Artículo del catálogo al que está ligado, si lo hay. */
  articleId: string | null
  createdAt: Date | null
  updatedAt: Date | null
}

export interface NoteChanges {
  title: string
  content: JSONContent
  articleId: string | null
}

export const EMPTY_NOTE_CONTENT: JSONContent = { type: 'doc', content: [{ type: 'paragraph' }] }

export const NOTE_TITLE_MAX_LENGTH = 200

/** Un documento de Firestore admite 1 MiB; se deja margen para los demás campos. */
export const NOTE_MAX_BYTES = 900 * 1024

export class NoteTooLargeError extends Error {
  constructor() {
    super('El apunte supera el tamaño máximo que se puede guardar.')
    this.name = 'NoteTooLargeError'
  }
}

/** Tamaño aproximado en bytes de lo que se va a guardar. */
export function noteSize(changes: NoteChanges): number {
  return new TextEncoder().encode(JSON.stringify(changes)).length
}
