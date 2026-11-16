import { FirebaseError } from 'firebase/app'
import { doc, serverTimestamp, setDoc } from 'firebase/firestore'
import { db } from '../../config/firebase'

/**
 * Crea `metrics_daily/{day}/users/{uid}`. Si ya existía, las reglas rechazan
 * la escritura (no se permite actualizar) y se ignora: la persona ya contó ese día.
 */
export async function recordDailyActivity(uid: string, day: string): Promise<void> {
  try {
    await setDoc(doc(db, 'metrics_daily', day, 'users', uid), {
      firstSeenAt: serverTimestamp(),
    })
  } catch (error) {
    if (error instanceof FirebaseError && error.code === 'permission-denied') return
    throw error
  }
}
