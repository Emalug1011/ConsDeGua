import { useCallback, useMemo, useState } from 'react'
import { track } from '../metrics/track'

/** Lo que muestra el explorador: la vista previa de un artículo o el mapa de uno. */
export type ExplorerView =
  { kind: 'preview'; articleId: string; contextId: string } | { kind: 'map'; centerId: string }

export interface RelationExplorer {
  open: boolean
  /** Vista actual (la última del historial). */
  view: ExplorerView | undefined
  canGoBack: boolean
  openPreview: (articleId: string, contextId: string) => void
  openMap: (centerId: string) => void
  /** Pasa a otra vista dentro del mismo diálogo, guardando la anterior para "Volver". */
  push: (view: ExplorerView) => void
  back: () => void
  close: () => void
}

function trackView(view: ExplorerView): void {
  if (view.kind === 'preview') track('article_open', { article_id: view.articleId })
}

/** Estado del diálogo que muestra artículos relacionados y mapas sin salir de la página. */
export function useRelationExplorer(): RelationExplorer {
  const [history, setHistory] = useState<ExplorerView[]>([])
  const [open, setOpen] = useState(false)

  const start = useCallback((view: ExplorerView) => {
    setHistory([view])
    setOpen(true)
    trackView(view)
  }, [])

  const push = useCallback((view: ExplorerView) => {
    setHistory((previous) => [...previous, view])
    trackView(view)
  }, [])

  const openPreview = useCallback(
    (articleId: string, contextId: string) => start({ kind: 'preview', articleId, contextId }),
    [start],
  )
  const openMap = useCallback((centerId: string) => start({ kind: 'map', centerId }), [start])
  const back = useCallback(() => setHistory((previous) => previous.slice(0, -1)), [])
  const close = useCallback(() => setOpen(false), [])

  return useMemo(
    () => ({
      open,
      view: history[history.length - 1],
      canGoBack: history.length > 1,
      openPreview,
      openMap,
      push,
      back,
      close,
    }),
    [open, history, openPreview, openMap, push, back, close],
  )
}
