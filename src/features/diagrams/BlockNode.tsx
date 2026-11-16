import { Handle, Position, type NodeProps } from '@xyflow/react'
import styles from './RelationMap.module.css'
import type { BlockNodeType } from './relationGraph'

/** Nodo de grupo: un capítulo completo de la Constitución. */
export function BlockNode({ data }: NodeProps<BlockNodeType>) {
  return (
    <>
      <Handle
        type="target"
        position={Position.Top}
        className={styles.handle}
        isConnectable={false}
      />
      <div className={`${styles.node} ${styles.blockNode}`}>
        <span className={styles.nodeEpigraph}>{data.label}</span>
      </div>
    </>
  )
}
