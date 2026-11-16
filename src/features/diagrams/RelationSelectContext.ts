import { createContext } from 'react'

/** Abre la vista previa de un artículo del mapa sin salir de la página. */
export const RelationSelectContext = createContext<((articleId: string) => void) | null>(null)
