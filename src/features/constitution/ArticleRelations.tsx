import { useState } from 'react'
import { Button } from '../../ui/Button'
import { Icon } from '../../ui/Icon'
import { RelationExplorerDialog } from '../diagrams/RelationExplorerDialog'
import { useRelationExplorer } from '../diagrams/useRelationExplorer'
import { DeleteRelationDialog } from '../relations/DeleteRelationDialog'
import { RelationFormDialog } from '../relations/RelationFormDialog'
import type { UserRelation } from '../relations/types'
import { useArticleRelations, useMyRelations } from '../relations/useMyRelations'
import styles from './ArticleRelations.module.css'
import { RelationList } from './RelationList'

interface ArticleRelationsProps {
  articleId: string
}

/** Relaciones del artículo: las del catálogo (no oficiales) y las propias de la persona. */
export function ArticleRelations({ articleId }: ArticleRelationsProps) {
  const { catalogo, propias } = useArticleRelations(articleId)
  const mine = useMyRelations()
  const explorer = useRelationExplorer()
  const [form, setForm] = useState<{ session: number; open: boolean; relation?: UserRelation }>({
    session: 0,
    open: false,
  })
  const [toDelete, setToDelete] = useState<UserRelation | undefined>()

  const articulos = [...catalogo.articulos, ...propias.articulos]
  const bloques = [...catalogo.bloques, ...propias.bloques]
  const hasCatalog = catalogo.articulos.length + catalogo.bloques.length > 0
  const hasAny = articulos.length + bloques.length > 0
  const find = (relationId: string) => mine.find((relation) => relation.id === relationId)
  const openForm = (relation?: UserRelation) =>
    setForm((current) => ({ session: current.session + 1, open: true, relation }))

  return (
    <section aria-labelledby="relaciones-titulo" className={styles.section}>
      <h2 id="relaciones-titulo" className="title-large">
        Artículos relacionados
      </h2>
      {hasCatalog && (
        <p className={styles.warning}>
          <Icon name="warning" size="small" />
          <span>Validar sugerencia</span>
        </p>
      )}
      <div className={styles.buttons}>
        {hasAny && (
          <Button variant="tonal" icon="hub" onClick={() => explorer.openMap(articleId)}>
            Ver mapa de relaciones
          </Button>
        )}
        <Button variant="outlined" icon="add_link" onClick={() => openForm()}>
          Agregar relación
        </Button>
      </div>
      {hasAny ? (
        <RelationList
          articulos={articulos}
          bloques={bloques}
          onSelect={(relatedId) => explorer.openPreview(relatedId, articleId)}
          onEditOwn={(relationId) => openForm(find(relationId))}
          onDeleteOwn={(relationId) => setToDelete(find(relationId))}
        />
      ) : (
        <p className={styles.empty}>
          Este artículo no tiene relaciones en el catálogo. Agrega una tuya.
        </p>
      )}

      <RelationExplorerDialog explorer={explorer} />
      <RelationFormDialog
        key={form.session}
        open={form.open}
        onClose={() => setForm((current) => ({ ...current, open: false }))}
        articleId={articleId}
        relation={form.relation}
      />
      <DeleteRelationDialog relation={toDelete} onClose={() => setToDelete(undefined)} />
    </section>
  )
}
