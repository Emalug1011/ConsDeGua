import { useNavigate } from 'react-router'
import { Button } from '../../ui/Button'
import { Dialog } from '../../ui/Dialog'
import { getArticle } from '../constitution/catalog'
import { articleLabel } from '../constitution/format'
import { RelationPreview } from '../constitution/RelationPreview'
import { RelationMapView } from './RelationMapView'
import type { RelationExplorer } from './useRelationExplorer'

interface RelationExplorerDialogProps {
  explorer: RelationExplorer
}

/**
 * Diálogo para explorar relaciones sin salir de la página: alterna entre la
 * vista previa de un artículo y el mapa de relaciones, con "Volver".
 */
export function RelationExplorerDialog({ explorer }: RelationExplorerDialogProps) {
  const navigate = useNavigate()
  const { view } = explorer
  if (!view) return null

  const mainId = view.kind === 'map' ? view.centerId : view.articleId
  const article = getArticle(mainId)
  if (!article) return null

  const openArticlePage = () => {
    explorer.close()
    void navigate(`/articulo/${article.id}`)
  }

  const isMap = view.kind === 'map'
  const contentKey = isMap ? `mapa-${view.centerId}` : `vista-${view.articleId}-${view.contextId}`
  const context = view.kind === 'preview' ? getArticle(view.contextId) : undefined

  return (
    <Dialog
      open={explorer.open}
      onClose={explorer.close}
      title={isMap ? `Mapa de relaciones de ${articleLabel(article)}` : articleLabel(article)}
      size={isMap ? 'large' : 'default'}
      contentKey={contentKey}
      actions={
        <>
          {explorer.canGoBack && (
            <Button variant="text" icon="arrow_back" onClick={explorer.back}>
              Volver
            </Button>
          )}
          <Button variant="text" onClick={openArticlePage}>
            Abrir artículo
          </Button>
          {!isMap && (
            <Button
              variant="tonal"
              icon="hub"
              onClick={() => explorer.push({ kind: 'map', centerId: article.id })}
            >
              Centrar el mapa aquí
            </Button>
          )}
        </>
      }
    >
      {isMap ? (
        <RelationMapView
          key={contentKey}
          centerId={article.id}
          inDialog
          onSelect={(relatedId) =>
            explorer.push({ kind: 'preview', articleId: relatedId, contextId: article.id })
          }
        />
      ) : (
        context && <RelationPreview key={contentKey} article={article} context={context} />
      )}
    </Dialog>
  )
}
