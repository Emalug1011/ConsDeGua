import { useEffect, useState } from 'react'
import { useAuth } from '../auth/useAuth'
import { subscribeToArticleNotes, subscribeToMyNotes, subscribeToNote } from './service'
import type { Note } from './types'

export type LoadState<T> =
  { status: 'loading' } | { status: 'ready'; data: T } | { status: 'error' }

/** Apuntes de la persona con sesión; si se pasa `articleId`, solo los de ese artículo. */
export function useNotes(articleId?: string): LoadState<Note[]> {
  const { user } = useAuth()
  const uid = user?.uid
  const [state, setState] = useState<{ key: string; value: LoadState<Note[]> } | null>(null)
  const key = `${uid ?? ''}|${articleId ?? ''}`

  useEffect(() => {
    if (!uid) return
    const onChange = (notes: Note[]) => setState({ key, value: { status: 'ready', data: notes } })
    const onError = () => setState({ key, value: { status: 'error' } })
    return articleId
      ? subscribeToArticleNotes(uid, articleId, onChange, onError)
      : subscribeToMyNotes(uid, onChange, onError)
  }, [uid, articleId, key])

  // Mientras llega la primera respuesta para estos parámetros, está cargando.
  return state?.key === key ? state.value : { status: 'loading' }
}

/** Un apunte; `data` es `null` si no existe o no es de la persona. */
export function useNote(noteId: string): LoadState<Note | null> {
  const [state, setState] = useState<{ id: string; value: LoadState<Note | null> } | null>(null)

  useEffect(
    () =>
      subscribeToNote(
        noteId,
        (note) => setState({ id: noteId, value: { status: 'ready', data: note } }),
        () => setState({ id: noteId, value: { status: 'error' } }),
      ),
    [noteId],
  )

  return state?.id === noteId ? state.value : { status: 'loading' }
}
