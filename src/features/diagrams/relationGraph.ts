/**
 * Arma el mapa de relaciones de un artículo a partir del catálogo: el artículo
 * al centro y sus vecinos en un anillo. Es lógica pura; no se guarda en Firestore.
 */
import type { Edge, Node } from '@xyflow/react'
import {
  UNDIRECTED_RELATION_TYPE,
  getArticle,
  getRelated,
  type Article,
  type RelatedArticle,
  type RelatedBlock,
} from '../constitution/catalog'
import { edgeLabel } from './relationLabels'

export interface RelationFilters {
  tipos: ReadonlySet<string>
  cotejos: ReadonlySet<string>
}

export type ArticleNodeData = { article: Article; center: boolean }
export type BlockNodeData = { label: string }
export type RelationEdgeData = {
  tipo: string
  cotejo: string
  label: string
  directed: boolean
  /** Id del marcador de flecha del lienzo donde se dibuja; lo asigna `RelationMap`. */
  markerId?: string
}

export type ArticleNodeType = Node<ArticleNodeData, 'article'>
export type BlockNodeType = Node<BlockNodeData, 'block'>
export type RelationNodeType = ArticleNodeType | BlockNodeType
export type RelationEdgeType = Edge<RelationEdgeData, 'relation'>

export interface RelationGraph {
  nodes: RelationNodeType[]
  edges: RelationEdgeType[]
  /** Relaciones visibles con los filtros, para la lista accesible. */
  articulos: RelatedArticle[]
  bloques: RelatedBlock[]
}

const RING_RADIUS = 340
const WIDE_RING_RADIUS = 400

function blockLabel(block: RelatedBlock['bloque']): string {
  return `Título ${block.titulo}, capítulo ${block.capitulo} (artículos ${block.desdeArticulo} a ${block.hastaArticulo})`
}

function blockNodeId(relation: RelatedBlock): string {
  const { titulo, capitulo } = relation.bloque
  return `bloque-${titulo}-${capitulo}`
}

function passes(filters: RelationFilters, tipo: string, cotejo: string): boolean {
  return filters.tipos.has(tipo) && filters.cotejos.has(cotejo)
}

/** Posiciones en anillo; con `nodeOrigin` [0.5, 0.5] son el centro de cada nodo. */
function ringPosition(index: number, total: number): { x: number; y: number } {
  const radius = total > 6 ? WIDE_RING_RADIUS : RING_RADIUS
  const angle = -Math.PI / 2 + (2 * Math.PI * index) / total
  return { x: Math.round(radius * Math.cos(angle)), y: Math.round(radius * Math.sin(angle)) }
}

export function buildRelationGraph(articleId: string, filters: RelationFilters): RelationGraph {
  const center = getArticle(articleId)
  if (!center) return { nodes: [], edges: [], articulos: [], bloques: [] }

  const related = getRelated(articleId)
  const articulos = related.articulos.filter((r) => passes(filters, r.tipo, r.cotejo))
  const bloques = related.bloques.filter((r) => passes(filters, r.tipo, r.cotejo))

  const neighbors: RelationNodeType[] = []
  const edges: RelationEdgeType[] = []

  for (const relation of articulos) {
    const other = relation.articulo
    neighbors.push({
      id: other.id,
      type: 'article',
      position: { x: 0, y: 0 },
      data: { article: other, center: false },
    })
    const outgoing = relation.sentido !== 'entrante'
    const source = outgoing ? center.id : other.id
    const target = outgoing ? other.id : center.id
    edges.push({
      id: `${source}->${target}`,
      type: 'relation',
      source,
      target,
      data: {
        tipo: relation.tipo,
        cotejo: relation.cotejo,
        label: edgeLabel(relation.tipo, relation.cotejo),
        directed: relation.tipo !== UNDIRECTED_RELATION_TYPE,
      },
    })
  }

  for (const relation of bloques) {
    const label = edgeLabel(relation.tipo, relation.cotejo)
    const directed = relation.tipo !== UNDIRECTED_RELATION_TYPE
    if (relation.sentido === 'saliente') {
      // El artículo central apunta a un capítulo completo.
      const id = blockNodeId(relation)
      neighbors.push({
        id,
        type: 'block',
        position: { x: 0, y: 0 },
        data: { label: blockLabel(relation.bloque) },
      })
      edges.push({
        id: `${center.id}->${id}`,
        type: 'relation',
        source: center.id,
        target: id,
        data: { tipo: relation.tipo, cotejo: relation.cotejo, label, directed },
      })
    } else {
      // El artículo central forma parte del bloque al que apunta otro artículo.
      const other = relation.articulo
      if (!neighbors.some((node) => node.id === other.id)) {
        neighbors.push({
          id: other.id,
          type: 'article',
          position: { x: 0, y: 0 },
          data: { article: other, center: false },
        })
      }
      edges.push({
        id: `${other.id}->${center.id}-bloque`,
        type: 'relation',
        source: other.id,
        target: center.id,
        data: {
          tipo: relation.tipo,
          cotejo: relation.cotejo,
          label: `${label} · a su capítulo`,
          directed,
        },
      })
    }
  }

  const centerNode: ArticleNodeType = {
    id: center.id,
    type: 'article',
    position: { x: 0, y: 0 },
    data: { article: center, center: true },
  }
  const placed = neighbors.map((node, index) => ({
    ...node,
    position: ringPosition(index, neighbors.length),
  }))

  return { nodes: [centerNode, ...placed], edges, articulos, bloques }
}
