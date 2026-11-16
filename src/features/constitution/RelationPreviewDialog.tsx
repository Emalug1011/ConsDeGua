import { useNavigate } from 'react-router'
import { Button } from '../../ui/Button'
import { Chip } from '../../ui/Chip'
import { Dialog } from '../../ui/Dialog'
import type { Article, RelatedArticle, RelatedBlock } from './catalog'
import { articleLabel, articleLocation, relationPhrase } from './format'
import { ReviewChip } from './ReviewChip'
import styles from './RelationPreviewDialog.module.css'

interface RelationPreviewDialogProps {
  open: boolean
  onClose: () => void
  /** Artículo que se ve en el diálogo. */
  article: Article | undefined
  /** Artículo desde el que se abrió la vista previa (el central del mapa o el de la página). */
  center: Article
  /** Relaciones entre el artículo central y el que se ve. */
  articulos: readonly RelatedArticle[]
  bloques: readonly RelatedBlock[]
}

/** Vista previa de un artículo relacionado, sin salir de la página. */
export function RelationPreviewDialog({
  open,
  onClose,
  article,
  center,
  articulos,
  bloques,
}: RelationPreviewDialogProps) {
  const navigate = useNavigate()
  if (!article) return null

  const go = (path: string) => {
    onClose()
    void navigate(path)
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={articleLabel(article)}
      actions={
        <>
          <Button variant="text" onClick={() => go(`/articulo/${article.id}`)}>
            Abrir artículo
          </Button>
          <Button variant="tonal" icon="hub" onClick={() => go(`/relaciones/${article.id}`)}>
            Centrar el mapa aquí
          </Button>
        </>
      }
    >
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
        <section aria-label={`Relación con ${articleLabel(center)}`} className={styles.relations}>
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
    </Dialog>
  )
}
