import { Button } from '../../ui/Button'
import { Icon } from '../../ui/Icon'
import styles from './ArticleNotes.module.css'
import { NoteList } from './NoteList'
import { useCreateNote } from './useCreateNote'
import { useNotes } from './useNotes'

interface ArticleNotesProps {
  articleId: string
}

/** Apuntes de la persona ligados a un artículo, dentro de la vista del artículo. */
export function ArticleNotes({ articleId }: ArticleNotesProps) {
  const notes = useNotes(articleId)
  const { create, creating, error } = useCreateNote()

  return (
    <section aria-labelledby="mis-apuntes-titulo" className={styles.section}>
      <h2 id="mis-apuntes-titulo" className="title-large">
        Mis apuntes
      </h2>
      <p className={styles.privacy}>
        <Icon name="lock" size="small" />
        <span>Solo tú puedes verlos.</span>
      </p>
      {notes.status === 'ready' && notes.data.length > 0 && (
        <NoteList notes={notes.data} showArticle={false} />
      )}
      {notes.status === 'ready' && notes.data.length === 0 && (
        <p className={styles.muted}>Todavía no tienes apuntes de este artículo.</p>
      )}
      {notes.status === 'error' && (
        <p role="alert" className={styles.error}>
          <Icon name="error" size="small" />
          No se pudieron cargar tus apuntes. Revisa tu conexión y recarga la página.
        </p>
      )}
      <div>
        <Button
          variant="tonal"
          icon="edit_note"
          onClick={() => void create(articleId)}
          disabled={creating}
        >
          Crear apunte
        </Button>
      </div>
      {error && (
        <p role="alert" className={styles.error}>
          <Icon name="error" size="small" />
          No se pudo crear el apunte. Revisa tu conexión e intenta de nuevo.
        </p>
      )}
    </section>
  )
}
