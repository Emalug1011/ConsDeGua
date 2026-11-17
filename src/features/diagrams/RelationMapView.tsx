import { useEffect, useMemo, useState } from 'react'
import { Icon } from '../../ui/Icon'
import { getArticle, getRelated } from '../constitution/catalog'
import { articleLabel } from '../constitution/format'
import { RelationList } from '../constitution/RelationList'
import { track } from '../metrics/track'
import { RelationFilterChips } from './RelationFilterChips'
import { buildRelationGraph, type RelationFilters } from './relationGraph'
import { RELATION_TYPE_LABELS, REVIEW_LABELS } from './relationLabels'
import { RelationMap } from './RelationMap'
import styles from './RelationMapView.module.css'
import { RelationSelectContext } from './RelationSelectContext'

const ALL_FILTERS: RelationFilters = {
  tipos: new Set(Object.keys(RELATION_TYPE_LABELS)),
  cotejos: new Set(Object.keys(REVIEW_LABELS)),
}

interface RelationMapViewProps {
  centerId: string
  /** Al tocar un artículo vecino (en el lienzo o en la lista). */
  onSelect: (articleId: string) => void
  /** Dentro de un diálogo: encabezado de nivel 3 y lienzo más bajo. */
  inDialog?: boolean
}

/** Mapa de relaciones de un artículo con sus filtros y la lista accesible. */
export function RelationMapView({ centerId, onSelect, inDialog = false }: RelationMapViewProps) {
  const [filters, setFilters] = useState<RelationFilters>(ALL_FILTERS)
  const graph = useMemo(() => buildRelationGraph(centerId, filters), [centerId, filters])
  const center = getArticle(centerId)

  useEffect(() => {
    if (center) track('relation_map_open', { article_id: center.id })
  }, [center])

  if (!center) return null

  const related = getRelated(center.id)
  const hasRelations = related.articulos.length > 0 || related.bloques.length > 0
  const visible = graph.articulos.length + graph.bloques.length
  const ListHeading = inDialog ? 'h3' : 'h2'

  return (
    <div className={styles.view}>
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
            <RelationSelectContext value={onSelect}>
              <RelationMap
                key={center.id}
                nodes={graph.nodes}
                edges={graph.edges}
                label={`Mapa de relaciones de ${articleLabel(center)}`}
                compact={inDialog}
              />
            </RelationSelectContext>
          )}

          <section className={styles.listSection}>
            <ListHeading className="title-medium">
              {visible === 1 ? '1 relación' : `${visible} relaciones`}
            </ListHeading>
            <RelationList articulos={graph.articulos} bloques={graph.bloques} onSelect={onSelect} />
          </section>
        </>
      )}
    </div>
  )
}
