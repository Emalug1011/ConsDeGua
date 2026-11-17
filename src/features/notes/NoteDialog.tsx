import { lazy, Suspense } from 'react'
import { Dialog } from '../../ui/Dialog'
import { getArticle } from '../constitution/catalog'
import { articleLabel } from '../constitution/format'
import styles from './NoteDialog.module.css'
import type { NoteDialogControls } from './useNoteDialog'

// El editor (Tiptap) se descarga solo al abrir un apunte.
const NoteDialogBody = lazy(async () => ({
  default: (await import('./NoteDialogBody')).NoteDialogBody,
}))

interface NoteDialogProps {
  controls: NoteDialogControls
}

/** Diálogo para crear o editar un apunte sin salir de la página. */
export function NoteDialog({ controls }: NoteDialogProps) {
  const { state, close } = controls
  const article = state.articleId ? getArticle(state.articleId) : undefined
  const title = article ? `Apunte · ${articleLabel(article)}` : 'Apunte'

  return (
    <Dialog
      open={state.open}
      onClose={close}
      title={title}
      size="large"
      contentKey={String(state.session)}
    >
      {state.open && (
        <Suspense
          fallback={
            <p role="status" className={styles.muted}>
              Cargando editor…
            </p>
          }
        >
          <NoteDialogBody
            key={state.session}
            noteId={state.noteId}
            articleId={state.articleId}
            onDeleted={close}
          />
        </Suspense>
      )}
    </Dialog>
  )
}
