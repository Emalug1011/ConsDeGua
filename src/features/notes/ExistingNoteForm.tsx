import { Icon } from '../../ui/Icon'
import styles from './NoteDialog.module.css'
import { NoteForm } from './NoteForm'
import { useNote } from './useNotes'

interface ExistingNoteFormProps {
  ownerId: string
  noteId: string
  onDeleted: () => void
}

/** Carga un apunte guardado y abre su editor. */
export function ExistingNoteForm({ ownerId, noteId, onDeleted }: ExistingNoteFormProps) {
  const note = useNote(noteId)

  if (note.status === 'loading') {
    return (
      <p role="status" className={styles.muted}>
        Cargando apunte…
      </p>
    )
  }
  if (note.status === 'error') {
    return (
      <p role="alert" className={styles.error}>
        <Icon name="error" size="small" />
        No se pudo abrir el apunte. Revisa tu conexión e intenta de nuevo.
      </p>
    )
  }
  if (!note.data) {
    return <p className={styles.muted}>Este apunte ya no existe.</p>
  }

  return (
    <NoteForm
      ownerId={ownerId}
      noteId={note.data.id}
      initialTitle={note.data.title}
      initialContent={note.data.content}
      articleId={note.data.articleId}
      onDeleted={onDeleted}
    />
  )
}
