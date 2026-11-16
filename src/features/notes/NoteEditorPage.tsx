import { Link, useParams } from 'react-router'
import { Icon } from '../../ui/Icon'
import styles from './NoteEditorPage.module.css'
import { NoteForm } from './NoteForm'
import { useNote } from './useNotes'

/** Editor de un apunte. Se carga solo al abrirlo, para no pesar en la portada. */
export function NoteEditorPage() {
  const { id = '' } = useParams()
  const note = useNote(id)

  if (note.status === 'loading') {
    return (
      <p role="status" className={styles.muted}>
        Cargando apunte…
      </p>
    )
  }

  if (note.status === 'error') {
    return (
      <div className={styles.page}>
        <p role="alert" className={styles.error}>
          <Icon name="error" size="small" />
          No se pudo abrir el apunte. Revisa tu conexión y recarga la página.
        </p>
        <Link to="/apuntes" className="label-large">
          Ir a mis apuntes
        </Link>
      </div>
    )
  }

  if (!note.data) {
    return (
      <div className={styles.page}>
        <h1 className="headline-small">No encontramos este apunte</h1>
        <p className="body-large">Puede que se haya eliminado.</p>
        <Link to="/apuntes" className="label-large">
          Ir a mis apuntes
        </Link>
      </div>
    )
  }

  return <NoteForm key={note.data.id} note={note.data} />
}
