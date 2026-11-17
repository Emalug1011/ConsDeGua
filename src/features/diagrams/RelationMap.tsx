import {
  Controls,
  ReactFlow,
  getViewportForBounds,
  type EdgeTypes,
  type NodeTypes,
} from '@xyflow/react'
import { useEffect, useId, useMemo, useRef, useState } from 'react'
import '@xyflow/react/dist/base.css'
import { ArticleNode } from './ArticleNode'
import { BlockNode } from './BlockNode'
import { RelationEdge } from './RelationEdge'
import { graphBounds, type RelationEdgeType, type RelationNodeType } from './relationGraph'
import styles from './RelationMap.module.css'

const MIN_ZOOM = 0.3
const MAX_ZOOM = 1.5
const PADDING = 0.15

const nodeTypes: NodeTypes = { article: ArticleNode, block: BlockNode }
const edgeTypes: EdgeTypes = { relation: RelationEdge }

const ARIA_LABELS = {
  'controls.ariaLabel': 'Controles del mapa',
  'controls.zoomIn.ariaLabel': 'Acercar',
  'controls.zoomOut.ariaLabel': 'Alejar',
  'controls.fitView.ariaLabel': 'Ajustar a la vista',
  'controls.interactive.ariaLabel': 'Bloquear el mapa',
}

interface Size {
  width: number
  height: number
}

interface RelationMapProps {
  nodes: RelationNodeType[]
  edges: RelationEdgeType[]
  /** Nombre accesible del lienzo. */
  label: string
  /** Lienzo más bajo, para usarlo dentro de un diálogo. */
  compact?: boolean
}

/** Lienzo de solo lectura: se puede acercar y mover, no editar. */
export function RelationMap({ nodes, edges, label, compact = false }: RelationMapProps) {
  // Id único por lienzo: puede haber un mapa en la página y otro en un diálogo.
  const markerId = `flecha-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`
  const edgesWithMarker = useMemo(
    () => edges.map((edge) => (edge.data ? { ...edge, data: { ...edge.data, markerId } } : edge)),
    [edges, markerId],
  )

  // Tamaño real del lienzo. Dentro de un diálogo cerrado mide 0: React Flow
  // no se monta hasta que el lienzo es visible, así nunca se encuadra con 0.
  const container = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState<Size | null>(null)
  useEffect(() => {
    const element = container.current
    if (!element) return
    const observer = new ResizeObserver(([entry]) => {
      const width = entry?.contentRect.width ?? 0
      const height = entry?.contentRect.height ?? 0
      // Redondeado para no volver a montar por diferencias de subpíxeles.
      setSize((current) => {
        if (width <= 0 || height <= 0) return null
        const next = { width: Math.round(width), height: Math.round(height) }
        return current && current.width === next.width && current.height === next.height
          ? current
          : next
      })
    })
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  // Encuadre calculado con las posiciones conocidas de los nodos, sin esperar
  // a que React Flow los mida.
  const bounds = useMemo(() => graphBounds(nodes), [nodes])
  const fitted = useMemo(
    () =>
      size
        ? getViewportForBounds(bounds, size.width, size.height, MIN_ZOOM, MAX_ZOOM, PADDING)
        : null,
    [bounds, size],
  )
  // El encuadre se pasa como `defaultViewport` y el lienzo se vuelve a montar
  // cuando cambia (tamaño, filtros o "Ajustar a la vista"). Un viewport
  // controlado no sirve: al iniciar, React Flow emite su encuadre por defecto
  // (zoom 1 en el origen) y en pantallas angostas pisaba el calculado.
  const [resets, setResets] = useState(0)
  const flowKey = fitted ? `${fitted.x}|${fitted.y}|${fitted.zoom}|${resets}` : ''

  return (
    <div
      ref={container}
      className={`${styles.canvas} ${compact ? styles.compact : ''}`}
      role="region"
      aria-label={label}
    >
      <svg className={styles.defs} aria-hidden="true">
        <defs>
          <marker
            id={markerId}
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="8"
            markerHeight="8"
            orient="auto-start-reverse"
          >
            <path d="M0,0 L10,5 L0,10 z" className={styles.arrow} />
          </marker>
        </defs>
      </svg>
      {fitted && (
        <ReactFlow
          key={flowKey}
          nodes={nodes}
          edges={edgesWithMarker}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          nodeOrigin={[0.5, 0.5]}
          nodesDraggable={false}
          nodesConnectable={false}
          nodesFocusable={false}
          edgesFocusable={false}
          elementsSelectable={false}
          zoomOnScroll={false}
          zoomOnDoubleClick={false}
          preventScrolling={false}
          defaultViewport={fitted}
          minZoom={MIN_ZOOM}
          maxZoom={MAX_ZOOM}
          ariaLabelConfig={ARIA_LABELS}
        >
          <Controls showInteractive={false} onFitView={() => setResets((count) => count + 1)} />
        </ReactFlow>
      )}
    </div>
  )
}
