import { useNavigate } from 'react-router'
import { Button } from '../../ui/Button'
import { Card } from '../../ui/Card'
import { getArticle } from '../constitution/catalog'
import { articleLabel } from '../constitution/format'
import styles from './ContinueReadingCard.module.css'
import { useUserSettings } from './useUserSettings'

/** En el índice: el último artículo que la persona leyó, si activó la opción. */
export function ContinueReadingCard() {
  const navigate = useNavigate()
  const state = useUserSettings()
  if (state.status !== 'ready' || !state.settings.rememberReading) return null
  const article = state.settings.lastArticleId
    ? getArticle(state.settings.lastArticleId)
    : undefined
  if (!article) return null

  return (
    <Card as="section" variant="filled" aria-labelledby="seguir-leyendo" className={styles.card}>
      <p id="seguir-leyendo" className={styles.overline}>
        Continúa donde te quedaste
      </p>
      <p className={styles.title}>
        {articleLabel(article)}
        <span className={styles.epigraph}>{article.epigrafe ?? 'Sin epígrafe'}</span>
      </p>
      <div>
        <Button icon="menu_book" onClick={() => void navigate(`/articulo/${article.id}`)}>
          Seguir leyendo
        </Button>
      </div>
    </Card>
  )
}
