import { Link } from 'react-router'
import type { Article, RelatedArticle, RelatedBlock } from './catalog'
import { articleLabel, articleShortLabel, relationPhrase } from './format'
import styles from './RelationList.module.css'
import { ReviewChip } from './ReviewChip'

interface RelationListProps {
  articulos: readonly RelatedArticle[]
  bloques: readonly RelatedBlock[]
  /** Destino del enlace de cada artículo relacionado. */
  linkTo: (articleId: string) => string
}

function accessibleName(article: Article): string {
  return `${articleLabel(article)}${article.epigrafe ? `: ${article.epigrafe}` : ''}`
}

/** Lista de relaciones con su frase, su nota y su nivel de cotejo. */
export function RelationList({ articulos, bloques, linkTo }: RelationListProps) {
  return (
    <ul className={styles.list}>
      {articulos.map((relation) => (
        <li
          key={`${relation.articulo.id}-${relation.tipo}-${relation.sentido}`}
          className={styles.item}
        >
          <p className={styles.phrase}>{relationPhrase(relation.tipo, relation.sentido)}</p>
          <Link
            to={linkTo(relation.articulo.id)}
            className={styles.link}
            aria-label={accessibleName(relation.articulo)}
          >
            <span className="label-large">{articleShortLabel(relation.articulo)}</span>
            <span>{relation.articulo.epigrafe ?? 'Sin epígrafe'}</span>
          </Link>
          <p className={styles.note}>{relation.nota}</p>
          <div>
            <ReviewChip cotejo={relation.cotejo} />
          </div>
        </li>
      ))}

      {bloques.map((relation) => (
        <li key={`bloque-${relation.articulo.id}-${relation.tipo}`} className={styles.item}>
          <p className={styles.phrase}>
            {relation.sentido === 'saliente'
              ? `${relationPhrase(relation.tipo, 'saliente')} el bloque`
              : `${relationPhrase(relation.tipo, 'entrante')} su bloque`}
          </p>
          <p className={styles.block}>
            Título {relation.bloque.titulo}, capítulo {relation.bloque.capitulo} (artículos{' '}
            {relation.bloque.desdeArticulo} a {relation.bloque.hastaArticulo})
          </p>
          {relation.sentido === 'entrante' && (
            <Link
              to={linkTo(relation.articulo.id)}
              className={styles.link}
              aria-label={accessibleName(relation.articulo)}
            >
              <span className="label-large">{articleShortLabel(relation.articulo)}</span>
              <span>{relation.articulo.epigrafe ?? 'Sin epígrafe'}</span>
            </Link>
          )}
          <p className={styles.note}>{relation.nota}</p>
          <div>
            <ReviewChip cotejo={relation.cotejo} />
          </div>
        </li>
      ))}
    </ul>
  )
}
