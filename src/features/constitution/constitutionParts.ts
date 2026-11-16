/**
 * División doctrinal de la Constitución en tres partes. La agrupación y las
 * descripciones son material de estudio, no texto de la Constitución; los
 * títulos y los rangos de artículos salen del catálogo.
 */
import { getStructure, type Article, type TitleNode } from './catalog'

interface PartDefinition {
  id: 'dogmatica' | 'organica' | 'practica'
  nombre: string
  descripcion: string
  titulos: readonly string[]
}

const PART_DEFINITIONS: readonly PartDefinition[] = [
  {
    id: 'dogmatica',
    nombre: 'Parte dogmática',
    descripcion:
      'Reconoce los derechos de las personas y establece los fines y deberes del Estado frente a ellas.',
    titulos: ['I', 'II'],
  },
  {
    id: 'organica',
    nombre: 'Parte orgánica',
    descripcion:
      'Organiza el Estado: su forma de gobierno, los organismos que ejercen el poder público y la estructura de sus instituciones.',
    titulos: ['III', 'IV', 'V'],
  },
  {
    id: 'practica',
    nombre: 'Parte práctica o procesal',
    descripcion:
      'Establece los medios para defender los derechos y el orden constitucional, y el procedimiento para reformar la Constitución.',
    titulos: ['VI', 'VII'],
  },
]

/** Título de disposiciones transitorias y finales, que queda fuera de las tres partes. */
export const TRANSITIONAL_TITLE = 'VIII'

export interface ConstitutionPart extends Omit<PartDefinition, 'titulos'> {
  titulos: TitleNode[]
  primero: Article
  ultimo: Article
  total: number
}

function articlesOf(title: TitleNode): Article[] {
  return title.capitulos.flatMap((chapter) => [
    ...chapter.articulos,
    ...chapter.secciones.flatMap((section) => section.articulos),
  ])
}

function requireTitle(numero: string): TitleNode {
  const title = getStructure().find((t) => t.numero === numero)
  if (!title) throw new Error(`El catálogo no tiene el Título ${numero}.`)
  return title
}

export function getConstitutionParts(): ConstitutionPart[] {
  return PART_DEFINITIONS.map((definition) => {
    const titulos = definition.titulos.map(requireTitle)
    const articles = titulos.flatMap(articlesOf)
    const primero = articles[0]
    const ultimo = articles[articles.length - 1]
    if (!primero || !ultimo) throw new Error(`${definition.nombre} no tiene artículos.`)
    return { ...definition, titulos, primero, ultimo, total: articles.length }
  })
}

export function getTransitionalTitle(): { titulo: TitleNode; total: number } {
  const titulo = requireTitle(TRANSITIONAL_TITLE)
  return { titulo, total: articlesOf(titulo).length }
}
