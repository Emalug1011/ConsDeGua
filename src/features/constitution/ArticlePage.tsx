import { useEffect } from 'react'
import { Link, useParams } from 'react-router'
import { Chip } from '../../ui/Chip'
import { track } from '../metrics/track'
import { ArticleNotes } from '../notes/ArticleNotes'
import { ArticlePager } from './ArticlePager'
import { ArticleRelations } from './ArticleRelations'
import { getArticle } from './catalog'
import styles from './ArticlePage.module.css'
import { articleLabel, articleLocation } from './format'

export function ArticlePage() {
  const { id = '' } = useParams()
  const article = getArticle(id)
  const articleId = article?.id

  useEffect(() => {
    if (articleId) track('article_open', { article_id: articleId })
  }, [articleId])

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
    <article className={styles.page} aria-labelledby="articulo-titulo">
      <header className={styles.header}>
        <p className={styles.location}>{articleLocation(article)}</p>
        <h1 id="articulo-titulo" className={styles.heading}>
          <span className="title-medium">{articleLabel(article)}</span>
          <span className="headline-small">{article.epigrafe ?? 'Sin epígrafe'}</span>
        </h1>
        {article.derogado && (
          <div>
            <Chip label="Derogado" icon="block" />
          </div>
        )}
      </header>

      <section aria-label="Texto del artículo" className={styles.literal}>
        {article.texto.split('\n').map((paragraph, index) => (
          <p key={index} className={styles.text}>
            {paragraph}
          </p>
        ))}
        <p className={styles.source}>
          Texto cotejado con la edición digital 2020 de la Constitución.
        </p>
      </section>

      <ArticlePager articleId={article.id} />

      <ArticleNotes articleId={article.id} />

      <ArticleRelations articleId={article.id} />
    </article>
  )
}
