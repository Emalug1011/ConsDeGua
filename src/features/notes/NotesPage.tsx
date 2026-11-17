import { Button } from '../../ui/Button'
import { Icon } from '../../ui/Icon'
import { NoteDialog } from './NoteDialog'
import { NoteList } from './NoteList'
import styles from './NotesPage.module.css'
import { useNoteDialog } from './useNoteDialog'
import { useNotes } from './useNotes'

/** Lista de los apuntes de la persona. Solo ella los ve. */
export function NotesPage() {
  const notes = useNotes()
  const dialog = useNoteDialog()

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className="headline-small">Mis apuntes</h1>
        <p className={styles.privacy}>
          <Icon name="lock" size="small" />
          <span>Solo tú puedes ver tus apuntes.</span>
        </p>
        <div>
          <Button icon="add" onClick={() => dialog.openNew(null)}>
            Crear apunte
          </Button>
        </div>
      </header>

      {notes.status === 'loading' && (
        <p role="status" className={styles.muted}>
          Cargando apuntes…
        </p>
      )}
      {notes.status === 'error' && (
        <p role="alert" className={styles.error}>
          <Icon name="error" size="small" />
          No se pudieron cargar tus apuntes. Revisa tu conexión y recarga la página.
        </p>
      )}
      {notes.status === 'ready' &&
        (notes.data.length === 0 ? (
          <p className={styles.muted}>
            Todavía no tienes apuntes. Crea uno aquí o desde cualquier artículo.
          </p>
        ) : (
          <NoteList notes={notes.data} onSelect={dialog.openNote} />
        ))}

      <NoteDialog controls={dialog} />
    </div>
  )
}
