import {
  Controls,
  ReactFlow,
  getViewportForBounds,
  type EdgeTypes,
  type NodeTypes,
  type Viewport,
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
      setSize(width > 0 && height > 0 ? { width, height } : null)
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
  const [viewport, setViewport] = useState<Viewport | null>(null)
  // Al cambiar el tamaño del lienzo o los nodos, se vuelve a centrar.
  const [fittedFor, setFittedFor] = useState<Viewport | null>(null)
  if (fitted !== fittedFor) {
    setFittedFor(fitted)
    setViewport(fitted)
  }

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
      {viewport && (
        <ReactFlow
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
          viewport={viewport}
          onViewportChange={setViewport}
          minZoom={MIN_ZOOM}
          maxZoom={MAX_ZOOM}
          ariaLabelConfig={ARIA_LABELS}
        >
          <Controls showInteractive={false} onFitView={() => setViewport(fitted)} />
        </ReactFlow>
      )}
    </div>
  )
}
