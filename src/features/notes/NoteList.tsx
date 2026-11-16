import { Link } from 'react-router'
import { getArticle } from '../constitution/catalog'
import { articleShortLabel } from '../constitution/format'
import styles from './NoteList.module.css'
import type { Note } from './types'

const DATE_FORMAT = new Intl.DateTimeFormat('es-GT', {
  dateStyle: 'medium',
  timeStyle: 'short',
  timeZone: 'America/Guatemala',
})

interface NoteListProps {
  notes: readonly Note[]
  /** Muestra el artículo ligado (no hace falta dentro de la vista de un artículo). */
  showArticle?: boolean
}

export function NoteList({ notes, showArticle = true }: NoteListProps) {
  return (
    <ul className={styles.list}>
      {notes.map((note) => {
        const article = note.articleId ? getArticle(note.articleId) : undefined
        const title = note.title.trim() || 'Sin título'
        return (
          <li key={note.id}>
            <Link to={`/apuntes/${note.id}`} className={styles.item}>
              <span className={styles.title}>{title}</span>
              <span className={styles.meta}>
                {showArticle && article && <span>{articleShortLabel(article)} · </span>}
                {note.updatedAt ? `Editado ${DATE_FORMAT.format(note.updatedAt)}` : 'Sin guardar'}
              </span>
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
