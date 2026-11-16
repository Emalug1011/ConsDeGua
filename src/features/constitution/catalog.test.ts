import { describe, expect, it } from 'vitest'
import { ARTICLE_ID_PATTERN } from '../../data/schema'
import {
  getArticle,
  getRawRelations,
  getRelated,
  getStructure,
  listArticles,
  listByBlock,
  search,
} from './catalog'

describe('integridad del catálogo', () => {
  const articles = listArticles()

  it('tiene 281 artículos y 27 disposiciones transitorias', () => {
    expect(articles).toHaveLength(308)
    expect(articles.filter((a) => !a.transitorio)).toHaveLength(281)
    expect(articles.filter((a) => a.transitorio)).toHaveLength(27)
  })

  it('usa ids 1 a 281 y T1 a T27, sin duplicados y en orden', () => {
    const expected = [
      ...Array.from({ length: 281 }, (_, i) => String(i + 1)),
      ...Array.from({ length: 27 }, (_, i) => `T${i + 1}`),
    ]
    expect(articles.map((a) => a.id)).toEqual(expected)
    for (const article of articles) {
      expect(article.id).toMatch(ARTICLE_ID_PATTERN)
      expect(article.transitorio).toBe(article.id.startsWith('T'))
    }
  })

  it('solo el artículo 256 y las transitorias 23 a 27 no tienen epígrafe', () => {
    const withoutEpigraph = articles.filter((a) => a.epigrafe === null).map((a) => a.id)
    expect(withoutEpigraph).toEqual(['256', 'T23', 'T24', 'T25', 'T26', 'T27'])
  })

  it('ningún texto incluye la fórmula de cierre ni las firmas', () => {
    expect(articles.filter((a) => /DADO EN EL SAL[ÓO]N/i.test(a.texto))).toEqual([])
    expect(getArticle('T27')?.texto).toMatch(/deberá tomar las medidas pertinentes\.$/)
  })

  it('cada párrafo del texto tiene contenido', () => {
    for (const article of articles) {
      for (const paragraph of article.texto.split('\n')) {
        expect(paragraph.trim(), article.id).not.toBe('')
      }
    }
  })

  it('solo el artículo 256 está derogado', () => {
    expect(articles.filter((a) => a.derogado).map((a) => a.id)).toEqual(['256'])
  })
})

describe('integridad de las relaciones', () => {
  const relations = getRawRelations()
  const tipos = Object.keys(relations.tipos)
  const cotejos = Object.keys(relations.cotejos)

  it('define los tipos y cotejos esperados y no está verificado', () => {
    expect(tipos.sort()).toEqual(['desarrollo', 'garantia', 'limite', 'remision', 'tematica'])
    expect(cotejos.sort()).toEqual(['cita_textual', 'pendiente', 'texto_leido'])
    expect(relations.verificado).toBe(false)
  })

  it('cada relación entre artículos usa ids existentes, tipo y cotejo definidos', () => {
    for (const relation of relations.entreArticulos) {
      expect(getArticle(relation.desde), relation.desde).toBeDefined()
      expect(getArticle(relation.hacia), relation.hacia).toBeDefined()
      expect(relation.desde).not.toBe(relation.hacia)
      expect(tipos).toContain(relation.tipo)
      expect(cotejos).toContain(relation.cotejo)
    }
  })

  it('no repite pares de artículos (en ningún sentido)', () => {
    const pairs = relations.entreArticulos.map((r) => [r.desde, r.hacia].sort().join('|'))
    const duplicated = pairs.filter((pair, index) => pairs.indexOf(pair) !== index)
    expect(duplicated).toEqual([])
  })

  it('cada relación hacia un bloque apunta a artículos y bloques existentes', () => {
    for (const relation of relations.haciaBloques) {
      expect(getArticle(relation.desde)).toBeDefined()
      expect(tipos).toContain(relation.tipo)
      expect(cotejos).toContain(relation.cotejo)
      const { titulo, capitulo, desdeArticulo, hastaArticulo } = relation.haciaBloque
      const block = listByBlock({ titulo, capitulo }).map((a) => a.id)
      expect(block[0]).toBe(desdeArticulo)
      expect(block[block.length - 1]).toBe(hastaArticulo)
    }
  })
})

