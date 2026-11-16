import { Button } from '../../ui/Button'
import { Icon } from '../../ui/Icon'
import { RelationExplorerDialog } from '../diagrams/RelationExplorerDialog'
import { useRelationExplorer } from '../diagrams/useRelationExplorer'
import styles from './ArticleRelations.module.css'
import { getRelated } from './catalog'
import { RelationList } from './RelationList'

interface ArticleRelationsProps {
  articleId: string
}

/** Relaciones del artículo según el análisis del catálogo (no oficial). */
export function ArticleRelations({ articleId }: ArticleRelationsProps) {
  const { articulos, bloques } = getRelated(articleId)
  const explorer = useRelationExplorer()

  if (articulos.length === 0 && bloques.length === 0) return null

  return (
    <section aria-labelledby="relaciones-titulo" className={styles.section}>
      <h2 id="relaciones-titulo" className="title-large">
        Artículos relacionados
      </h2>
      <p className={styles.warning}>
        <Icon name="warning" size="small" />
        <span>Validar sugerencia</span>
      </p>
      <div>
        <Button variant="tonal" icon="hub" onClick={() => explorer.openMap(articleId)}>
          Ver mapa de relaciones
        </Button>
      </div>
      <RelationList
        articulos={articulos}
        bloques={bloques}
        onSelect={(relatedId) => explorer.openPreview(relatedId, articleId)}
      />

      <RelationExplorerDialog explorer={explorer} />
    </section>
  )
}
