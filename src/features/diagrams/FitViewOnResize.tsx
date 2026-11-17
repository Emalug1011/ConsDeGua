import { useNodesInitialized, useReactFlow } from '@xyflow/react'
import { useEffect, type RefObject } from 'react'

const FIT_OPTIONS = { padding: 0.15 }

interface FitViewOnResizeProps {
  /** Contenedor del lienzo, para saber cuándo tiene tamaño real. */
  container: RefObject<HTMLDivElement | null>
}

/**
 * Centra el mapa cuando el lienzo ya tiene tamaño y cada vez que cambia.
 * Dentro de un diálogo, React Flow se monta antes de que el diálogo se
 * muestre (tamaño 0), y el `fitView` inicial quedaría descentrado.
 */
export function FitViewOnResize({ container }: FitViewOnResizeProps) {
  const { fitView } = useReactFlow()
  const nodesReady = useNodesInitialized()

  useEffect(() => {
    const element = container.current
    if (!element || !nodesReady) return
    const fit = () => {
      if (element.clientWidth > 0 && element.clientHeight > 0) void fitView(FIT_OPTIONS)
    }
    fit()
    const observer = new ResizeObserver(fit)
    observer.observe(element)
    return () => observer.disconnect()
  }, [container, nodesReady, fitView])

  return null
}
