import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router'
import { Icon } from '../../ui/Icon'
import { getArticle, getRelated } from '../constitution/catalog'
import { articleLabel } from '../constitution/format'
import { RelationList } from '../constitution/RelationList'
import { RelationPreviewDialog } from '../constitution/RelationPreviewDialog'
import { track } from '../metrics/track'
import { RelationFilterChips } from './RelationFilterChips'
import { buildRelationGraph, type RelationFilters } from './relationGraph'
import { RELATION_TYPE_LABELS, REVIEW_LABELS } from './relationLabels'
import { RelationMap } from './RelationMap'
import { RelationSelectContext } from './RelationSelectContext'
import styles from './RelationMapPage.module.css'

const ALL_FILTERS: RelationFilters = {
  tipos: new Set(Object.keys(RELATION_TYPE_LABELS)),
  cotejos: new Set(Object.keys(REVIEW_LABELS)),
}

/** Mapa de relaciones de un artículo: vista de solo lectura generada del catálogo. */
export function RelationMapPage() {
  const { id = '' } = useParams()
  const article = getArticle(id)
  const articleId = article?.id
  const [filters, setFilters] = useState<RelationFilters>(ALL_FILTERS)
  const graph = useMemo(() => buildRelationGraph(id, filters), [id, filters])
  const [previewId, setPreviewId] = useState<string | null>(null)
  const [previewOpen, setPreviewOpen] = useState(false)

  const openPreview = useCallback((relatedId: string) => {
    setPreviewId(relatedId)
    setPreviewOpen(true)
    track('article_open', { article_id: relatedId })
  }, [])

  useEffect(() => {
    if (articleId) track('relation_map_open', { article_id: articleId })
  }, [articleId])

  if (!article) {
    return (
      <div className={styles.page}>
        <h1 className="headline-small">No encontramos ese artículo</h1>
        <p className="body-large">Revisa el número o búscalo desde el índice.</p>
        <Link to="/" className="label-large">
          Ir al índice
        </Link>
      </div>
    )
  }

  const related = getRelated(article.id)
  const hasRelations = related.articulos.length > 0 || related.bloques.length > 0
  const visible = graph.articulos.length + graph.bloques.length

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <p className={styles.overline}>Mapa de relaciones</p>
        <h1 className={styles.heading}>
          <span className="title-medium">{articleLabel(article)}</span>
          <span className="headline-small">{article.epigrafe ?? 'Sin epígrafe'}</span>
        </h1>
        <Link to={`/articulo/${article.id}`} className="label-large">
          Ver texto del artículo
        </Link>
      </header>

      <p className={styles.warning}>
        <Icon name="warning" size="small" />
        <span>Validar sugerencia</span>
      </p>

      {!hasRelations ? (
        <p className={styles.empty}>Este artículo no tiene relaciones en el análisis.</p>
      ) : (
        <>
          <RelationFilterChips filters={filters} onChange={setFilters} />

          {visible === 0 ? (
            <p className={styles.empty}>
              Ninguna relación coincide con los filtros. Activa más tipos o cotejos.
            </p>
          ) : (
            <RelationSelectContext value={openPreview}>
              <RelationMap
                key={article.id}
                nodes={graph.nodes}
                edges={graph.edges}
                label={`Mapa de relaciones de ${articleLabel(article)}`}
              />
            </RelationSelectContext>
          )}

          <section aria-labelledby="lista-relaciones" className={styles.listSection}>
            <h2 id="lista-relaciones" className="title-medium">
              {visible === 1 ? '1 relación' : `${visible} relaciones`}
            </h2>
            <RelationList
              articulos={graph.articulos}
              bloques={graph.bloques}
              onSelect={openPreview}
            />
          </section>
        </>
      )}

      <RelationPreviewDialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        article={previewId ? getArticle(previewId) : undefined}
        center={article}
        articulos={related.articulos.filter((r) => r.articulo.id === previewId)}
        bloques={related.bloques.filter((r) => r.articulo.id === previewId)}
      />
    </div>
  )
}
