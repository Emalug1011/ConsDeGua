/**
 * Único punto de acceso al catálogo de la Constitución.
 * Ningún otro módulo importa `constitucion.json` directamente.
 */
import rawCatalog from '../../data/constitucion.json'
import {
  catalogSchema,
  type Article,
  type ArticleBlock,
  type BlockRelation,
  type Catalog,
} from '../../data/schema'

export type { Article, ArticleBlock } from '../../data/schema'

const catalog: Catalog = catalogSchema.parse(rawCatalog)

const articlesById = new Map(catalog.articulos.map((article) => [article.id, article]))

// ---------------------------------------------------------------------------
// Artículos
// ---------------------------------------------------------------------------

export function listArticles(): readonly Article[] {
  return catalog.articulos
}

export function getArticle(id: string): Article | undefined {
  return articlesById.get(id)
}

export interface CatalogInfo {
  ley: string
  notas: readonly string[]
  fuenteTexto: string
}

export function getCatalogInfo(): CatalogInfo {
  return { ley: catalog.ley, notas: catalog.notas, fuenteTexto: catalog.fuenteTexto }
}

// ---------------------------------------------------------------------------
// Estructura: título → capítulo → sección → artículos
// ---------------------------------------------------------------------------

export interface BlockFilter {
  titulo: string
  capitulo?: string
  seccion?: string
}

/** Artículos de un título, capítulo o sección (por su `numero`), en orden del catálogo. */
export function listByBlock(filter: BlockFilter): Article[] {
  return catalog.articulos.filter(
    (article) =>
      article.titulo.numero === filter.titulo &&
      (filter.capitulo === undefined || article.capitulo.numero === filter.capitulo) &&
      (filter.seccion === undefined || article.seccion?.numero === filter.seccion),
  )
}

export interface SectionNode extends ArticleBlock {
  articulos: Article[]
}

export interface ChapterNode extends ArticleBlock {
  /** Artículos del capítulo que no pertenecen a ninguna sección. */
  articulos: Article[]
  secciones: SectionNode[]
}

export interface TitleNode extends ArticleBlock {
  capitulos: ChapterNode[]
}

function lastOf<T>(items: T[]): T | undefined {
  return items[items.length - 1]
}

function buildStructure(articles: readonly Article[]): TitleNode[] {
  const titles: TitleNode[] = []
  for (const article of articles) {
    let title = lastOf(titles)
    if (title?.numero !== article.titulo.numero) {
      title = { ...article.titulo, capitulos: [] }
      titles.push(title)
    }
    let chapter = lastOf(title.capitulos)
    if (chapter?.numero !== article.capitulo.numero) {
      chapter = { ...article.capitulo, articulos: [], secciones: [] }
      title.capitulos.push(chapter)
    }
    if (article.seccion === undefined) {
      chapter.articulos.push(article)
      continue
    }
    let section = lastOf(chapter.secciones)
    if (section?.numero !== article.seccion.numero) {
      section = { ...article.seccion, articulos: [] }
      chapter.secciones.push(section)
    }
    section.articulos.push(article)
  }
  return titles
}

const structure = buildStructure(catalog.articulos)

export function getStructure(): readonly TitleNode[] {
  return structure
}

// ---------------------------------------------------------------------------
// Búsqueda
// ---------------------------------------------------------------------------

/** Minúsculas y sin tildes, para comparar sin importar acentos. */
export function normalizeText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
}

const searchIndex = catalog.articulos.map((article) => ({
  article,
  epigrafe: normalizeText(article.epigrafe ?? ''),
  texto: normalizeText(article.texto),
}))

const ID_QUERY = /^(?:art(?:iculo)?\.?\s*)?(t?\s*\d{1,3})$/

/**
 * Busca por número ("47", "art. 47", "T23"), epígrafe o texto.
 * Orden: coincidencia de número, luego epígrafe, luego texto.
 */
