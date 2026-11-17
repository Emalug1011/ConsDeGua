import type { JSONContent } from '@tiptap/core'
import { useEffect, useRef, useState } from 'react'
import { Button } from '../../ui/Button'
import { Dialog } from '../../ui/Dialog'
import { Icon } from '../../ui/Icon'
import { TextField } from '../../ui/TextField'
import { whenSaved } from '../../lib/whenSaved'
import { track } from '../metrics/track'
import { NoteEditor } from './NoteEditor'
import styles from './NoteForm.module.css'
import { deleteNote } from './service'
import { NOTE_TITLE_MAX_LENGTH } from './types'
import { useAutosave, type SaveStatus } from './useAutosave'

const STATUS_TEXT: Record<SaveStatus, string> = {
  idle: 'Se guarda automáticamente',
  pending: 'Cambios sin guardar',
  saving: 'Guardando…',
  saved: 'Guardado',
  local: 'Guardado en este dispositivo. Se sincronizará al volver la conexión.',
  error: 'No se pudo guardar. Revisa tu conexión e intenta de nuevo.',
  too_large: 'El apunte es demasiado grande para guardarse. Acórtalo o divídelo en varios apuntes.',
}

interface NoteFormProps {
  ownerId: string
  /** `null` para un apunte nuevo: se crea con el primer guardado. */
  noteId: string | null
  initialTitle: string
  initialContent: JSONContent
  /** Artículo al que pertenece; lo pone la vista desde la que se abrió. */
  articleId: string | null
  /** Se llama tras eliminar el apunte. */
  onDeleted: () => void
}

export function NoteForm({
  ownerId,
  noteId,
  initialTitle,
  initialContent,
  articleId,
  onDeleted,
}: NoteFormProps) {
  const [title, setTitle] = useState(initialTitle)
  const [savedId, setSavedId] = useState(noteId)
  // Valores actuales para el autoguardado: el editor puede conservar callbacks anteriores.
  const content = useRef<JSONContent>(initialContent)
  const titleRef = useRef(initialTitle)
  const { status, schedule, flush, cancel } = useAutosave({
    ownerId,
    noteId,
    onCreated: setSavedId,
  })
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleteError, setDeleteError] = useState(false)

  useEffect(() => {
    if (noteId) track('note_open')
  }, [noteId])

  const save = () => schedule({ title: titleRef.current, content: content.current, articleId })
  const failed = status === 'error' || status === 'too_large'

  const handleDelete = async () => {
    if (!savedId) return
    cancel()
    try {
      await whenSaved(deleteNote(savedId))
      setConfirmDelete(false)
      onDeleted()
    } catch {
      setDeleteError(true)
    }
  }

  return (
    <div className={styles.form}>
      <p role="status" className={`${styles.status} ${failed ? styles.statusError : ''}`}>
        {failed && <Icon name="error" size="small" />}
        {STATUS_TEXT[status]}
      </p>
      {status === 'error' && (
        <div>
          <Button variant="text" icon="refresh" onClick={() => void flush()}>
            Reintentar
          </Button>
        </div>
      )}

      <TextField
        label="Título"
        value={title}
        maxLength={NOTE_TITLE_MAX_LENGTH}
        placeholder="Sin título"
        onChange={(event) => {
          setTitle(event.target.value)
          titleRef.current = event.target.value
          save()
        }}
      />

      <NoteEditor
        content={initialContent}
        label="Contenido del apunte"
        onChange={(next) => {
          content.current = next
          save()
        }}
      />

      {savedId && (
        <div>
          <Button variant="outlined" icon="delete" onClick={() => setConfirmDelete(true)}>
            Eliminar apunte
          </Button>
        </div>
      )}

      <Dialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        title="¿Eliminar este apunte?"
        closeLabel="Cancelar"
        actions={
          <Button variant="filled" icon="delete" onClick={() => void handleDelete()}>
            Eliminar
          </Button>
        }
      >
        <p>Se borrará para siempre y no se puede recuperar.</p>
        {deleteError && (
          <p role="alert" className={styles.statusError}>
            <Icon name="error" size="small" />
            No se pudo eliminar. Revisa tu conexión e intenta de nuevo.
          </p>
        )}
      </Dialog>
    </div>
  )
}
