import { Controls, ReactFlow, type EdgeTypes, type NodeTypes } from '@xyflow/react'
import '@xyflow/react/dist/base.css'
import { ArticleNode } from './ArticleNode'
import { BlockNode } from './BlockNode'
import { RelationEdge } from './RelationEdge'
import { ARROW_MARKER_ID, type RelationEdgeType, type RelationNodeType } from './relationGraph'
import styles from './RelationMap.module.css'

const nodeTypes: NodeTypes = { article: ArticleNode, block: BlockNode }
const edgeTypes: EdgeTypes = { relation: RelationEdge }

const ARIA_LABELS = {
  'controls.ariaLabel': 'Controles del mapa',
  'controls.zoomIn.ariaLabel': 'Acercar',
  'controls.zoomOut.ariaLabel': 'Alejar',
  'controls.fitView.ariaLabel': 'Ajustar a la vista',
  'controls.interactive.ariaLabel': 'Bloquear el mapa',
}

interface RelationMapProps {
  nodes: RelationNodeType[]
  edges: RelationEdgeType[]
  /** Nombre accesible del lienzo. */
  label: string
}

/** Lienzo de solo lectura: se puede acercar y mover, no editar. */
export function RelationMap({ nodes, edges, label }: RelationMapProps) {
  return (
    <div className={styles.canvas} role="region" aria-label={label}>
      <svg className={styles.defs} aria-hidden="true">
        <defs>
          <marker
            id={ARROW_MARKER_ID}
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
      <ReactFlow
        nodes={nodes}
        edges={edges}
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
        fitView
        minZoom={0.3}
        maxZoom={1.5}
        ariaLabelConfig={ARIA_LABELS}
      >
        <Controls showInteractive={false} />
      </ReactFlow>
    </div>
  )
}
