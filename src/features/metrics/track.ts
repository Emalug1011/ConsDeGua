import { logEvent } from 'firebase/analytics'
import { analytics } from '../../config/firebase'

/**
 * Eventos de Analytics y sus parámetros. Privacidad: solo ids y conteos;
 * nunca contenido, títulos, términos de búsqueda, correos ni nombres.
 * Agrega aquí cada evento nuevo, en snake_case.
 */
export interface EventParams {
  login: { method: 'google' }
  article_open: { article_id: string }
  article_search: { result_count: number }
  constitution_parts_open: undefined
  structure_map_open: undefined
  relation_map_open: { article_id: string }
  relation_create: { article_id: string }
  relation_update: { article_id: string }
  relation_delete: { article_id: string }
  diagram_create: undefined
  diagram_open: undefined
  diagram_export: undefined
  note_create: undefined
  note_open: undefined
  app_install: undefined
  account_delete: undefined
}

export type EventName = keyof EventParams

type ParamsArgs<E extends EventName> = EventParams[E] extends undefined ? [] : [EventParams[E]]

/** Registra un evento de uso. Si Analytics está bloqueado, no hace nada. */
export function track<E extends EventName>(event: E, ...params: ParamsArgs<E>): void {
  void analytics.then((instance) => {
    if (instance) logEvent(instance, event as string, params[0])
  })
}
