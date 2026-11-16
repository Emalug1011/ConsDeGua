import { LITERAL_CITATION } from '../constitution/catalog'

/** Nombres de los tipos de relación para la interfaz. Las definiciones vienen del catálogo. */
export const RELATION_TYPE_LABELS: Readonly<Record<string, string>> = {
  remision: 'Remisión',
  desarrollo: 'Desarrollo',
  garantia: 'Garantía',
  limite: 'Límite',
  tematica: 'Temática',
}

export const REVIEW_LABELS: Readonly<Record<string, string>> = {
  cita_textual: 'Cita textual',
  texto_leido: 'Texto leído',
  pendiente: 'Pendiente',
}

export function relationTypeLabel(tipo: string): string {
  return RELATION_TYPE_LABELS[tipo] ?? tipo
}

export function reviewLabel(cotejo: string): string {
  return REVIEW_LABELS[cotejo] ?? cotejo
}

/** Etiqueta visible de una conexión: el tipo y, si no es cita textual, que es sugerida. */
export function edgeLabel(tipo: string, cotejo: string): string {
  const label = relationTypeLabel(tipo)
  return cotejo === LITERAL_CITATION ? label : `${label} · sugerida`
}
