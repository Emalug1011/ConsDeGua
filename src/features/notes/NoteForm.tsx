import type { JSONContent } from '@tiptap/core'
import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { Button } from '../../ui/Button'
import { Dialog } from '../../ui/Dialog'
import { Icon } from '../../ui/Icon'
import { TextField } from '../../ui/TextField'
import { getArticle } from '../constitution/catalog'
import { articleLabel } from '../constitution/format'
import { track } from '../metrics/track'
import { NoteEditor } from './NoteEditor'
import styles from './NoteForm.module.css'
import { deleteNote } from './service'
import { NOTE_TITLE_MAX_LENGTH, type Note } from './types'
import { useAutosave, type SaveStatus } from './useAutosave'

const STATUS_TEXT: Record<SaveStatus, string> = {
  idle: 'Sin cambios',
  pending: 'Cambios sin guardar',
  saving: 'Guardando…',
  saved: 'Guardado',
  error: 'No se pudo guardar. Revisa tu conexión e intenta de nuevo.',
  too_large: 'El apunte es demasiado grande para guardarse. Acórtalo o divídelo en varios apuntes.',
}

/** Convierte lo que escribe la persona ("47", "art. 47", "t23") en un id del catálogo. */
function parseArticleInput(value: string): string | null {
  const match = /^(?:art(?:[íi]culo)?\.?\s*)?(t?\s*\d{1,3})$/i.exec(value.trim())
  if (!match?.[1]) return null
  const id = match[1].replace(/\s/g, '').toUpperCase()
  return getArticle(id) ? id : null
}

interface NoteFormProps {
  note: Note
}

export function NoteForm({ note }: NoteFormProps) {
  const navigate = useNavigate()
  const [title, setTitle] = useState(note.title)
  const [articleInput, setArticleInput] = useState(note.articleId ?? '')
  const [articleId, setArticleId] = useState<string | null>(note.articleId)
  // Valores actuales para el autoguardado: el editor puede conservar callbacks anteriores.
  const content = useRef<JSONContent>(note.content)
  const titleRef = useRef(note.title)
  const articleRef = useRef<string | null>(note.articleId)
  const { status, schedule, flush, cancel } = useAutosave(note.id)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleteError, setDeleteError] = useState(false)

  useEffect(() => {
    track('note_open')
  }, [])

  const save = () =>
    schedule({ title: titleRef.current, content: content.current, articleId: articleRef.current })

  const trimmedArticle = articleInput.trim()
  const parsedArticle = parseArticleInput(articleInput)
  const articleInvalid = trimmedArticle !== '' && parsedArticle === null
  const linkedArticle = articleId ? getArticle(articleId) : undefined
  const failed = status === 'error' || status === 'too_large'

  const handleDelete = async () => {
    cancel()
    try {
      await deleteNote(note.id)
      setConfirmDelete(false)
      await navigate('/apuntes', { replace: true })
    } catch {
      setDeleteError(true)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.topRow}>
        <Link to="/apuntes" className={styles.back}>
          <Icon name="arrow_back" size="small" />
          Mis apuntes
        </Link>
        <p role="status" className={`${styles.status} ${failed ? styles.statusError : ''}`}>
          {failed && <Icon name="error" size="small" />}
          {STATUS_TEXT[status]}
        </p>
      </div>
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

      <TextField
        label="Artículo (opcional)"
        value={articleInput}
        placeholder="Por ejemplo, 47 o T23"
        autoComplete="off"
        error={
          articleInvalid
            ? 'No existe ese artículo. Escribe un número del 1 al 281 o de T1 a T27.'
            : undefined
        }
        supportingText={
          linkedArticle
            ? `${articleLabel(linkedArticle)}: ${linkedArticle.epigrafe ?? 'Sin epígrafe'}`
            : 'Liga el apunte a un artículo para verlo también desde ese artículo.'
        }
        onChange={(event) => {
          const value = event.target.value
          setArticleInput(value)
          const next = value.trim() === '' ? null : parseArticleInput(value)
          // Solo se guarda un artículo válido, o ninguno si el campo queda vacío.
          if (value.trim() === '' || next) {
            setArticleId(next)
            articleRef.current = next
            save()
          }
        }}
      />
      {linkedArticle && (
        <Link to={`/articulo/${linkedArticle.id}`} className={styles.articleLink}>
          Ver {articleLabel(linkedArticle)}
        </Link>
      )}

      <NoteEditor
        content={note.content}
        label="Contenido del apunte"
        onChange={(next) => {
          content.current = next
          save()
        }}
      />

      <div>
        <Button variant="outlined" icon="delete" onClick={() => setConfirmDelete(true)}>
          Eliminar apunte
        </Button>
      </div>

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
