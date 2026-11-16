import { Handle, Position, type NodeProps } from '@xyflow/react'
import { use } from 'react'
import { articleLabel, articleShortLabel } from '../constitution/format'
import styles from './RelationMap.module.css'
import type { ArticleNodeType } from './relationGraph'
import { RelationSelectContext } from './RelationSelectContext'

/** Nodo de artículo: número y epígrafe del catálogo, nunca editables. */
export function ArticleNode({ data }: NodeProps<ArticleNodeType>) {
  const { article, center } = data
  const onSelect = use(RelationSelectContext)
  const content = (
    <>
      <span className={styles.nodeNumber}>{articleShortLabel(article)}</span>
      <span className={styles.nodeEpigraph}>{article.epigrafe ?? 'Sin epígrafe'}</span>
    </>
  )

  return (
    <>
      <Handle
        type="target"
        position={Position.Top}
        className={styles.handle}
        isConnectable={false}
      />
      {center ? (
        <div className={`${styles.node} ${styles.centerNode}`}>{content}</div>
      ) : (
        <button
          type="button"
          className={`${styles.node} nodrag nopan`}
          onClick={() => onSelect?.(article.id)}
          aria-label={`Ver ${articleLabel(article)}${article.epigrafe ? `: ${article.epigrafe}` : ''}`}
        >
          {content}
        </button>
      )}
      <Handle
        type="source"
        position={Position.Bottom}
        className={styles.handle}
        isConnectable={false}
      />
    </>
  )
}
