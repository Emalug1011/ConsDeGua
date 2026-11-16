import { Link } from 'react-router'
import { Icon } from '../../ui/Icon'
import styles from './ArticlePager.module.css'
import { getAdjacent } from './catalog'
import { articleLabel, articleShortLabel } from './format'

interface ArticlePagerProps {
  articleId: string
}

/** Enlaces al artículo anterior y al siguiente, en el orden del catálogo. */
export function ArticlePager({ articleId }: ArticlePagerProps) {
  const { anterior, siguiente } = getAdjacent(articleId)

  return (
    <nav aria-label="Artículos vecinos" className={styles.pager}>
      {anterior ? (
        <Link
          to={`/articulo/${anterior.id}`}
          className={`${styles.link} ${styles.previous}`}
          aria-label={`Artículo anterior: ${articleLabel(anterior)}`}
          rel="prev"
        >
          <Icon name="chevron_left" />
          <span className={styles.text}>
            <span className={styles.direction}>Anterior</span>
            <span className={styles.target}>{articleShortLabel(anterior)}</span>
          </span>
        </Link>
      ) : (
        <span />
      )}
      {siguiente && (
        <Link
          to={`/articulo/${siguiente.id}`}
          className={`${styles.link} ${styles.next}`}
          aria-label={`Artículo siguiente: ${articleLabel(siguiente)}`}
          rel="next"
        >
          <span className={styles.text}>
            <span className={styles.direction}>Siguiente</span>
            <span className={styles.target}>{articleShortLabel(siguiente)}</span>
          </span>
          <Icon name="chevron_right" />
        </Link>
      )}
    </nav>
  )
}
