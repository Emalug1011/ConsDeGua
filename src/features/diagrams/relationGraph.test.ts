import { describe, expect, it } from 'vitest'
import { getRawRelations, getRelated } from '../constitution/catalog'
import { buildRelationGraph, type RelationFilters } from './relationGraph'
import { RELATION_TYPE_LABELS, REVIEW_LABELS } from './relationLabels'

const ALL: RelationFilters = {
  tipos: new Set(Object.keys(RELATION_TYPE_LABELS)),
  cotejos: new Set(Object.keys(REVIEW_LABELS)),
}

describe('buildRelationGraph', () => {
  it('pone el artículo al centro y un nodo por vecino', () => {
    const related = getRelated('138')
    const graph = buildRelationGraph('138', ALL)

    expect(graph.nodes[0]).toMatchObject({ id: '138', data: { center: true } })
    expect(graph.nodes).toHaveLength(related.articulos.length + 1)
    expect(graph.edges).toHaveLength(related.articulos.length)
    const positions = graph.nodes.slice(1).map((n) => `${n.position.x},${n.position.y}`)
    expect(new Set(positions).size).toBe(positions.length)
  })

  it('respeta la dirección de cada relación y quita la flecha a las temáticas', () => {
    for (const relation of getRawRelations().entreArticulos.slice(0, 40)) {
      const edge = buildRelationGraph(relation.desde, ALL).edges.find(
        (e) => e.source === relation.desde && e.target === relation.hacia,
      )
      expect(edge, `${relation.desde}->${relation.hacia}`).toBeDefined()
      expect(edge?.data?.directed).toBe(relation.tipo !== 'tematica')
    }
  })

  it('marca como sugerida toda relación que no sea cita textual', () => {
    const graph = buildRelationGraph('138', ALL)
    for (const edge of graph.edges) {
      const suggested = edge.data?.cotejo !== 'cita_textual'
      expect(edge.data?.label.endsWith('· sugerida')).toBe(suggested)
    }
  })

  it('filtra por tipo y por cotejo', () => {
    const onlyLiteral = buildRelationGraph('278', { ...ALL, cotejos: new Set(['cita_textual']) })
    expect(onlyLiteral.edges.every((e) => e.data?.cotejo === 'cita_textual')).toBe(true)

    const none = buildRelationGraph('278', { ...ALL, tipos: new Set() })
    expect(none.nodes).toHaveLength(1)
    expect(none.edges).toEqual([])
  })

  it('muestra el capítulo como grupo para el 278 y la remisión al bloque para el 10', () => {
    const from278 = buildRelationGraph('278', ALL)
    expect(from278.nodes.some((n) => n.type === 'block')).toBe(true)

    const from10 = buildRelationGraph('10', ALL)
    const edge = from10.edges.find((e) => e.source === '278' && e.target === '10')
    expect(edge?.data?.label).toContain('a su capítulo')
  })

  it('devuelve un grafo vacío para un artículo que no existe', () => {
    expect(buildRelationGraph('999', ALL).nodes).toEqual([])
  })
})
