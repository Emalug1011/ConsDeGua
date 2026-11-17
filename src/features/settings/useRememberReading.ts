import { useEffect } from 'react'
import { useAuth } from '../auth/useAuth'
import { saveLastArticle } from './service'
import { useUserSettings } from './useUserSettings'

/** Espera antes de guardar, para no escribir en cada artículo al pasar rápido de uno a otro. */
export const SAVE_READING_DELAY_MS = 2000

/** Si la persona activó la opción, guarda en su cuenta el artículo que está leyendo. */
export function useRememberReading(articleId: string | undefined): void {
  const { user } = useAuth()
  const state = useUserSettings()
  const uid = user?.uid
  const enabled = state.status === 'ready' && state.settings.rememberReading
  const saved = state.status === 'ready' ? state.settings.lastArticleId : null

  useEffect(() => {
    if (!uid || !enabled || !articleId || articleId === saved) return
    const timer = setTimeout(() => {
      // Si falla (sin conexión), se intenta de nuevo en el próximo artículo.
      saveLastArticle(uid, articleId).catch(() => undefined)
    }, SAVE_READING_DELAY_MS)
    return () => clearTimeout(timer)
  }, [uid, enabled, articleId, saved])
}