describe('estructura', () => {
  it('incluye cada artículo exactamente una vez', () => {
    const ids = getStructure().flatMap((title) =>
      title.capitulos.flatMap((chapter) => [
        ...chapter.articulos.map((a) => a.id),
        ...chapter.secciones.flatMap((section) => section.articulos.map((a) => a.id)),
      ]),
    )
    expect(ids).toEqual(listArticles().map((a) => a.id))
  })

  it('agrupa por título sin repetir títulos', () => {
    const numbers = getStructure().map((title) => title.numero)
    expect(new Set(numbers).size).toBe(numbers.length)
  })

  it('filtra por sección', () => {
    const article = getArticle('47')
    expect(article?.seccion).toBeDefined()
    const section = listByBlock({
      titulo: article!.titulo.numero,
      capitulo: article!.capitulo.numero,
      seccion: article!.seccion!.numero,
    })
    expect(section.map((a) => a.id)).toContain('47')
    expect(section.every((a) => a.seccion?.numero === article!.seccion!.numero)).toBe(true)
  })
})

describe('búsqueda', () => {
  it('encuentra por número, con o sin prefijo', () => {
    expect(search('47')[0]?.id).toBe('47')
    expect(search('art. 47')[0]?.id).toBe('47')
    expect(search('Artículo 47')[0]?.id).toBe('47')
    expect(search('t23')[0]?.id).toBe('T23')
  })

  it('ignora tildes y mayúsculas al buscar en el epígrafe', () => {
    const epigraph = getArticle('1')!.epigrafe!
    const query = epigraph
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .toUpperCase()
    expect(search(query).map((a) => a.id)).toContain('1')
  })

  it('prioriza coincidencias en el epígrafe sobre el texto', () => {
    const results = search('familia')
    const firstTextOnly = results.findIndex((a) => !a.epigrafe?.toLowerCase().includes('familia'))
    const lastEpigraph = results.findLastIndex((a) => a.epigrafe?.toLowerCase().includes('familia'))
    expect(lastEpigraph).toBeGreaterThanOrEqual(0)
    if (firstTextOnly !== -1) expect(lastEpigraph).toBeLessThan(firstTextOnly)
  })

  it('respeta el límite y devuelve vacío sin consulta', () => {
    expect(search('de', 5)).toHaveLength(5)
    expect(search('   ')).toEqual([])
  })
})

describe('relaciones de un artículo', () => {
  it('devuelve las relaciones en ambos sentidos', () => {
    const { desde, hacia } = getRawRelations().entreArticulos[0]!
    expect(getRelated(desde).articulos.map((r) => r.articulo.id)).toContain(hacia)
    expect(getRelated(hacia).articulos.map((r) => r.articulo.id)).toContain(desde)
  })

  it('marca como sin dirección las relaciones temáticas', () => {
    const tematica = getRawRelations().entreArticulos.find((r) => r.tipo === 'tematica')!
    const related = getRelated(tematica.desde).articulos.find(
      (r) => r.articulo.id === tematica.hacia,
    )
    expect(related?.sentido).toBe('sin_direccion')
  })

  it('incluye la relación hacia un bloque para el artículo de origen y los del bloque', () => {
    const relation = getRawRelations().haciaBloques[0]!
    expect(getRelated(relation.desde).bloques[0]?.sentido).toBe('saliente')
    expect(getRelated(relation.haciaBloque.desdeArticulo).bloques[0]?.sentido).toBe('entrante')
  })

  it('devuelve vacío para un id que no existe', () => {
    expect(getRelated('999')).toEqual({ articulos: [], bloques: [] })
  })
})
