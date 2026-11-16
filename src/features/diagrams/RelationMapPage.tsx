import { Link, useParams } from 'react-router'
import { getArticle } from '../constitution/catalog'
import { articleLabel } from '../constitution/format'
import { RelationExplorerDialog } from './RelationExplorerDialog'
import styles from './RelationMapPage.module.css'
import { RelationMapView } from './RelationMapView'
import { useRelationExplorer } from './useRelationExplorer'

/** Mapa de relaciones de un artículo: vista de solo lectura generada del catálogo. */
export function RelationMapPage() {
  const { id = '' } = useParams()
  const article = getArticle(id)
  const explorer = useRelationExplorer()

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

      <RelationMapView
        key={article.id}
        centerId={article.id}
        onSelect={(relatedId) => explorer.openPreview(relatedId, article.id)}
      />

      <RelationExplorerDialog explorer={explorer} />
    </div>
  )
}
