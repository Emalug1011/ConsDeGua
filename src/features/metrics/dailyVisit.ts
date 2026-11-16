import { ensureUserProfile } from '../auth/service'
import type { AuthUser } from '../auth/types'
import { dayInGuatemala } from './day'
import { recordDailyActivity } from './service'

const STORAGE_PREFIX = 'constgua:ultimaVisita:'

function readLastVisit(uid: string): string | null {
  try {
    return localStorage.getItem(STORAGE_PREFIX + uid)
  } catch {
    return null
  }
}

function saveLastVisit(uid: string, day: string): void {
  try {
    localStorage.setItem(STORAGE_PREFIX + uid, day)
  } catch {
    // Sin almacenamiento local se vuelve a intentar en la próxima carga; las reglas evitan duplicados.
  }
}

/**
 * Como máximo una vez por día por persona: actualiza `users/{uid}` y crea su
 * documento en `metrics_daily`. Solo guarda la fecha en el navegador, nunca tokens.
 */
export async function registerDailyVisit(user: AuthUser, now: Date = new Date()): Promise<void> {
  const day = dayInGuatemala(now)
  if (readLastVisit(user.uid) === day) return
  await ensureUserProfile(user)
  await recordDailyActivity(user.uid, day)
  saveLastVisit(user.uid, day)
}
