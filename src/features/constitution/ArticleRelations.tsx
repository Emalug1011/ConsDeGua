import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router'
import { Button } from '../../ui/Button'
import { Icon } from '../../ui/Icon'
import { track } from '../metrics/track'
import styles from './ArticleRelations.module.css'
import { getArticle, getRelated } from './catalog'
import { RelationList } from './RelationList'
import { RelationPreviewDialog } from './RelationPreviewDialog'

interface ArticleRelationsProps {
  articleId: string
}

/** Relaciones del artículo según el análisis del catálogo (no oficial). */
export function ArticleRelations({ articleId }: ArticleRelationsProps) {
  const navigate = useNavigate()
  const { articulos, bloques } = getRelated(articleId)
  const [previewId, setPreviewId] = useState<string | null>(null)
  const [previewOpen, setPreviewOpen] = useState(false)

  const openPreview = useCallback((relatedId: string) => {
    setPreviewId(relatedId)
    setPreviewOpen(true)
    track('article_open', { article_id: relatedId })
  }, [])

  const center = getArticle(articleId)
  if (!center || (articulos.length === 0 && bloques.length === 0)) return null

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
        <Button
          variant="tonal"
          icon="hub"
          onClick={() => void navigate(`/relaciones/${articleId}`)}
        >
          Ver mapa de relaciones
        </Button>
      </div>
      <RelationList articulos={articulos} bloques={bloques} onSelect={openPreview} />

      <RelationPreviewDialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        article={previewId ? getArticle(previewId) : undefined}
        center={center}
        articulos={articulos.filter((r) => r.articulo.id === previewId)}
        bloques={bloques.filter((r) => r.articulo.id === previewId)}
      />
    </section>
  )
}
