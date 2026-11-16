import { useNavigate } from 'react-router'
import { Button } from '../../ui/Button'
import { Icon } from '../../ui/Icon'
import styles from './ArticleRelations.module.css'
import { getRelated } from './catalog'
import { RelationList } from './RelationList'

interface ArticleRelationsProps {
  articleId: string
}

const articlePath = (id: string) => `/articulo/${id}`

/** Relaciones del artículo según el análisis del catálogo (no oficial). */
export function ArticleRelations({ articleId }: ArticleRelationsProps) {
  const navigate = useNavigate()
  const { articulos, bloques } = getRelated(articleId)

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
        <Button
          variant="tonal"
          icon="hub"
          onClick={() => void navigate(`/relaciones/${articleId}`)}
        >
          Ver mapa de relaciones
        </Button>
      </div>
      <RelationList articulos={articulos} bloques={bloques} linkTo={articlePath} />
    </section>
  )
}