export function search(query: string, limit = 50): Article[] {
  const normalized = normalizeText(query.trim())
  if (normalized.length === 0) return []

  const idMatch = ID_QUERY.exec(normalized)
  const byId = idMatch?.[1] ? getArticle(idMatch[1].replace(/\s/g, '').toUpperCase()) : undefined

  const inEpigraph: Article[] = []
  const inText: Article[] = []
  for (const entry of searchIndex) {
    if (entry.article === byId) continue
    if (entry.epigrafe.includes(normalized)) inEpigraph.push(entry.article)
    else if (entry.texto.includes(normalized)) inText.push(entry.article)
  }

  return [...(byId ? [byId] : []), ...inEpigraph, ...inText].slice(0, limit)
}

// ---------------------------------------------------------------------------
// Relaciones (análisis sugerido, no oficial)
// ---------------------------------------------------------------------------

export type RelationDirection = 'saliente' | 'entrante' | 'sin_direccion'

export interface RelatedArticle {
  /** El otro artículo de la relación. */
  articulo: Article
  tipo: string
  nota: string
  cotejo: string
  sentido: RelationDirection
}

export interface RelatedBlock {
  /** Artículo que se relaciona con el bloque. */
  articulo: Article
  bloque: BlockRelation['haciaBloque']
  tipo: string
  nota: string
  cotejo: string
  /** `saliente` si el artículo consultado es el que apunta al bloque; `entrante` si forma parte del bloque. */
  sentido: Exclude<RelationDirection, 'sin_direccion'>
}

export interface RelatedResult {
  articulos: RelatedArticle[]
  bloques: RelatedBlock[]
}

export const UNDIRECTED_RELATION_TYPE = 'tematica'
export const LITERAL_CITATION = 'cita_textual'

function requireArticle(id: string): Article {
  const article = getArticle(id)
  if (!article) throw new Error(`El catálogo no tiene el artículo ${id}.`)
  return article
}

function isInBlock(article: Article, block: BlockRelation['haciaBloque']): boolean {
  if (article.transitorio) return false
  const value = Number(article.id)
  return value >= Number(block.desdeArticulo) && value <= Number(block.hastaArticulo)
}

export function getRelated(id: string): RelatedResult {
  const article = getArticle(id)
  if (!article) return { articulos: [], bloques: [] }

  const articulos: RelatedArticle[] = []
  for (const relation of catalog.relaciones.entreArticulos) {
    if (relation.desde !== id && relation.hacia !== id) continue
    const outgoing = relation.desde === id
    articulos.push({
      articulo: requireArticle(outgoing ? relation.hacia : relation.desde),
      tipo: relation.tipo,
      nota: relation.nota,
      cotejo: relation.cotejo,
      sentido:
        relation.tipo === UNDIRECTED_RELATION_TYPE
          ? 'sin_direccion'
          : outgoing
            ? 'saliente'
            : 'entrante',
    })
  }

  const bloques: RelatedBlock[] = []
  for (const relation of catalog.relaciones.haciaBloques) {
    const outgoing = relation.desde === id
    if (!outgoing && !isInBlock(article, relation.haciaBloque)) continue
    bloques.push({
      articulo: requireArticle(relation.desde),
      bloque: relation.haciaBloque,
      tipo: relation.tipo,
      nota: relation.nota,
      cotejo: relation.cotejo,
      sentido: outgoing ? 'saliente' : 'entrante',
    })
  }

  return { articulos, bloques }
}

export interface RelationsInfo {
  advertencia: string
  verificado: boolean
  tipos: Readonly<Record<string, string>>
  cotejos: Readonly<Record<string, string>>
}

export function getRelationsInfo(): RelationsInfo {
  const { advertencia, verificado, tipos, cotejos } = catalog.relaciones
  return { advertencia, verificado, tipos, cotejos }
}

/** Solo para pruebas de integridad del catálogo. */
export function getRawRelations(): Catalog['relaciones'] {
  return catalog.relaciones
}
