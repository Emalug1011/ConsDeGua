import { Link } from 'react-router'
import type { Article, RelatedArticle, RelatedBlock } from './catalog'
import { articleLabel, articleShortLabel, relationPhrase } from './format'
import styles from './RelationList.module.css'
import { ReviewChip } from './ReviewChip'

type RelationListProps = {
  articulos: readonly RelatedArticle[]
  bloques: readonly RelatedBlock[]
} & (
  | {
      /** Destino del enlace de cada artículo relacionado. */
      linkTo: (articleId: string) => string
      onSelect?: never
    }
  | {
      /** Abre el artículo relacionado sin salir de la página (por ejemplo, en un diálogo). */
      onSelect: (articleId: string) => void
      linkTo?: never
    }
)

function accessibleName(article: Article): string {
  return `${articleLabel(article)}${article.epigrafe ? `: ${article.epigrafe}` : ''}`
}

/** Lista de relaciones con su frase, su nota y su nivel de cotejo. */
export function RelationList({ articulos, bloques, linkTo, onSelect }: RelationListProps) {
  const target = (article: Article) => {
    const content = (
      <>
        <span className="label-large">{articleShortLabel(article)}</span>
        <span>{article.epigrafe ?? 'Sin epígrafe'}</span>
      </>
    )
    if (onSelect) {
      return (
        <button
          type="button"
          className={`${styles.link} ${styles.button}`}
          onClick={() => onSelect(article.id)}
          aria-label={`Ver ${accessibleName(article)}`}
        >
          {content}
        </button>
      )
    }
    return (
      <Link to={linkTo(article.id)} className={styles.link} aria-label={accessibleName(article)}>
        {content}
      </Link>
    )
  }

  return (
    <ul className={styles.list}>
      {articulos.map((relation) => (
        <li
          key={`${relation.articulo.id}-${relation.tipo}-${relation.sentido}`}
          className={styles.item}
        >
          <p className={styles.phrase}>{relationPhrase(relation.tipo, relation.sentido)}</p>
          {target(relation.articulo)}
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
          {relation.sentido === 'entrante' && target(relation.articulo)}
          <p className={styles.note}>{relation.nota}</p>
          <div>
            <ReviewChip cotejo={relation.cotejo} />
          </div>
        </li>
      ))}
    </ul>
  )
}
