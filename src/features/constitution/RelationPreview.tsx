import { Chip } from '../../ui/Chip'
import { getRelated, type Article } from './catalog'
import { articleLabel, articleLocation, relationPhrase } from './format'
import styles from './RelationPreview.module.css'
import { ReviewChip } from './ReviewChip'

interface RelationPreviewProps {
  /** Artículo que se muestra. */
  article: Article
  /** Artículo desde el que se abrió (el de la página o el central del mapa). */
  context: Article
}

/** Vista previa de un artículo relacionado: ubicación, relación con el de origen y texto. */
export function RelationPreview({ article, context }: RelationPreviewProps) {
  const related = getRelated(context.id)
  const articulos = related.articulos.filter((r) => r.articulo.id === article.id)
  const bloques = related.bloques.filter((r) => r.articulo.id === article.id)

  return (
    <>
      <div className={styles.header}>
        <p className={styles.location}>{articleLocation(article)}</p>
        <p className={styles.epigraph}>{article.epigrafe ?? 'Sin epígrafe'}</p>
        {article.derogado && (
          <div>
            <Chip label="Derogado" icon="block" />
          </div>
        )}
      </div>

      {(articulos.length > 0 || bloques.length > 0) && (
        <section aria-label={`Relación con ${articleLabel(context)}`} className={styles.relations}>
          {articulos.map((relation) => (
            <div key={`${relation.tipo}-${relation.sentido}`} className={styles.relation}>
              <p className={styles.phrase}>{relationPhrase(relation.tipo, relation.sentido)}</p>
              <p className={styles.note}>{relation.nota}</p>
              <div>
                <ReviewChip cotejo={relation.cotejo} />
              </div>
            </div>
          ))}
          {bloques.map((relation) => (
            <div key={`bloque-${relation.tipo}`} className={styles.relation}>
              <p className={styles.phrase}>{relationPhrase(relation.tipo, 'entrante')} su bloque</p>
              <p className={styles.note}>{relation.nota}</p>
              <div>
                <ReviewChip cotejo={relation.cotejo} />
              </div>
            </div>
          ))}
        </section>
      )}

      <section aria-label="Texto del artículo" className={styles.literal}>
        {article.texto.split('\n').map((paragraph, index) => (
          <p key={index} className={styles.text}>
            {paragraph}
          </p>
        ))}
      </section>
    </>
  )
}
