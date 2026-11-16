import { Handle, Position, type NodeProps } from '@xyflow/react'
import { Link } from 'react-router'
import { articleLabel, articleShortLabel } from '../constitution/format'
import styles from './RelationMap.module.css'
import type { ArticleNodeType } from './relationGraph'

/** Nodo de artículo: número y epígrafe del catálogo, nunca editables. */
export function ArticleNode({ data }: NodeProps<ArticleNodeType>) {
  const { article, center } = data
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
        <Link
          to={`/relaciones/${article.id}`}
          className={`${styles.node} nodrag nopan`}
          aria-label={`Centrar el mapa en ${articleLabel(article)}${article.epigrafe ? `: ${article.epigrafe}` : ''}`}
        >
          {content}
        </Link>
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
