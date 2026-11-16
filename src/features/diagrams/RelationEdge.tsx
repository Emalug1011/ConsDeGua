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

/** Conexión del mapa de relaciones: trazo según el tipo y etiqueta de texto siempre visible. */
export function RelationEdge({ source, target, data }: EdgeProps<RelationEdgeType>) {
  const sourceNode = useInternalNode(source)
  const targetNode = useInternalNode(target)
  if (!sourceNode || !targetNode || !data) return null

  const sourceCenter = nodeBox(sourceNode)
  const targetCenter = nodeBox(targetNode)
  const start = borderPoint(sourceNode, { x: targetCenter.cx, y: targetCenter.cy })
  const end = borderPoint(targetNode, { x: sourceCenter.cx, y: sourceCenter.cy })
  const [path, labelX, labelY] = getStraightPath({
    sourceX: start.x,
    sourceY: start.y,
    targetX: end.x,
    targetY: end.y,
  })

  return (
    <>
      <path
        d={path}
        className={`${styles.edge} ${TYPE_CLASS[data.tipo] ?? ''}`}
        markerEnd={data.directed && data.markerId ? `url(#${data.markerId})` : undefined}
      />
      <EdgeLabelRenderer>
        <div
          className={styles.edgeLabel}
          style={{ transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)` }}
        >
          {data.label}
        </div>
      </EdgeLabelRenderer>
    </>
  )
}
