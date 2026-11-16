import { z } from 'zod'

/** Id de un artículo del catálogo: "1" a "281" o "T1" a "T27". */
export const ARTICLE_ID_PATTERN = /^(?:[1-9]\d{0,2}|T[1-9]\d?)$/

const articleIdSchema = z.string().regex(ARTICLE_ID_PATTERN)

const blockSchema = z.strictObject({
  numero: z.string().min(1),
  nombre: z.string().min(1),
})

export const articleSchema = z.strictObject({
  id: articleIdSchema,
  transitorio: z.boolean(),
  epigrafe: z.string().min(1).nullable(),
  titulo: blockSchema,
  capitulo: blockSchema,
  seccion: blockSchema.optional(),
  texto: z.string().min(1),
  derogado: z.boolean().optional(),
})

const articleRelationSchema = z.strictObject({
  desde: articleIdSchema,
  hacia: articleIdSchema,
  tipo: z.string(),
  nota: z.string().min(1),
  cotejo: z.string(),
})

const blockRelationSchema = z.strictObject({
  desde: articleIdSchema,
  haciaBloque: z.strictObject({
    titulo: z.string().min(1),
    capitulo: z.string().min(1),
    desdeArticulo: articleIdSchema,
    hastaArticulo: articleIdSchema,
  }),
  tipo: z.string(),
  nota: z.string().min(1),
  cotejo: z.string(),
})

export const catalogSchema = z.strictObject({
  ley: z.string().min(1),
  notas: z.array(z.string()),
  fuenteTexto: z.string().min(1),
  articulos: z.array(articleSchema),
  relaciones: z.strictObject({
    advertencia: z.string().min(1),
    verificado: z.boolean(),
    tipos: z.record(z.string(), z.string()),
    cotejos: z.record(z.string(), z.string()),
    entreArticulos: z.array(articleRelationSchema),
    haciaBloques: z.array(blockRelationSchema),
  }),
})

export type Catalog = z.infer<typeof catalogSchema>
export type Article = z.infer<typeof articleSchema>
export type ArticleBlock = z.infer<typeof blockSchema>
export type ArticleRelation = z.infer<typeof articleRelationSchema>
export type BlockRelation = z.infer<typeof blockRelationSchema>
