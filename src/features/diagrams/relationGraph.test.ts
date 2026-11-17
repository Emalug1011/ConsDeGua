import { describe, expect, it } from 'vitest'
import { getRawRelations, getRelated } from '../constitution/catalog'
import { buildRelationGraph, type RelationFilters } from './relationGraph'
import { relatedFromMine } from '../relations/combine'
import { RELATION_TYPE_LABELS, REVIEW_LABELS } from './relationLabels'

const ALL: RelationFilters = {
  tipos: new Set(Object.keys(RELATION_TYPE_LABELS)),
  cotejos: new Set(Object.keys(REVIEW_LABELS)),
  origenes: new Set(['catalogo', 'propias']),
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

describe('buildRelationGraph con relaciones propias', () => {
  const propias = relatedFromMine('12', [
    {
      id: 'r1',
      desde: '12',
      hacia: '14',
      haciaBloque: null,
      tipo: 'garantia',
      nota: '',
      updatedAt: null,
    },
    {
      id: 'r2',
      desde: '12',
      hacia: null,
      haciaBloque: { titulo: 'II', capitulo: 'I' },
      tipo: 'remision',
      nota: '',
      updatedAt: null,
    },
  ])

  it('agrega las propias con su estilo y etiqueta "tuya"', () => {
    const graph = buildRelationGraph('12', ALL, propias)
    const own = graph.edges.filter((e) => e.data?.propia)
    expect(own.map((e) => e.id).sort()).toEqual(['propia-r1', 'propia-r2'])
    expect(own.every((e) => e.data?.label.includes('tuya'))).toBe(true)
    expect(graph.nodes.some((n) => n.type === 'block')).toBe(true)
  })

  it('filtra por origen: solo catálogo o solo mías', () => {
    const onlyCatalog = buildRelationGraph(
      '12',
      { ...ALL, origenes: new Set(['catalogo']) },
      propias,
    )
    expect(onlyCatalog.edges.some((e) => e.data?.propia)).toBe(false)
    const onlyMine = buildRelationGraph('12', { ...ALL, origenes: new Set(['propias']) }, propias)
    expect(onlyMine.edges.every((e) => e.data?.propia)).toBe(true)
    expect(onlyMine.edges).toHaveLength(2)
  })

  it('el artículo dentro del capítulo ve la relación propia como entrante', () => {
    const inBlock = relatedFromMine('10', [
      {
        id: 'r2',
        desde: '12',
        hacia: null,
        haciaBloque: { titulo: 'II', capitulo: 'I' },
        tipo: 'remision',
        nota: '',
        updatedAt: null,
      },
    ])
    expect(inBlock.bloques[0]).toMatchObject({ sentido: 'entrante', propiaId: 'r2' })
  })
})

describe('conexiones paralelas', () => {
  it('curva la segunda relación entre los mismos dos artículos', () => {
    const catalog = getRelated('12').articulos.find((r) => r.articulo.id === '14')
    expect(catalog).toBeDefined()
    const propias = relatedFromMine('12', [
      {
        id: 'r1',
        desde: '12',
        hacia: '14',
        haciaBloque: null,
        tipo: 'garantia',
        nota: '',
        updatedAt: null,
      },
    ])
    const edges = buildRelationGraph('12', ALL, propias).edges.filter(
      (e) => [e.source, e.target].sort().join('|') === '12|14',
    )
    expect(edges).toHaveLength(2)
    expect(edges.map((e) => e.data?.parallel ?? 0).sort()).toEqual([0, 1])
  })
})
