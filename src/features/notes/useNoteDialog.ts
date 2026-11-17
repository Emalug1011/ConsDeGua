import { useCallback, useMemo, useState } from 'react'
import type { Note } from './types'

export interface NoteDialogState {
  open: boolean
  /** `null` para un apunte nuevo. */
  noteId: string | null
  articleId: string | null
  /** Cambia en cada apertura para empezar el editor desde cero. */
  session: number
}

export interface NoteDialogControls {
  state: NoteDialogState
  openNew: (articleId: string | null) => void
  openNote: (note: Note) => void
  close: () => void
}

/** Estado del diálogo de apuntes: abrir uno existente o uno nuevo, sin cambiar de página. */
export function useNoteDialog(): NoteDialogControls {
  const [state, setState] = useState<NoteDialogState>({
    open: false,
    noteId: null,
    articleId: null,
    session: 0,
  })

  const openNew = useCallback((articleId: string | null) => {
    setState((s) => ({ open: true, noteId: null, articleId, session: s.session + 1 }))
  }, [])

  const openNote = useCallback((note: Note) => {
    setState((s) => ({
      open: true,
      noteId: note.id,
      articleId: note.articleId,
      session: s.session + 1,
    }))
  }, [])

  const close = useCallback(() => setState((s) => ({ ...s, open: false })), [])

  return useMemo(() => ({ state, openNew, openNote, close }), [state, openNew, openNote, close])
}
