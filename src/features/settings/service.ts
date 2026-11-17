import {
  deleteField,
  doc,
  onSnapshot,
  serverTimestamp,
  updateDoc,
  type Timestamp,
} from 'firebase/firestore'
import { db } from '../../config/firebase'
import { DEFAULT_SETTINGS, type UserSettings } from './types'

function userRef(uid: string) {
  return doc(db, 'users', uid)
}

/** Ajustes de la persona; mientras no exista su perfil, los valores por omisión. */
export function subscribeToUserSettings(
  uid: string,
  onChange: (settings: UserSettings) => void,
  onError: (error: Error) => void,
): () => void {
  return onSnapshot(
    userRef(uid),
    (snapshot) => {
      const data = snapshot.data({ serverTimestamps: 'estimate' })
      if (!data) {
        onChange(DEFAULT_SETTINGS)
        return
      }
      const lastReadAt = data.lastReadAt as Timestamp | undefined
      onChange({
        rememberReading: data.rememberReading === true,
        lastArticleId: typeof data.lastArticleId === 'string' ? data.lastArticleId : null,
        lastReadAt: lastReadAt ? lastReadAt.toDate() : null,
      })
    },
    onError,
  )
}

/** Activa o desactiva la opción. Al desactivarla se borra el último artículo guardado. */
export async function setRememberReading(uid: string, enabled: boolean): Promise<void> {
  await updateDoc(
    userRef(uid),
    enabled
      ? { rememberReading: true }
      : { rememberReading: false, lastArticleId: deleteField(), lastReadAt: deleteField() },
  )
}

/** Guarda el último artículo abierto (solo se llama con la opción activada). */
export async function saveLastArticle(uid: string, articleId: string): Promise<void> {
  await updateDoc(userRef(uid), { lastArticleId: articleId, lastReadAt: serverTimestamp() })
}
