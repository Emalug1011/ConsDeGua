import {
  EdgeLabelRenderer,
  getStraightPath,
  useInternalNode,
  type EdgeProps,
  type InternalNode,
} from '@xyflow/react'
import type { RelationEdgeType } from './relationGraph'
import styles from './RelationMap.module.css'

const TYPE_CLASS: Record<string, string | undefined> = {
  remision: styles.edgeRemision,
  desarrollo: styles.edgeDesarrollo,
  garantia: styles.edgeGarantia,
  limite: styles.edgeLimite,
  tematica: styles.edgeTematica,
}

interface Point {
  x: number
  y: number
}

function nodeBox(node: InternalNode) {
  const width = node.measured.width ?? 0
  const height = node.measured.height ?? 0
  const { x, y } = node.internals.positionAbsolute
  return { cx: x + width / 2, cy: y + height / 2, halfW: width / 2, halfH: height / 2 }
}

/** Punto donde la recta hacia `toward` cruza el borde del nodo, para que la flecha no quede tapada. */
function borderPoint(node: InternalNode, toward: Point): Point {
  const { cx, cy, halfW, halfH } = nodeBox(node)
  const dx = toward.x - cx
  const dy = toward.y - cy
  if ((dx === 0 && dy === 0) || halfW === 0 || halfH === 0) return { x: cx, y: cy }
  const scale = 1 / Math.max(Math.abs(dx) / halfW, Math.abs(dy) / halfH)
  return { x: cx + dx * scale, y: cy + dy * scale }
}

/** Separación entre conexiones paralelas (mismo par de nodos). */
const PARALLEL_OFFSET = 48
/** Posición de la etiqueta de una conexión paralela a lo largo del trazo (0 a 1). */
const LABEL_POSITION = 0.25

/**
 * Curva para la segunda (o siguiente) conexión entre los mismos dos nodos, para
 * que no quede encima de la primera ni se mezclen sus etiquetas.
 */
function curvedPath(start: Point, end: Point, parallel: number): [string, number, number] {
  const dx = end.x - start.x
  const dy = end.y - start.y
  const length = Math.hypot(dx, dy) || 1
  // Perpendicular a la recta; alterna de lado en cada conexión paralela.
  const side = parallel % 2 === 1 ? 1 : -1
  const offset = side * PARALLEL_OFFSET * Math.ceil(parallel / 2)
  const cx = (start.x + end.x) / 2 + (-dy / length) * offset
  const cy = (start.y + end.y) / 2 + (dx / length) * offset
  // La etiqueta va a un cuarto del trazo (no al centro, donde está la de la
  // primera conexión), en el punto de la curva cuadrática para t = 0.25.
  const t = LABEL_POSITION
  const labelX = (1 - t) ** 2 * start.x + 2 * (1 - t) * t * cx + t ** 2 * end.x
  const labelY = (1 - t) ** 2 * start.y + 2 * (1 - t) * t * cy + t ** 2 * end.y
  return [`M ${start.x},${start.y} Q ${cx},${cy} ${end.x},${end.y}`, labelX, labelY]
}

/** Conexión del mapa de relaciones: trazo según el tipo y etiqueta de texto siempre visible. */
export function RelationEdge({ source, target, data }: EdgeProps<RelationEdgeType>) {
  const sourceNode = useInternalNode(source)
  const targetNode = useInternalNode(target)
  if (!sourceNode || !targetNode || !data) return null

  const sourceCenter = nodeBox(sourceNode)
  const targetCenter = nodeBox(targetNode)
  const start = borderPoint(sourceNode, { x: targetCenter.cx, y: targetCenter.cy })
  const end = borderPoint(targetNode, { x: sourceCenter.cx, y: sourceCenter.cy })
  const [path, labelX, labelY] = data.parallel
    ? curvedPath(start, end, data.parallel)
    : getStraightPath({ sourceX: start.x, sourceY: start.y, targetX: end.x, targetY: end.y })

  return (
    <>
      <path
        d={path}
        className={`${styles.edge} ${TYPE_CLASS[data.tipo] ?? ''} ${data.propia ? styles.edgeOwn : ''}`}
        markerEnd={data.directed && data.markerId ? `url(#${data.markerId})` : undefined}
      />
      <EdgeLabelRenderer>
        <div
          className={`${styles.edgeLabel} ${data.propia ? styles.edgeLabelOwn : ''}`}
          style={{ transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)` }}
        >
          {data.label}
        </div>
      </EdgeLabelRenderer>
    </>
  )
}
