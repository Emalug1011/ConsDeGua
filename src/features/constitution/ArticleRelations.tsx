import { Link } from 'react-router'
import { Icon } from '../../ui/Icon'
import { getRelated, getRelationsInfo } from './catalog'
import styles from './ArticleRelations.module.css'
import { articleLabel, articleShortLabel, relationPhrase } from './format'
import { ReviewChip } from './ReviewChip'

interface ArticleRelationsProps {
  articleId: string
}

/** Relaciones del artículo según el análisis del catálogo (no oficial). */
export function ArticleRelations({ articleId }: ArticleRelationsProps) {
  const { articulos, bloques } = getRelated(articleId)
  const { advertencia } = getRelationsInfo()

  if (articulos.length === 0 && bloques.length === 0) return null

  return (
    <section aria-labelledby="relaciones-titulo" className={styles.section}>
      <h2 id="relaciones-titulo" className="title-large">
        Artículos relacionados
      </h2>
      <p className={styles.warning}>
        <Icon name="warning" size="small" />
        <span>{advertencia}</span>
      </p>

      <ul className={styles.list}>
        {articulos.map((relation) => (
          <li
            key={`${relation.articulo.id}-${relation.tipo}-${relation.sentido}`}
            className={styles.item}
          >
            <p className={styles.phrase}>{relationPhrase(relation.tipo, relation.sentido)}</p>
            <Link
              to={`/articulo/${relation.articulo.id}`}
              className={styles.link}
              aria-label={`${articleLabel(relation.articulo)}${relation.articulo.epigrafe ? `: ${relation.articulo.epigrafe}` : ''}`}
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
                to={`/articulo/${relation.articulo.id}`}
                className={styles.link}
                aria-label={`${articleLabel(relation.articulo)}${relation.articulo.epigrafe ? `: ${relation.articulo.epigrafe}` : ''}`}
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
    </section>
  )
}
