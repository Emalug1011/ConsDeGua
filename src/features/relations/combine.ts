/**
 * Convierte las relaciones propias de la persona al mismo formato que las del
 * catálogo (`RelatedResult`), marcadas con `propiaId` y cotejo `propia`, para
 * mostrarlas junto a ellas sin mezclarlas.
 */
import {
  OWN_RELATION,
  UNDIRECTED_RELATION_TYPE,
  getArticle,
  getBlock,
  isInBlock,
  type RelatedArticle,
  type RelatedBlock,
  type RelatedResult,
} from '../constitution/catalog'
import type { UserRelation } from './types'

export function relatedFromMine(
  articleId: string,
  relations: readonly UserRelation[],
): RelatedResult {
  const article = getArticle(articleId)
  if (!article) return { articulos: [], bloques: [] }

  const articulos: RelatedArticle[] = []
  const bloques: RelatedBlock[] = []

  for (const relation of relations) {
    if (relation.hacia) {
      if (relation.desde !== articleId && relation.hacia !== articleId) continue
      const outgoing = relation.desde === articleId
      const other = getArticle(outgoing ? relation.hacia : relation.desde)
      if (!other) continue
      articulos.push({
        articulo: other,
        tipo: relation.tipo,
        nota: relation.nota,
        cotejo: OWN_RELATION,
        sentido:
          relation.tipo === UNDIRECTED_RELATION_TYPE
            ? 'sin_direccion'
            : outgoing
              ? 'saliente'
              : 'entrante',
        propiaId: relation.id,
      })
      continue
    }

    if (relation.haciaBloque) {
      const block = getBlock(relation.haciaBloque.titulo, relation.haciaBloque.capitulo)
      const from = getArticle(relation.desde)
      if (!block || !from) continue
      const outgoing = relation.desde === articleId
      if (!outgoing && !isInBlock(article, block)) continue
      bloques.push({
        articulo: from,
        bloque: block,
        tipo: relation.tipo,
        nota: relation.nota,
        cotejo: OWN_RELATION,
        sentido: outgoing ? 'saliente' : 'entrante',
        propiaId: relation.id,
      })
    }
  }

  return { articulos, bloques }
}
