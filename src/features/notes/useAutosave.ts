import { useCallback, useEffect, useRef, useState } from 'react'
import { updateNote } from './service'
import { NoteTooLargeError, type NoteChanges } from './types'

export type SaveStatus = 'idle' | 'pending' | 'saving' | 'saved' | 'error' | 'too_large'

/** Espera tras el último cambio antes de guardar (la guía pide de 1 a 2 segundos). */
export const AUTOSAVE_DELAY_MS = 1500

/**
 * Autoguardado diferido de un apunte: guarda 1.5 s después del último cambio,
 * nunca en cada tecla. Si falla, conserva los cambios para reintentar; al
 * salir del editor guarda lo que quedó pendiente.
 */
export function useAutosave(noteId: string) {
  const [status, setStatus] = useState<SaveStatus>('idle')
  const pending = useRef<NoteChanges | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearTimer = () => {
    if (timer.current) clearTimeout(timer.current)
    timer.current = null
  }

  const flush = useCallback(async () => {
    clearTimer()
    const changes = pending.current
    if (!changes) return
    pending.current = null
    setStatus('saving')
    try {
      await updateNote(noteId, changes)
      // Si hubo más cambios mientras se guardaba, siguen pendientes.
      setStatus(pending.current ? 'pending' : 'saved')
    } catch (error) {
      pending.current ??= changes
      setStatus(error instanceof NoteTooLargeError ? 'too_large' : 'error')
    }
  }, [noteId])

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

  useEffect(() => () => void flush(), [flush])

  return { status, schedule, flush, cancel }
}
