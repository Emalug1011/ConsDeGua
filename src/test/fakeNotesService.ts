/**
 * Sustituto en memoria de `features/notes/service.ts` para las pruebas de
 * componentes. La privacidad real (solo la persona dueña) la prueban las
 * reglas de Firestore en `tests/rules`.
 */
import { vi } from 'vitest'
import {
  EMPTY_NOTE_CONTENT,
  NOTE_MAX_BYTES,
  NoteTooLargeError,
  noteSize,
  type Note,
  type NoteChanges,
} from '../features/notes/types'

interface StoredNote extends Note {
  ownerId: string
}

const notes = new Map<string, StoredNote>()
const listeners = new Set<() => void>()
let counter = 0
let clock = Date.parse('2026-11-16T12:00:00Z')

function now(): Date {
  clock += 1000
  return new Date(clock)
}

function emit(): void {
  listeners.forEach((listener) => listener())
}

function publicNote({ ownerId: _ownerId, ...note }: StoredNote): Note {
  void _ownerId
  return note
}

function listFor(ownerId: string, articleId?: string): Note[] {
  return [...notes.values()]
    .filter((n) => n.ownerId === ownerId && (articleId === undefined || n.articleId === articleId))
    .sort((a, b) => (b.updatedAt?.getTime() ?? 0) - (a.updatedAt?.getTime() ?? 0))
    .map(publicNote)
}

function listen(callback: () => void): () => void {
  listeners.add(callback)
  callback()
  return () => listeners.delete(callback)
}

export function resetNotes(): void {
  notes.clear()
  counter = 0
}

/** Agrega un apunte directamente, como si ya existiera en Firestore. */
export function seedNote(note: Partial<Note> & { ownerId: string }): string {
  const id = note.id ?? `apunte-${++counter}`
  const date = now()
  notes.set(id, {
    id,
    title: '',
    content: EMPTY_NOTE_CONTENT,
    articleId: null,
    createdAt: date,
    updatedAt: date,
    ...note,
  })
  emit()
  return id
}

export const createNote = vi.fn(async (ownerId: string, initial: NoteChanges): Promise<string> => {
  if (noteSize(initial) > NOTE_MAX_BYTES) throw new NoteTooLargeError()
  return seedNote({ ownerId, ...initial })
})

export const updateNote = vi.fn(async (noteId: string, changes: NoteChanges): Promise<void> => {
  if (noteSize(changes) > NOTE_MAX_BYTES) throw new NoteTooLargeError()
  const current = notes.get(noteId)
  if (!current) throw new Error('No existe')
  notes.set(noteId, { ...current, ...changes, updatedAt: now() })
  emit()
})

export const deleteNote = vi.fn(async (noteId: string): Promise<void> => {
  notes.delete(noteId)
  emit()
})

export function subscribeToMyNotes(ownerId: string, onChange: (notes: Note[]) => void) {
  return listen(() => onChange(listFor(ownerId)))
}

export function subscribeToArticleNotes(
  ownerId: string,
  articleId: string,
  onChange: (notes: Note[]) => void,
) {
  return listen(() => onChange(listFor(ownerId, articleId)))
}

export function subscribeToNote(noteId: string, onChange: (note: Note | null) => void) {
  return listen(() => {
    const note = notes.get(noteId)
    onChange(note ? publicNote(note) : null)
  })
}
