import { useState } from 'react'
import { Button } from '../../ui/Button'
import { Dialog } from '../../ui/Dialog'
import { Icon } from '../../ui/Icon'
import { whenSaved } from '../../lib/whenSaved'
import { track } from '../metrics/track'
import styles from './RelationFormDialog.module.css'
import { deleteRelation } from './service'
import type { UserRelation } from './types'

interface DeleteRelationDialogProps {
  relation: UserRelation | undefined
  onClose: () => void
}

/** Confirmación para borrar una relación propia. */
export function DeleteRelationDialog({ relation, onClose }: DeleteRelationDialogProps) {
  const [error, setError] = useState(false)

  const confirm = async () => {
    if (!relation) return
    try {
      await whenSaved(deleteRelation(relation.id))
      track('relation_delete', { article_id: relation.desde })
      setError(false)
      onClose()
    } catch {
      setError(true)
    }
  }

  return (
    <Dialog
      open={Boolean(relation)}
      onClose={onClose}
      title="¿Eliminar esta relación?"
      closeLabel="Cancelar"
      actions={
        <Button variant="filled" icon="delete" onClick={() => void confirm()}>
          Eliminar
        </Button>
      }
    >
      <p>Se borrará solo tu relación; las del catálogo no cambian.</p>
      {error && (
        <p role="alert" className={styles.error}>
          <Icon name="error" size="small" />
          No se pudo eliminar. Revisa tu conexión e intenta de nuevo.
        </p>
      )}
    </Dialog>
  )
}
