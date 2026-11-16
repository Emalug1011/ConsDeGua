import type { Article, RelationDirection } from './catalog'

/** "Artículo 47" o "Disposición transitoria 23". El número sale del id del catálogo. */
export function articleLabel(article: Article): string {
  return article.transitorio
    ? `Disposición transitoria ${article.id.slice(1)}`
    : `Artículo ${article.id}`
}

/** Etiqueta corta para listas: "Art. 47" o "Trans. 23". */
export function articleShortLabel(article: Article): string {
  return article.transitorio ? `Trans. ${article.id.slice(1)}` : `Art. ${article.id}`
}

/** Ubicación en la estructura: "Título II · Capítulo II · Sección Primera". */
export function articleLocation(article: Article): string {
  const parts = [`Título ${article.titulo.numero}`, `Capítulo ${article.capitulo.numero}`]
  if (article.seccion) parts.push(`Sección ${article.seccion.numero}`)
  return parts.join(' · ')
}

const RELATION_PHRASES: Record<
  string,
  Record<Exclude<RelationDirection, 'sin_direccion'>, string>
> = {
  remision: { saliente: 'Remite a', entrante: 'Lo cita' },
  desarrollo: { saliente: 'Lo desarrolla', entrante: 'Desarrolla a' },
  garantia: { saliente: 'Lo garantiza', entrante: 'Garantiza a' },
  limite: { saliente: 'Lo limita', entrante: 'Limita a' },
}

/** Frase que describe la relación vista desde el artículo consultado. */
export function relationPhrase(tipo: string, sentido: RelationDirection): string {
  if (sentido === 'sin_direccion') return 'Tema afín'
  return RELATION_PHRASES[tipo]?.[sentido] ?? 'Relacionado con'
}
