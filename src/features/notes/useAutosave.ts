import { useCallback, useEffect, useRef, useState } from 'react'
import { track } from '../metrics/track'
import { createNote, updateNote } from './service'
import { NoteTooLargeError, type NoteChanges } from './types'

export type SaveStatus = 'idle' | 'pending' | 'saving' | 'saved' | 'error' | 'too_large'

/** Espera tras el último cambio antes de guardar (la guía pide de 1 a 2 segundos). */
export const AUTOSAVE_DELAY_MS = 1500

interface AutosaveOptions {
  ownerId: string
  /** Id del apunte; `null` si todavía no existe y se crea al primer guardado. */
  noteId: string | null
  onCreated?: (noteId: string) => void
}

/**
 * Autoguardado diferido de un apunte: guarda 1.5 s después del último cambio,
 * nunca en cada tecla. Un apunte nuevo se crea con su primer guardado, así no
 * quedan apuntes vacíos. Los guardados van en fila para no crear dos veces;
 * si uno falla, los cambios quedan para reintentar.
 */
export function useAutosave({ ownerId, noteId, onCreated }: AutosaveOptions) {
  const [status, setStatus] = useState<SaveStatus>('idle')
  const id = useRef(noteId)
  const created = useRef(onCreated)
  const pending = useRef<NoteChanges | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const queue = useRef<Promise<void>>(Promise.resolve())

  useEffect(() => {
    created.current = onCreated
  }, [onCreated])

  const clearTimer = () => {
    if (timer.current) clearTimeout(timer.current)
    timer.current = null
  }

  const save = useCallback(async () => {
    const changes = pending.current
    if (!changes) return
    pending.current = null
    setStatus('saving')
    try {
      if (id.current) {
        await updateNote(id.current, changes)
      } else {
        id.current = await createNote(ownerId, changes)
        track('note_create')
        created.current?.(id.current)
      }
      setStatus(pending.current ? 'pending' : 'saved')
    } catch (error) {
      pending.current ??= changes
      setStatus(error instanceof NoteTooLargeError ? 'too_large' : 'error')
    }
  }, [ownerId])

  const flush = useCallback(() => {
    clearTimer()
    queue.current = queue.current.then(save)
    return queue.current
  }, [save])

  const schedule = useCallback(
    (changes: NoteChanges) => {
      pending.current = changes
      setStatus('pending')
      clearTimer()
      timer.current = setTimeout(() => void flush(), AUTOSAVE_DELAY_MS)
    },
    [flush],
  )

  /** Descarta lo pendiente (por ejemplo, antes de borrar el apunte). */
  const cancel = useCallback(() => {
    clearTimer()
    pending.current = null
  }, [])

  // Al cerrar el editor, guarda lo que quedó pendiente.
  useEffect(() => () => void flush(), [flush])

  return { status, schedule, flush, cancel }
}
