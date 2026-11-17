import { useAuth } from '../auth/useAuth'
import { ExistingNoteForm } from './ExistingNoteForm'
import { NoteForm } from './NoteForm'
import { EMPTY_NOTE_CONTENT } from './types'

interface NoteDialogBodyProps {
  noteId: string | null
  articleId: string | null
  onDeleted: () => void
}

/** Contenido del diálogo de apuntes (con el editor); se carga bajo demanda. */
export function NoteDialogBody({ noteId, articleId, onDeleted }: NoteDialogBodyProps) {
  const { user } = useAuth()
  if (!user) return null

  if (noteId) {
    return <ExistingNoteForm ownerId={user.uid} noteId={noteId} onDeleted={onDeleted} />
  }

  return (
    <NoteForm
      ownerId={user.uid}
      noteId={null}
      initialTitle=""
      initialContent={EMPTY_NOTE_CONTENT}
      articleId={articleId}
      onDeleted={onDeleted}
    />
  )
}
