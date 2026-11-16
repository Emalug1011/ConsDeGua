import { Link } from 'react-router'
import type { Article } from './catalog'
import styles from './ArticleList.module.css'
import { articleLabel, articleShortLabel } from './format'

interface ArticleListProps {
  articles: readonly Article[]
}

/** Lista de enlaces a artículos: número y epígrafe del catálogo. */
export function ArticleList({ articles }: ArticleListProps) {
  return (
    <ul className={styles.list}>
      {articles.map((article) => (
        <li key={article.id}>
          <Link
            to={`/articulo/${article.id}`}
            className={styles.item}
            aria-label={`${articleLabel(article)}${article.epigrafe ? `: ${article.epigrafe}` : ''}${article.derogado ? ' (derogado)' : ''}`}
          >
            <span className={styles.number}>{articleShortLabel(article)}</span>
            <span className={styles.epigraph}>
              {article.epigrafe ?? 'Sin epígrafe'}
              {article.derogado && <span className={styles.repealed}> · Derogado</span>}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  )
}
